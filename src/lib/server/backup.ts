import "server-only";
import { GUIDES } from "@/lib/care-guide/guides-data";
import { mergeGuides, nextContentId } from "@/lib/care-guide/guide-merge";
import { slugEquals } from "@/lib/care-guide/slug";
import type { GuideContent, ImprovementKind, ImprovementRequest, ImprovementStatus, SourceFile, VersionHistoryEntry } from "@/lib/care-guide/types";
import { AttachmentError, guideFileUrl, readAttachmentFile, requestFileUrl, saveAttachment } from "./attachments";
import { ApiFail } from "./errors";
import { sanitizeGuide } from "./guide-validate";
import { checkDoc, emptyDoc, loadDoc, seedById, type GuideDoc, type GuideRecord } from "./guides";
import { looksLikePersonalData } from "./pii";
import { STATUSES, checkRequestDoc, emptyRequestDoc, loadRequestDoc, toPublicRequest, type RequestDoc, type StoredRequest } from "./requests";
import { readJsonStrict, sha256Hex, updateJsonStrict, writeFileAtomic } from "./store";

/**
 * 관리자 백업·복구.
 *
 * 내보내기(backup 파일)
 * - 서버에 저장된 "CMS 콘텐츠 변경분"과 "개선 요청"만 담습니다. 비밀키·관리자 비밀번호·직원 명단·접속 기록·개인 보관함은 담지 않습니다.
 * - 기존 안내 88건(코드에 포함)은 담지 않고, 관리자가 수정한 기존 안내(modifiedSeed)와 새로 등록한 안내(added)를 구분해 담습니다.
 * - 요청자 내부 ID와 개선 요청의 첨부 파일(환자 정보가 찍혀 있을 수 있음)은 담지 않습니다.
 * - 안내문 원본 첨부는 관리자가 명시적으로 선택할 때만 담습니다.
 *
 * 가져오기(복구)
 * - 1단계 미리보기: 무엇이 새로 추가되고 무엇이 현재와 다른지 보여 줍니다(아무것도 바꾸지 않음).
 * - 2단계 적용: 관리자가 확인한 뒤에만 실행합니다. 기본은 "없는 것만 추가"이며, 같은 ID의 기존 콘텐츠는 관리자가 하나씩 선택한 것만 덮어씁니다.
 * - 적용 직전에 현재 데이터를 서버 폴더(cms/backups/)에 자동으로 복사해 둡니다.
 */
export const BACKUP_FORMAT = "hycg-backup";
export const LEGACY_FORMAT = "hycg-browser-legacy";
const SCHEMA_VERSION = 1;
const MAX_IMPORT_BYTES = 40 * 1024 * 1024;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  exportedAt: string;
  source: { seedGuideCount: number; guideRevision: number; requestRevision: number };
  guides: { modifiedSeed: GuideContent[]; added: GuideContent[] };
  requests: ImprovementRequest[];
  omitted: { requestAttachments: number; guideSourceFiles: "included" | "omitted" };
  checksum: string;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === "object" && !Array.isArray(v);

function checksumOf(guides: BackupFile["guides"], requests: ImprovementRequest[]): string {
  return `sha256:${sha256Hex(JSON.stringify({ guides, requests }))}`;
}

// ───────────────────────── 내보내기 ─────────────────────────

export async function buildBackup(options: { includeFiles: boolean }): Promise<BackupFile> {
  const [gdoc, rdoc] = await Promise.all([loadDoc(), loadRequestDoc()]);
  const modifiedSeed: GuideContent[] = [];
  const added: GuideContent[] = [];
  for (const r of gdoc.records) {
    let guide = r.guide;
    if (guide.sourceFiles?.length) {
      if (options.includeFiles) {
        const files: SourceFile[] = [];
        for (const f of guide.sourceFiles) {
          const fileId = f.dataUrl.split("/").pop() ?? "";
          const file = await readAttachmentFile("guides", guide.contentId, fileId);
          if (file) files.push({ name: f.name, type: file.type, size: file.bytes.length, dataUrl: `data:${file.type};base64,${file.bytes.toString("base64")}` });
        }
        guide = { ...guide, sourceFiles: files.length ? files : undefined };
      } else {
        guide = { ...guide };
        delete guide.sourceFiles;
      }
    }
    (seedById(guide.contentId) ? modifiedSeed : added).push(guide);
  }
  let attachments = 0;
  const requests = rdoc.requests.map((r) => {
    const pub = toPublicRequest(r);
    if (pub.attachment) {
      attachments += 1;
      delete pub.attachment;
    }
    return pub;
  });
  const guides = { modifiedSeed, added };
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: { seedGuideCount: GUIDES.length, guideRevision: gdoc.revision, requestRevision: rdoc.revision },
    guides,
    requests,
    omitted: { requestAttachments: attachments, guideSourceFiles: options.includeFiles ? "included" : "omitted" },
    checksum: checksumOf(guides, requests),
  };
}

// ───────────────────────── 가져오기: 읽기·검증 ─────────────────────────

interface ParsedImport {
  kind: "backup" | "legacy";
  guides: unknown[];
  requests: unknown[];
  /** 백업을 만들 때 제외된 개선 요청 첨부 파일 수(백업 파일에 기록된 값) */
  omittedRequestAttachments: number;
}

export function parseImport(input: unknown): ParsedImport {
  if (!isObj(input)) throw new ApiFail(400, "백업 파일 형식이 올바르지 않습니다.");
  if (JSON.stringify(input).length > MAX_IMPORT_BYTES) throw new ApiFail(400, "백업 파일이 너무 큽니다.");

  if (input.format === BACKUP_FORMAT) {
    if (typeof input.schemaVersion !== "number" || input.schemaVersion > SCHEMA_VERSION) {
      throw new ApiFail(400, "이 앱보다 새로운 버전의 백업 파일입니다. 앱을 최신 버전으로 맞춘 뒤 다시 시도하세요.");
    }
    const g = isObj(input.guides) ? input.guides : null;
    if (!g || !Array.isArray(g.modifiedSeed) || !Array.isArray(g.added) || !Array.isArray(input.requests)) {
      throw new ApiFail(400, "백업 파일에 필요한 항목이 없습니다.");
    }
    const expected = checksumOf({ modifiedSeed: g.modifiedSeed as GuideContent[], added: g.added as GuideContent[] }, input.requests as ImprovementRequest[]);
    if (input.checksum !== expected) throw new ApiFail(400, "백업 파일이 수정되었거나 손상되었습니다(검증 값이 맞지 않음). 내보낸 원본 파일을 사용하세요.");
    const omitted = isObj(input.omitted) && typeof input.omitted.requestAttachments === "number" ? input.omitted.requestAttachments : 0;
    return { kind: "backup", guides: [...g.modifiedSeed, ...g.added], requests: input.requests, omittedRequestAttachments: omitted };
  }

  if (input.format === LEGACY_FORMAT) {
    // 이전 방식(브라우저 저장소)에 남아 있던 데이터를 서버로 옮길 때 화면이 만들어 보내는 형식입니다.
    const stored = Array.isArray(input.guides) ? (input.guides as unknown[]) : [];
    const guides = stored.filter((raw) => {
      if (!isObj(raw) || typeof raw.contentId !== "string") return true;
      const seed = seedById(raw.contentId);
      if (!seed) return true; // 시드에 없는 것은 관리자가 새로 등록한 콘텐츠
      if (typeof raw.slug === "string" && !slugEquals(seed.slug, raw.slug)) return true; // 번호만 같고 주소가 다르면 다른 콘텐츠(예전에 새로 등록한 것)
      // 기존 안내는 "관리자가 실제로 고친 것"만 옮깁니다(수정 이력이 있거나 게시 상태가 시드와 다른 것).
      return (Array.isArray(raw.versionHistory) && raw.versionHistory.length > 0) || raw.status !== seed.status;
    });
    return { kind: "legacy", guides, requests: Array.isArray(input.requests) ? (input.requests as unknown[]) : [], omittedRequestAttachments: 0 };
  }
  throw new ApiFail(400, "HY CARE GUIDE 백업 파일이 아닙니다.");
}

function cleanHistory(v: unknown): VersionHistoryEntry[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: VersionHistoryEntry[] = [];
  for (const h of v.slice(0, 500)) {
    if (!isObj(h) || typeof h.version !== "number" || typeof h.date !== "string" || typeof h.summary !== "string") continue;
    out.push({
      version: h.version,
      date: h.date.slice(0, 40),
      summary: h.summary.slice(0, 300),
      ...(typeof h.requestId === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(h.requestId) ? { requestId: h.requestId } : {}),
    });
  }
  return out;
}

export interface ImportedGuide {
  guide: GuideContent;
  rawSourceFiles: unknown;
}

/** 가져올 콘텐츠 한 건을 검사·정리합니다(복구용이라 버전 이력·등록일은 그대로 보존). 실패하면 사유를 돌려줍니다. */
function prepareGuide(raw: unknown): { ok: true; value: ImportedGuide } | { ok: false; label: string; reason: string } {
  const label = isObj(raw) && typeof raw.title === "string" ? raw.title : "(제목 없음)";
  try {
    const { guide, rawSourceFiles } = sanitizeGuide(raw);
    const o = raw as Obj;
    const history = cleanHistory(o.versionHistory);
    if (history) guide.versionHistory = history;
    // 시드가 아닌(새로 등록한) 콘텐츠에 의료 검토 값이 없으면 안전하게 "검토 대기"로 둡니다.
    if (!seedById(guide.contentId) && !guide.medicalReview) guide.medicalReview = "pending";
    return { ok: true, value: { guide, rawSourceFiles } };
  } catch (e) {
    return { ok: false, label, reason: e instanceof ApiFail ? e.message : "형식을 확인할 수 없습니다." };
  }
}

const KINDS: ImprovementKind[] = ["error", "improvement", "inconvenience"];

interface ImportedRequest {
  request: ImprovementRequest;
  rawAttachment?: { name?: unknown; dataUrl?: unknown };
}

function prepareRequest(raw: unknown): { ok: true; value: ImportedRequest } | { ok: false; label: string; reason: string } {
  const label = isObj(raw) && typeof raw.requestId === "string" ? raw.requestId : "(번호 없음)";
  if (!isObj(raw)) return { ok: false, label, reason: "형식을 확인할 수 없습니다." };
  const requestId = typeof raw.requestId === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.requestId) ? raw.requestId : null;
  const kind = KINDS.find((k) => k === raw.kind);
  const status = STATUSES.find((s) => s === raw.status) as ImprovementStatus | undefined;
  const message = typeof raw.message === "string" ? raw.message.normalize("NFC").trim() : "";
  const contentId = typeof raw.contentId === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.contentId) ? raw.contentId : null;
  if (!requestId || !kind || !status || !message || !contentId) return { ok: false, label, reason: "필수 항목이 없거나 올바르지 않습니다." };
  if (message.length > 3000) return { ok: false, label, reason: "요청 내용이 너무 깁니다." };
  if (looksLikePersonalData(message)) return { ok: false, label, reason: "주민등록번호·전화번호처럼 보이는 숫자가 있어 가져오지 않습니다." };
  const request: ImprovementRequest = {
    requestId,
    contentId,
    contentTitle: typeof raw.contentTitle === "string" ? raw.contentTitle.normalize("NFC").slice(0, 200) : contentId,
    contentVersion: typeof raw.contentVersion === "number" && Number.isInteger(raw.contentVersion) ? raw.contentVersion : 1,
    kind,
    message,
    requesterDepartment: typeof raw.requesterDepartment === "string" ? raw.requesterDepartment.normalize("NFC").slice(0, 40) : "",
    status,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt.slice(0, 40) : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt.slice(0, 40) : new Date().toISOString(),
  };
  if (typeof raw.adminNote === "string" && raw.adminNote.trim()) request.adminNote = raw.adminNote.normalize("NFC").slice(0, 2000);
  if (typeof raw.appliedVersion === "number" && Number.isInteger(raw.appliedVersion)) request.appliedVersion = raw.appliedVersion;
  const att = isObj(raw.attachment) && typeof raw.attachment.dataUrl === "string" && raw.attachment.dataUrl.startsWith("data:") ? raw.attachment : undefined;
  return { ok: true, value: { request, rawAttachment: att as ImportedRequest["rawAttachment"] } };
}

// ───────────────────────── 가져오기: 계획(미리보기)과 적용 ─────────────────────────

/** 키 순서와 무관한 비교용 문자열 */
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (isObj(v)) {
    return `{${Object.keys(v)
      .filter((k) => v[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable(v[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

/** 서버 전용 파일 참조(첨부)는 비교에서 제외합니다. */
function comparable(g: GuideContent): string {
  const copy: Partial<GuideContent> = { ...g };
  delete copy.sourceFiles;
  return stable(copy);
}

export type PlanState = "new" | "same" | "differs" | "conflict";

export interface GuidePlanItem {
  contentId: string;
  title: string;
  kind: "seed-modified" | "added";
  state: PlanState;
  detail?: string;
  /** 현재 서버 값과 백업 값의 요약(덮어쓰기 판단용) */
  current?: { version: number; lastUpdated: string; status: string };
  incoming: { version: number; lastUpdated: string; status: string; medicalReview?: string };
}

export interface RequestPlanItem {
  requestId: string;
  title: string;
  state: "new" | "same" | "differs";
}

export interface RestorePlan {
  source: "backup" | "legacy";
  /** 백업 파일에서 제외되어 복구할 수 없는 개선 요청 첨부 파일 수 */
  omittedRequestAttachments: number;
  guides: GuidePlanItem[];
  requests: RequestPlanItem[];
  skipped: Array<{ type: "guide" | "request"; label: string; reason: string }>;
  summary: { guidesNew: number; guidesSame: number; guidesDiffer: number; guidesConflict: number; requestsNew: number; requestsExisting: number; skipped: number };
  revisions: { guides: number; requests: number };
}

interface WorkingPlan {
  plan: RestorePlan;
  guides: Array<{ item: GuidePlanItem; data: ImportedGuide }>;
  requests: Array<{ item: RequestPlanItem; data: ImportedRequest }>;
  gdoc: GuideDoc;
  rdoc: RequestDoc;
}

async function buildPlan(input: unknown): Promise<WorkingPlan> {
  const parsed = parseImport(input);
  const [gdoc, rdoc] = await Promise.all([loadDoc(), loadRequestDoc()]);
  const skipped: RestorePlan["skipped"] = [];
  const all = mergeGuides(GUIDES, gdoc.records.map((r) => r.guide));
  const byId = new Map(all.map((g) => [g.contentId, g]));

  const guides: WorkingPlan["guides"] = [];
  const seenIds = new Set<string>();
  const takenSlugs: string[] = [];
  for (const raw of parsed.guides) {
    const prepared = prepareGuide(raw);
    if (!prepared.ok) {
      skipped.push({ type: "guide", label: prepared.label, reason: prepared.reason });
      continue;
    }
    const g = prepared.value.guide;
    // 이전 방식(브라우저) 데이터의 새 콘텐츠는 그때의 번호를 썼기 때문에, 이후 코드에 추가된 기본 안내나 서버의 다른 콘텐츠와
    // 번호가 겹칠 수 있습니다. 주소(slug)가 다른데 번호만 같다면 다른 콘텐츠이므로 새 번호를 받아 추가합니다.
    let reassignedFrom: string | undefined;
    if (parsed.kind === "legacy") {
      const same = byId.get(g.contentId);
      if (same && !slugEquals(same.slug, g.slug)) {
        reassignedFrom = g.contentId;
        g.contentId = nextContentId([...all, ...guides.map((x) => x.data.guide), { contentId: g.contentId }]);
      }
      // 예전 방식으로 새로 등록했던 콘텐츠는 이전하면서 의료진 검토를 다시 받도록 항상 "검토 대기"로 저장합니다
      // (예전 화면에서 "완료"로 되어 있었더라도 환자에게 바로 공개되지 않게).
      if (!seedById(g.contentId)) {
        g.medicalReview = "pending";
        delete g.medicalReviewedAt;
      }
    }
    if (seenIds.has(g.contentId)) {
      skipped.push({ type: "guide", label: g.title, reason: "백업 안에 같은 ID가 두 번 들어 있습니다." });
      continue;
    }
    seenIds.add(g.contentId);
    const seed = seedById(g.contentId);
    const current = byId.get(g.contentId);
    const item: GuidePlanItem = {
      contentId: g.contentId,
      title: g.title,
      kind: seed ? "seed-modified" : "added",
      state: "new",
      incoming: { version: g.version, lastUpdated: g.lastUpdated, status: g.status, medicalReview: g.medicalReview },
    };
    if (reassignedFrom) item.detail = `번호 ${reassignedFrom}가 다른 안내와 겹쳐 새 번호 ${g.contentId}로 추가합니다.`;
    if (seed && g.version < seed.version) {
      // 코드에 들어 있는 기본 안내가 가져올 수정본보다 새 버전이면, 가져온 뒤에는 새 내용 대신 예전 수정본이 화면에 쓰입니다.
      item.detail = `${item.detail ? item.detail + " " : ""}주의: 코드의 기본 안내(v${seed.version})가 이 수정본(v${g.version})보다 새 버전입니다. 가져오면 기본 안내의 최신 내용 대신 이 수정본이 쓰이므로, 가져온 뒤 내용을 확인해 주세요.`;
    }
    if (current) {
      item.current = { version: current.version, lastUpdated: current.lastUpdated, status: current.status };
      const hasServerRecord = gdoc.records.some((r) => r.guide.contentId === g.contentId);
      // 서버에 이 콘텐츠의 변경 기록이 없으면(코드의 기본 안내 그대로) 백업의 수정본은 "덮어쓰기"가 아니라 "추가"입니다.
      item.state = comparable(current) === comparable(g) ? "same" : hasServerRecord ? "differs" : "new";
      if (item.state === "new") {
        item.detail = [item.detail, "기본 안내를 수정한 내용을 추가합니다(코드의 기본 안내는 그대로 두고 서버에 수정본을 저장)."].filter(Boolean).join(" ");
      }
    }
    // 주소 충돌: 기존 안내의 주소는 바꿀 수 없고, 다른 콘텐츠와 주소가 겹치면 가져오지 않습니다.
    if (seed && !slugEquals(seed.slug, g.slug)) {
      item.state = "conflict";
      item.detail = "기존 안내의 주소(URL)와 달라 가져올 수 없습니다.";
    } else if (all.some((o) => o.contentId !== g.contentId && slugEquals(o.slug, g.slug)) || takenSlugs.some((s) => slugEquals(s, g.slug))) {
      item.state = "conflict";
      item.detail = `다른 콘텐츠가 이미 이 주소를 쓰고 있습니다: ${g.slug}`;
    }
    takenSlugs.push(g.slug);
    guides.push({ item, data: prepared.value });
  }

  const requests: WorkingPlan["requests"] = [];
  const existingReq = new Map(rdoc.requests.map((r) => [r.requestId, r]));
  for (const raw of parsed.requests) {
    const prepared = prepareRequest(raw);
    if (!prepared.ok) {
      skipped.push({ type: "request", label: prepared.label, reason: prepared.reason });
      continue;
    }
    const r = prepared.value.request;
    const cur = existingReq.get(r.requestId);
    // 이전 방식(브라우저) 데이터는 번호가 서버의 요청과 겹칠 수 있어 새 번호를 받으므로 항상 "새 요청"입니다.
    const state: RequestPlanItem["state"] = parsed.kind === "legacy" || !cur ? "new" : stable(toPublicRequest(cur)) === stable({ ...r, attachment: cur.attachment }) ? "same" : "differs";
    requests.push({ item: { requestId: r.requestId, title: r.contentTitle, state }, data: prepared.value });
  }

  const gi = guides.map((g) => g.item);
  const plan: RestorePlan = {
    source: parsed.kind,
    omittedRequestAttachments: parsed.omittedRequestAttachments,
    guides: gi,
    requests: requests.map((r) => r.item),
    skipped,
    summary: {
      guidesNew: gi.filter((g) => g.state === "new").length,
      guidesSame: gi.filter((g) => g.state === "same").length,
      guidesDiffer: gi.filter((g) => g.state === "differs").length,
      guidesConflict: gi.filter((g) => g.state === "conflict").length,
      requestsNew: requests.filter((r) => r.item.state === "new").length,
      requestsExisting: requests.filter((r) => r.item.state !== "new").length,
      skipped: skipped.length,
    },
    revisions: { guides: gdoc.revision, requests: rdoc.revision },
  };
  return { plan, guides, requests, gdoc, rdoc };
}

/** 미리보기: 아무것도 바꾸지 않고 무엇이 어떻게 바뀔지만 계산합니다. */
export async function previewRestore(input: unknown): Promise<RestorePlan> {
  return (await buildPlan(input)).plan;
}

export interface RestoreDecisions {
  /** 서버에 없는 콘텐츠·요청을 추가할지(기본 true) */
  addNew: boolean;
  /** 현재와 다른 기존 콘텐츠 중 백업 내용으로 덮어쓸 contentId(하나씩 명시한 것만) */
  overwriteContentIds: string[];
  /** 미리보기 때의 저장 상태 번호. 그 뒤 데이터가 바뀌었으면 적용하지 않습니다. */
  expectedRevisions: { guides: number; requests: number };
}

export interface RestoreResult {
  guidesAdded: number;
  guidesOverwritten: number;
  guidesSkipped: number;
  requestsAdded: number;
  requestsSkipped: number;
  /** 적용 직전 데이터를 복사해 둔 서버 폴더(상대 경로) */
  snapshot: string;
}

async function snapshotCurrent(): Promise<string> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = `cms/backups/${stamp}`;
  for (const name of ["guides", "requests"]) {
    const data = await readJsonStrict<unknown>(`cms/${name}.json`, null);
    if (data !== null) await writeFileAtomic(`${dir}/${name}.json`, JSON.stringify(data));
  }
  return dir;
}

async function importGuideFiles(contentId: string, raw: unknown): Promise<SourceFile[] | undefined> {
  if (!Array.isArray(raw)) return undefined;
  const out: SourceFile[] = [];
  for (const f of raw.slice(0, 5)) {
    if (!isObj(f) || typeof f.dataUrl !== "string" || !f.dataUrl.startsWith("data:")) continue; // 파일 내용이 없는 참조는 건너뜁니다.
    try {
      const saved = await saveAttachment("guides", contentId, f.name, f.dataUrl);
      out.push({ name: saved.name, type: saved.type, size: saved.size, dataUrl: guideFileUrl(contentId, saved.fileId) });
    } catch (e) {
      if (!(e instanceof AttachmentError)) throw e;
    }
  }
  return out.length ? out : undefined;
}

export async function applyRestore(input: unknown, decisions: RestoreDecisions): Promise<RestoreResult> {
  const work = await buildPlan(input);
  if (work.plan.revisions.guides !== decisions.expectedRevisions.guides || work.plan.revisions.requests !== decisions.expectedRevisions.requests) {
    throw new ApiFail(409, "미리보기 이후 서버의 데이터가 바뀌었습니다. 파일을 다시 선택해 미리보기부터 다시 확인해 주세요.");
  }
  const overwrite = new Set(decisions.overwriteContentIds);
  const snapshot = await snapshotCurrent();
  const result: RestoreResult = { guidesAdded: 0, guidesOverwritten: 0, guidesSkipped: 0, requestsAdded: 0, requestsSkipped: 0, snapshot };

  // 1) 콘텐츠
  await updateJsonStrict<unknown, void>("cms/guides.json", emptyDoc(), async (raw) => {
    const doc = checkDoc(raw);
    let changed = false;
    for (const { item, data } of work.guides) {
      const idx = doc.records.findIndex((r) => r.guide.contentId === item.contentId);
      const doAdd = item.state === "new" && decisions.addNew;
      const doOverwrite = item.state === "differs" && overwrite.has(item.contentId);
      if (!doAdd && !doOverwrite) {
        if (item.state !== "same") result.guidesSkipped += 1;
        continue;
      }
      const sourceFiles = await importGuideFiles(item.contentId, data.rawSourceFiles);
      const guide: GuideContent = { ...data.guide, ...(sourceFiles ? { sourceFiles } : {}) };
      // 덮어쓸 때 이미 서버에 있는 첨부 원본이 백업에 없다면 그대로 보존합니다.
      if (!sourceFiles && idx >= 0 && doc.records[idx].guide.sourceFiles) guide.sourceFiles = doc.records[idx].guide.sourceFiles;
      const record: GuideRecord = { guide, updatedAt: new Date().toISOString() };
      const seed = seedById(item.contentId);
      // 수정본이 기본 안내보다 낮은 버전이면 그 버전을 기준으로 남겨, 기본 안내가 더 새롭다는 알림(seedNewerIds)이 관리자 화면에 뜨게 합니다.
      if (seed) record.baseSeedVersion = Math.min(idx >= 0 ? doc.records[idx].baseSeedVersion ?? seed.version : seed.version, item.incoming.version);
      if (idx >= 0) doc.records[idx] = record;
      else doc.records.push(record);
      changed = true;
      if (doAdd) result.guidesAdded += 1;
      else result.guidesOverwritten += 1;
    }
    if (changed) doc.revision += 1;
  });

  // 2) 개선 요청(기존 요청은 덮어쓰지 않고 새 요청만 추가)
  await updateJsonStrict<unknown, void>("cms/requests.json", emptyRequestDoc(), async (raw) => {
    const doc = checkRequestDoc(raw);
    const ids = new Set(doc.requests.map((r) => r.requestId));
    const maxNum = () => doc.requests.map((r) => Number(r.requestId.replace(/[^0-9]/g, ""))).filter((n) => !Number.isNaN(n)).reduce((a, b) => Math.max(a, b), 0);
    let changed = false;
    for (const { item, data } of work.requests) {
      if (item.state !== "new" || !decisions.addNew) {
        if (item.state !== "same") result.requestsSkipped += 1;
        continue;
      }
      const r: ImprovementRequest = { ...data.request };
      // 번호가 이미 있으면(이전 방식 데이터 등) 새 번호를 받습니다.
      if (ids.has(r.requestId) || work.plan.source === "legacy") r.requestId = `r${String(maxNum() + 1).padStart(3, "0")}`;
      const stored: StoredRequest = { ...r, requesterUid: "restored" };
      if (data.rawAttachment && typeof data.rawAttachment.dataUrl === "string") {
        try {
          const saved = await saveAttachment("requests", r.requestId, data.rawAttachment.name, data.rawAttachment.dataUrl);
          stored.attachment = { name: saved.name, type: saved.type, size: saved.size, dataUrl: requestFileUrl(r.requestId) };
          stored.attachmentFileId = saved.fileId;
        } catch (e) {
          if (!(e instanceof AttachmentError)) throw e; // 첨부만 건너뛰고 요청 본문은 가져옵니다.
        }
      }
      ids.add(r.requestId);
      doc.requests.push(stored);
      doc.requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      changed = true;
      result.requestsAdded += 1;
    }
    if (changed) doc.revision += 1;
  });

  return result;
}
