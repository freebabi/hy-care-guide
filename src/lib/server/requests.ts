import "server-only";
import type { ImprovementKind, ImprovementRequest, ImprovementStatus, SourceFile } from "@/lib/care-guide/types";
import { AttachmentError, requestFileUrl, saveAttachment } from "./attachments";
import { ApiFail } from "./errors";
import { listAllGuides } from "./guides";
import { StoreCorruptError, readJsonStrict, updateJsonStrict } from "./store";
import { looksLikePersonalData } from "./pii";

/**
 * 개선 요청 서버 저장소(cms/requests.json).
 * - 직원은 요청을 제출하고 "본인이 낸 요청"만 볼 수 있습니다. 관리자는 모든 요청을 보고 처리합니다.
 * - 요청자는 내부적으로 사용자 ID만 보관해 본인 확인에 쓰며, 응답에는 내보내지 않습니다(화면에는 요청 부서만 표시).
 * - 환자 이름·등록번호 같은 개인정보로 보이는 숫자(주민번호·전화번호)가 있으면 저장하지 않습니다.
 * - 첨부 파일은 데이터 폴더의 별도 파일로 저장하고, 응답에는 내려받기 주소만 넣습니다(요청자 본인·관리자만 열 수 있음).
 */
const FILE = "cms/requests.json";
const SCHEMA_VERSION = 1;
const MAX_REQUESTS = 5000;
const MAX_PER_HOUR = 20;
const KINDS: ImprovementKind[] = ["error", "improvement", "inconvenience"];
export const STATUSES: ImprovementStatus[] = ["received", "reviewing", "approved", "applied", "rejected"];

export interface StoredRequest extends ImprovementRequest {
  /** 요청자 본인 확인용 내부 ID(응답에는 포함하지 않음) */
  requesterUid: string;
  /** 첨부 파일 ID(내부용) */
  attachmentFileId?: string;
}

export interface RequestDoc {
  schemaVersion: number;
  revision: number;
  requests: StoredRequest[];
}

export function emptyRequestDoc(): RequestDoc {
  return { schemaVersion: SCHEMA_VERSION, revision: 0, requests: [] };
}

export function checkRequestDoc(doc: unknown): RequestDoc {
  const d = doc as Partial<RequestDoc> | null;
  if (!d || typeof d !== "object" || typeof d.schemaVersion !== "number" || typeof d.revision !== "number" || !Array.isArray(d.requests)) {
    throw new StoreCorruptError(FILE, "문서 형식이 올바르지 않습니다");
  }
  if (d.schemaVersion > SCHEMA_VERSION) throw new StoreCorruptError(FILE, "더 새로운 버전의 앱이 저장한 데이터입니다");
  for (const r of d.requests) {
    if (!r || typeof r.requestId !== "string" || typeof r.contentId !== "string" || typeof r.message !== "string") {
      throw new StoreCorruptError(FILE, "요청 기록 형식이 올바르지 않습니다");
    }
  }
  return d as RequestDoc;
}

export async function loadRequestDoc(): Promise<RequestDoc> {
  return checkRequestDoc(await readJsonStrict<unknown>(FILE, emptyRequestDoc()));
}

/** 응답용: 내부 필드(요청자 ID·첨부 파일 ID)를 뺀 사본 */
export function toPublicRequest(r: StoredRequest): ImprovementRequest {
  const copy: Partial<StoredRequest> = { ...r };
  delete copy.requesterUid;
  delete copy.attachmentFileId;
  return copy as ImprovementRequest;
}

function newRequestId(existing: StoredRequest[]): string {
  const max = existing.map((r) => Number(r.requestId.replace(/[^0-9]/g, ""))).filter((n) => !Number.isNaN(n)).reduce((a, b) => Math.max(a, b), 0);
  return `r${String(max + 1).padStart(3, "0")}`;
}

export async function listRequests(viewer: { uid: string; isAdmin: boolean }): Promise<ImprovementRequest[]> {
  const doc = await loadRequestDoc();
  const list = viewer.isAdmin ? doc.requests : doc.requests.filter((r) => r.requesterUid === viewer.uid);
  return list.map(toPublicRequest);
}

export async function getRequestForFile(requestId: string, viewer: { uid: string; isAdmin: boolean }): Promise<StoredRequest | null> {
  const doc = await loadRequestDoc();
  const r = doc.requests.find((x) => x.requestId === requestId);
  if (!r || (!viewer.isAdmin && r.requesterUid !== viewer.uid)) return null;
  return r;
}

export interface NewRequestBody {
  contentId: unknown;
  kind: unknown;
  message: unknown;
  requesterDepartment: unknown;
  attachment?: unknown;
}

export async function createRequest(uid: string, isAdmin: boolean, body: NewRequestBody): Promise<ImprovementRequest> {
  const kind = KINDS.find((k) => k === body.kind);
  if (!kind) throw new ApiFail(400, "요청 유형이 올바르지 않습니다.");
  const message = typeof body.message === "string" ? body.message.normalize("NFC").trim() : "";
  if (!message) throw new ApiFail(400, "요청 내용을 입력해 주세요.");
  if (message.length > 3000) throw new ApiFail(400, "요청 내용은 3000자 이하로 입력해 주세요.");
  if (looksLikePersonalData(message)) {
    throw new ApiFail(400, "요청 내용에 주민등록번호나 전화번호처럼 보이는 숫자가 있습니다. 환자 개인정보는 적지 마세요.");
  }
  const department = typeof body.requesterDepartment === "string" ? body.requesterDepartment.normalize("NFC").trim() : "";
  if (!department) throw new ApiFail(400, "요청 부서를 선택해 주세요.");
  if (department.length > 40) throw new ApiFail(400, "요청 부서 이름이 너무 깁니다.");
  const contentId = typeof body.contentId === "string" ? body.contentId : "";

  // 대상 콘텐츠는 서버가 직접 찾아 제목·버전을 정합니다(화면이 보낸 값은 쓰지 않음). 직원은 비게시 콘텐츠를 볼 수 없으므로 요청도 할 수 없습니다.
  const guide = (await listAllGuides()).find((g) => g.contentId === contentId);
  if (!guide || (!isAdmin && guide.status !== "게시")) throw new ApiFail(404, "요청 대상 안내를 찾을 수 없습니다.");

  return updateJsonStrict<unknown, ImprovementRequest>(FILE, emptyRequestDoc(), async (raw) => {
    const doc = checkRequestDoc(raw);
    const now = new Date().toISOString();
    const hourAgo = Date.now() - 60 * 60 * 1000;
    if (doc.requests.filter((r) => r.requesterUid === uid && new Date(r.createdAt).getTime() > hourAgo).length >= MAX_PER_HOUR) {
      throw new ApiFail(429, "짧은 시간에 요청을 너무 많이 등록했습니다. 잠시 후 다시 시도해 주세요.");
    }
    if (doc.requests.length >= MAX_REQUESTS) throw new ApiFail(400, "저장할 수 있는 요청 수를 넘었습니다. 관리자에게 문의하세요.");
    const requestId = newRequestId(doc.requests);

    let attachment: SourceFile | undefined;
    let attachmentFileId: string | undefined;
    const rawAtt = body.attachment as { name?: unknown; dataUrl?: unknown } | undefined | null;
    if (rawAtt) {
      if (typeof rawAtt.dataUrl !== "string") throw new ApiFail(400, "첨부 파일 정보가 올바르지 않습니다.");
      try {
        const saved = await saveAttachment("requests", requestId, rawAtt.name, rawAtt.dataUrl);
        attachment = { name: saved.name, type: saved.type, size: saved.size, dataUrl: requestFileUrl(requestId) };
        attachmentFileId = saved.fileId;
      } catch (e) {
        if (e instanceof AttachmentError) throw new ApiFail(400, e.message);
        throw e;
      }
    }

    const stored: StoredRequest = {
      requestId,
      contentId: guide.contentId,
      contentTitle: guide.title,
      contentVersion: guide.version,
      kind,
      message,
      requesterDepartment: department,
      status: "received",
      createdAt: now,
      updatedAt: now,
      requesterUid: uid,
      ...(attachment ? { attachment, attachmentFileId } : {}),
    };
    doc.requests.unshift(stored);
    doc.revision += 1;
    return toPublicRequest(stored);
  });
}

export interface RequestPatch {
  status?: unknown;
  adminNote?: unknown;
  appliedVersion?: unknown;
}

/** 요청 처리(관리자 전용 API에서만 호출) */
export function updateRequestAdmin(requestId: string, patch: RequestPatch): Promise<ImprovementRequest> {
  return updateJsonStrict<unknown, ImprovementRequest>(FILE, emptyRequestDoc(), (raw) => {
    const doc = checkRequestDoc(raw);
    const r = doc.requests.find((x) => x.requestId === requestId);
    if (!r) throw new ApiFail(404, "요청을 찾을 수 없습니다.");
    if (patch.status !== undefined) {
      const status = STATUSES.find((s) => s === patch.status);
      if (!status) throw new ApiFail(400, "처리 상태가 올바르지 않습니다.");
      r.status = status;
    }
    if (patch.adminNote !== undefined) {
      if (patch.adminNote !== null && typeof patch.adminNote !== "string") throw new ApiFail(400, "관리자 메모가 올바르지 않습니다.");
      const note = typeof patch.adminNote === "string" ? patch.adminNote.normalize("NFC").trim().slice(0, 2000) : "";
      if (note) r.adminNote = note;
      else delete r.adminNote;
    }
    if (patch.appliedVersion !== undefined) {
      if (typeof patch.appliedVersion !== "number" || !Number.isInteger(patch.appliedVersion) || patch.appliedVersion < 1) {
        throw new ApiFail(400, "반영 버전이 올바르지 않습니다.");
      }
      r.appliedVersion = patch.appliedVersion;
    }
    r.updatedAt = new Date().toISOString();
    doc.revision += 1;
    return toPublicRequest(r);
  });
}
