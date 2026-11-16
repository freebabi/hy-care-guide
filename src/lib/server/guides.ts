import "server-only";
import { GUIDES } from "@/lib/care-guide/guides-data";
import { mergeGuides, nextContentId, scrubForPatient } from "@/lib/care-guide/guide-merge";
import { isMedicalReviewPending, isPatientVisible, medicalReviewOnSave, NEW_CONTENT_MEDICAL_REVIEW } from "@/lib/care-guide/review";
import { slugEquals } from "@/lib/care-guide/slug";
import type { GuideContent, SourceFile, VersionHistoryEntry } from "@/lib/care-guide/types";
import { guideFileUrl, isFileId, parseGuideFileUrl, readAttachmentFile, saveAttachment, AttachmentError } from "./attachments";
import { ApiFail } from "./errors";
import { sanitizeGuide } from "./guide-validate";
import { StoreCorruptError, readJsonStrict, updateJsonStrict } from "./store";

/**
 * CMS 콘텐츠의 서버 저장소.
 *
 * 저장 구조(cms/guides.json)
 * - 기존 안내 88건은 코드(guides-data.ts)에 그대로 있고, 이 파일에는 "변경분"만 들어 있습니다.
 *   · 시드와 같은 contentId의 기록 = 관리자가 수정(게시 상태 변경·폐기 포함)한 기존 콘텐츠 → 화면에서는 이 기록이 시드를 대신합니다.
 *   · 시드에 없는 contentId의 기록 = 관리자가 새로 등록한 콘텐츠
 * - 모든 쓰기는 관리자 API에서만, 파일 단위 직렬 처리 + 원자적 저장으로 일어납니다(store.ts).
 * - 파일이 깨져 있으면 어떤 쓰기도 하지 않고 오류를 돌려줍니다(빈 데이터로 덮어쓰기 금지).
 */
const FILE = "cms/guides.json";
const SCHEMA_VERSION = 1;
const MAX_RECORDS = 2000;
const MAX_FILES_PER_GUIDE = 5;

export interface GuideRecord {
  guide: GuideContent;
  /** 이 기록을 만들 때 코드에 있던 시드의 버전(시드가 이후 갱신됐는지 알리기 위함). 새 콘텐츠에는 없음 */
  baseSeedVersion?: number;
  updatedAt: string;
}

export interface GuideDoc {
  schemaVersion: number;
  /** 저장할 때마다 1씩 증가. 백업 복구 전 확인 이후 데이터가 바뀌었는지 판단하는 데 씁니다. */
  revision: number;
  records: GuideRecord[];
}

const SEED_BY_ID = new Map(GUIDES.map((g) => [g.contentId, g]));

export function seedById(contentId: string): GuideContent | undefined {
  return SEED_BY_ID.get(contentId);
}

export function emptyDoc(): GuideDoc {
  return { schemaVersion: SCHEMA_VERSION, revision: 0, records: [] };
}

function isObj(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

/** 저장된 문서의 모양을 확인합니다. 이상하면 고치지 않고 오류로 멈춥니다. */
export function checkDoc(doc: unknown): GuideDoc {
  if (!isObj(doc) || typeof doc.schemaVersion !== "number" || typeof doc.revision !== "number" || !Array.isArray(doc.records)) {
    throw new StoreCorruptError(FILE, "문서 형식이 올바르지 않습니다");
  }
  if (doc.schemaVersion > SCHEMA_VERSION) {
    throw new StoreCorruptError(FILE, "더 새로운 버전의 앱이 저장한 데이터입니다. 앱을 최신 버전으로 맞춰 주세요");
  }
  const seen = new Set<string>();
  for (const r of doc.records) {
    const g = isObj(r) && isObj(r.guide) ? r.guide : null;
    if (!g || typeof g.contentId !== "string" || typeof g.slug !== "string" || typeof g.title !== "string" || seen.has(g.contentId)) {
      throw new StoreCorruptError(FILE, "콘텐츠 기록 형식이 올바르지 않습니다");
    }
    seen.add(g.contentId);
  }
  return doc as unknown as GuideDoc;
}

export async function loadDoc(): Promise<GuideDoc> {
  return checkDoc(await readJsonStrict<unknown>(FILE, emptyDoc()));
}

/** 한국 시간 기준 오늘 날짜(YYYY-MM-DD) */
export function todayKst(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
}

// ───────────────────────── 조회 ─────────────────────────

/** 시드 + 서버 변경분을 합친 전체 콘텐츠(서버 안에서 상태 확인용) */
export async function listAllGuides(): Promise<GuideContent[]> {
  const doc = await loadDoc();
  return mergeGuides(GUIDES, doc.records.map((r) => r.guide));
}

export async function getGuideStates(ids: string[]): Promise<Map<string, GuideContent | undefined>> {
  const all = await listAllGuides();
  const byId = new Map(all.map((g) => [g.contentId, g]));
  return new Map(ids.map((id) => [id, byId.get(id)]));
}

export interface StaffGuideView {
  scope: "staff";
  revision: number;
  records: GuideContent[];
  /** 코드의 기본 콘텐츠가 관리자 수정본보다 새 버전인 항목(관리자가 확인해야 함, 관리자에게만 제공) */
  seedNewerIds: string[];
  /** 일반 직원에게 보이면 안 되는 기본 콘텐츠(관리자가 비게시·폐기한 것). 관리자에게는 비어 있음 */
  hiddenIds: string[];
}

export interface PublicGuideView {
  scope: "public";
  revision: number;
  /** 환자에게 공개할 수 있는 변경분만(게시 + 의료 검토 대기 아님). 직원용 내부 정보는 제거됨 */
  records: GuideContent[];
  /** 기본 콘텐츠 중 환자에게 보이면 안 되는 것(비게시·검토 대기로 바뀐 것) */
  hiddenIds: string[];
}

/**
 * 직원용 목록. 일반 직원에게는 "게시 중인" 콘텐츠만 줍니다(검토 대기 중인 게시 콘텐츠는 직원에게 보임).
 * 비게시·폐기 콘텐츠는 관리자만 볼 수 있으며, 일반 직원 응답에는 내용이 아예 들어가지 않습니다.
 */
export async function staffView(options: { isAdmin: boolean }): Promise<StaffGuideView> {
  const doc = await loadDoc();
  if (!options.isAdmin) {
    const records: GuideContent[] = [];
    const hiddenIds: string[] = [];
    for (const r of doc.records) {
      if (r.guide.status === "게시") records.push(r.guide);
      else if (SEED_BY_ID.has(r.guide.contentId)) hiddenIds.push(r.guide.contentId);
    }
    return { scope: "staff", revision: doc.revision, records, seedNewerIds: [], hiddenIds };
  }
  const seedNewerIds = doc.records
    .filter((r) => {
      const seed = SEED_BY_ID.get(r.guide.contentId);
      return Boolean(seed) && r.baseSeedVersion !== undefined && seed!.version > r.baseSeedVersion;
    })
    .map((r) => r.guide.contentId);
  return { scope: "staff", revision: doc.revision, records: doc.records.map((r) => r.guide), seedNewerIds, hiddenIds: [] };
}

export async function publicView(): Promise<PublicGuideView> {
  const doc = await loadDoc();
  const records: GuideContent[] = [];
  const hiddenIds: string[] = [];
  for (const r of doc.records) {
    const visible: boolean = isPatientVisible(r.guide);
    if (visible) records.push(scrubForPatient(r.guide));
    else if (SEED_BY_ID.has(r.guide.contentId)) hiddenIds.push(r.guide.contentId);
  }
  return { scope: "public", revision: doc.revision, records, hiddenIds };
}

/** 환자용 주소(slug)로 공개 가능한 콘텐츠 찾기(공유 미리보기용). 없거나 비공개면 undefined */
export async function findPublicGuideBySlug(slug: string): Promise<GuideContent | undefined> {
  try {
    const all = await listAllGuides();
    const found = all.find((g) => slugEquals(g.slug, slug));
    return isPatientVisible(found) ? found : undefined;
  } catch {
    return undefined;
  }
}

// ───────────────────────── 첨부 원본 파일 ─────────────────────────

/** 보낸 첨부 목록을 서버 파일로 정리합니다. data URL은 새로 저장하고, 이미 저장된 파일 주소는 확인 후 유지합니다. */
async function resolveSourceFiles(contentId: string, raw: unknown, current: SourceFile[] | undefined): Promise<SourceFile[] | undefined> {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) throw new ApiFail(400, "첨부 파일 목록이 올바르지 않습니다.");
  if (raw.length > MAX_FILES_PER_GUIDE) throw new ApiFail(400, `첨부 파일은 콘텐츠당 최대 ${MAX_FILES_PER_GUIDE}개까지 등록할 수 있습니다.`);
  const known = new Map((current ?? []).map((f) => [parseGuideFileUrl(contentId, f.dataUrl), f]));
  const out: SourceFile[] = [];
  for (const item of raw) {
    if (!isObj(item) || typeof item.dataUrl !== "string") throw new ApiFail(400, "첨부 파일 정보가 올바르지 않습니다.");
    if (item.dataUrl.startsWith("data:")) {
      try {
        const saved = await saveAttachment("guides", contentId, item.name, item.dataUrl);
        out.push({ name: saved.name, type: saved.type, size: saved.size, dataUrl: guideFileUrl(contentId, saved.fileId) });
      } catch (e) {
        if (e instanceof AttachmentError) throw new ApiFail(400, e.message);
        throw e;
      }
      continue;
    }
    const fileId = parseGuideFileUrl(contentId, item.dataUrl);
    const existing = fileId ? known.get(fileId) : undefined;
    if (!fileId || !isFileId(fileId) || !existing || !(await readAttachmentFile("guides", contentId, fileId))) {
      throw new ApiFail(400, "첨부 파일을 확인할 수 없습니다. 파일을 다시 선택해 주세요.");
    }
    out.push(existing);
  }
  return out.length > 0 ? out : undefined;
}

// ───────────────────────── 변경(관리자 전용 API에서만 호출) ─────────────────────────

export type GuideOp =
  | { op: "create"; guide: unknown; note?: string }
  | { op: "update"; guide: unknown; note?: string; requestId?: string }
  | { op: "toggle"; contentId: string }
  | { op: "retire"; contentId: string }
  | { op: "restore"; contentId: string };

export interface GuideOpResult {
  guide: GuideContent;
  revision: number;
}

function cleanNote(v: unknown): string | undefined {
  return typeof v === "string" ? v.normalize("NFC").trim().slice(0, 300) || undefined : undefined;
}

function currentOf(doc: GuideDoc, contentId: string): { guide: GuideContent; index: number } | { guide: GuideContent; index: -1 } | null {
  const index = doc.records.findIndex((r) => r.guide.contentId === contentId);
  if (index >= 0) return { guide: doc.records[index].guide, index };
  const seed = SEED_BY_ID.get(contentId);
  return seed ? { guide: seed, index: -1 } : null;
}

function allCurrent(doc: GuideDoc): GuideContent[] {
  return mergeGuides(GUIDES, doc.records.map((r) => r.guide));
}

function commit(doc: GuideDoc, guide: GuideContent, index: number): GuideOpResult {
  const record: GuideRecord = {
    guide,
    updatedAt: new Date().toISOString(),
    baseSeedVersion: index >= 0 ? doc.records[index].baseSeedVersion : SEED_BY_ID.get(guide.contentId)?.version,
  };
  if (!SEED_BY_ID.has(guide.contentId)) delete record.baseSeedVersion;
  if (index >= 0) doc.records[index] = record;
  else {
    if (doc.records.length >= MAX_RECORDS) throw new ApiFail(400, "저장할 수 있는 콘텐츠 수를 넘었습니다.");
    doc.records.push(record);
  }
  doc.revision += 1;
  return { guide, revision: doc.revision };
}

/** 바깥에서 쓰는 변경 진입점. 모든 규칙(권한은 호출한 API에서 확인, 검증·상태 전이는 여기서)이 한곳에 있습니다. */
export function applyGuideOp(input: GuideOp): Promise<GuideOpResult> {
  return updateJsonStrict<unknown, GuideOpResult>(FILE, emptyDoc(), async (raw) => {
    const doc = checkDoc(raw);
    const today = todayKst();

    if (input.op === "create") {
      const { guide: clean, rawSourceFiles } = sanitizeGuide(input.guide);
      const all = allCurrent(doc);
      // ID: 보낸 값이 비어 있고 겹치지 않으면 그대로, 아니면 서버가 다음 번호를 정합니다(동시에 등록해도 겹치지 않음).
      const idTaken = all.some((g) => g.contentId === clean.contentId);
      const contentId = idTaken ? nextContentId(all) : clean.contentId;
      if (all.some((g) => slugEquals(g.slug, clean.slug))) throw new ApiFail(409, `이미 사용 중인 주소입니다: /c/${clean.slug}`);
      const entry: VersionHistoryEntry = { version: 1, date: today, summary: cleanNote(input.note) ?? "최초 등록" };
      const sourceFiles = await resolveSourceFiles(contentId, rawSourceFiles, undefined);
      const guide: GuideContent = {
        ...clean,
        contentId,
        version: 1,
        createdAt: today,
        lastUpdated: today,
        // 새 콘텐츠는 의료진 검토 대기로 시작합니다. 관리자가 등록 때 "검토 완료"를 고른 경우만 완료로 둡니다.
        medicalReview: clean.medicalReview ?? NEW_CONTENT_MEDICAL_REVIEW,
        versionHistory: [entry],
        ...(sourceFiles ? { sourceFiles } : {}),
      };
      if (guide.medicalReview === "completed") guide.medicalReviewedAt = today;
      else delete guide.medicalReviewedAt;
      return commit(doc, guide, -1);
    }

    if (input.op === "update") {
      const { guide: clean, rawSourceFiles } = sanitizeGuide(input.guide);
      const cur = currentOf(doc, clean.contentId);
      if (!cur) throw new ApiFail(404, "수정할 콘텐츠를 찾을 수 없습니다.");
      // 다른 곳에서 먼저 수정했다면(버전이 어긋남) 덮어쓰지 않고 새로고침을 안내합니다.
      if (clean.version !== cur.guide.version + 1) {
        throw new ApiFail(409, "다른 곳에서 이 콘텐츠가 먼저 수정되었습니다. 화면을 새로고침한 뒤 다시 수정해 주세요.");
      }
      const seed = SEED_BY_ID.get(clean.contentId);
      // 기존 안내(시드)의 주소는 이미 공유·인쇄된 링크일 수 있어 바꿀 수 없습니다.
      if (seed && !slugEquals(seed.slug, clean.slug)) throw new ApiFail(400, "기존 안내의 주소(URL)는 바꿀 수 없습니다.");
      if (allCurrent(doc).some((g) => g.contentId !== clean.contentId && slugEquals(g.slug, clean.slug))) {
        throw new ApiFail(409, `이미 사용 중인 주소입니다: /c/${clean.slug}`);
      }
      const medical = medicalReviewOnSave(cur.guide, { ...clean, medicalReviewedAt: cur.guide.medicalReviewedAt }, today);
      const entry: VersionHistoryEntry = {
        version: clean.version,
        date: today,
        summary: cleanNote(input.note) ?? "내용 수정",
        ...(typeof input.requestId === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(input.requestId) ? { requestId: input.requestId } : {}),
      };
      const sourceFiles = await resolveSourceFiles(clean.contentId, rawSourceFiles, cur.guide.sourceFiles);
      const guide: GuideContent = {
        ...clean,
        createdAt: cur.guide.createdAt ?? clean.createdAt,
        lastUpdated: today,
        versionHistory: [entry, ...(cur.guide.versionHistory ?? [])],
        ...(sourceFiles ? { sourceFiles } : {}),
      };
      delete guide.medicalReview;
      delete guide.medicalReviewedAt;
      if (medical.medicalReview) guide.medicalReview = medical.medicalReview;
      if (medical.medicalReviewedAt) guide.medicalReviewedAt = medical.medicalReviewedAt;
      return commit(doc, guide, cur.index);
    }

    const cur = currentOf(doc, input.contentId);
    if (!cur) throw new ApiFail(404, "콘텐츠를 찾을 수 없습니다.");
    const g = cur.guide;

    if (input.op === "toggle") {
      return commit(doc, { ...g, status: g.status === "게시" ? "비게시" : "게시" }, cur.index);
    }
    if (input.op === "retire") {
      const version = g.version + 1;
      return commit(
        doc,
        {
          ...g,
          status: "비게시",
          reviewStatus: "retired",
          approvalStatus: "unapproved",
          needsClinicalReview: true,
          version,
          lastUpdated: today,
          versionHistory: [{ version, date: today, summary: "사용 종료(폐기) 처리" }, ...(g.versionHistory ?? [])],
        },
        cur.index,
      );
    }
    // restore
    const version = g.version + 1;
    return commit(
      doc,
      {
        ...g,
        status: "비게시",
        reviewStatus: "draft",
        approvalStatus: "unapproved",
        needsClinicalReview: true,
        version,
        lastUpdated: today,
        versionHistory: [{ version, date: today, summary: "사용 종료 해제(복원) · 작성 중으로 되돌림" }, ...(g.versionHistory ?? [])],
      },
      cur.index,
    );
  });
}

// ───────────────────────── 환자 전달 가능 여부(서버 검증) ─────────────────────────

/**
 * 인쇄·내려받기·환자 안내(문자·QR)·제공 기록처럼 "환자에게 건네는" 동작에 쓰는 콘텐츠를 서버가 다시 확인합니다.
 * 의료진 검토 대기 중인 콘텐츠가 하나라도 있으면 그 제목을 돌려줍니다.
 */
export async function findPendingDeliveries(ids: string[]): Promise<string[]> {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return [];
  const states = await getGuideStates(unique);
  const pending: string[] = [];
  for (const id of unique) {
    const g = states.get(id);
    if (g && isMedicalReviewPending(g)) pending.push(g.title);
  }
  return pending;
}
