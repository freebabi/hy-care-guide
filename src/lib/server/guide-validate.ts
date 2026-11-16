import "server-only";
import { getImageAsset } from "@/lib/care-guide/image-assets";
import type { GuideContent } from "@/lib/care-guide/types";
import { ApiFail } from "./errors";

/**
 * 관리자가 보낸 콘텐츠를 서버에서 다시 검사·정리합니다.
 * 화면(브라우저)이 보낸 값은 믿지 않고, 아는 필드만 골라 형식과 길이를 확인합니다.
 * 버전 이력·첨부 파일처럼 서버가 직접 관리하는 필드는 여기서 다루지 않습니다(guides.ts).
 */
const CONTENT_ID = /^[A-Za-z0-9_-]{1,40}$/;
const CATEGORIES = ["검사", "수술", "입원", "퇴원", "기타"] as const;
const STATUSES = ["게시", "비게시"] as const;
const REVIEW_STATUSES = ["draft", "review-requested", "revision-needed", "approved", "revision-due", "retired"] as const;
const APPROVALS = ["unapproved", "approved"] as const;
const AUDIENCES = ["patient", "guardian", "both"] as const;
const MEDICAL = ["pending", "completed"] as const;
const PLACEMENTS = ["summary", "notice", "before", "during", "after"] as const;
const BLOCK_TYPES = ["paragraph", "list", "steps", "callout", "image", "review-needed"] as const;
const MAX_GUIDE_BYTES = 400 * 1024;

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function bad(message: string): never {
  throw new ApiFail(400, message);
}

function str(o: Obj, key: string, max: number, required = false): string | undefined {
  const v = o[key];
  if (v === undefined || v === null || v === "") {
    if (required) bad(`‘${key}’ 값이 필요합니다.`);
    return undefined;
  }
  if (typeof v !== "string") bad(`‘${key}’ 값이 올바르지 않습니다.`);
  const s = v.normalize("NFC");
  if (s.length > max) bad(`‘${key}’ 값이 너무 깁니다(최대 ${max}자).`);
  if (required && !s.trim()) bad(`‘${key}’ 값이 필요합니다.`);
  return s;
}

function oneOf<T extends string>(o: Obj, key: string, allowed: readonly T[], required = false): T | undefined {
  const v = o[key];
  if (v === undefined || v === null) {
    if (required) bad(`‘${key}’ 값이 필요합니다.`);
    return undefined;
  }
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) bad(`‘${key}’ 값이 올바르지 않습니다.`);
  return v as T;
}

function strArray(o: Obj, key: string, maxItems: number, maxLen: number, pattern?: RegExp): string[] | undefined {
  const v = o[key];
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || v.length > maxItems) bad(`‘${key}’ 목록이 올바르지 않습니다.`);
  return v.map((x) => {
    if (typeof x !== "string" || x.length > maxLen || (pattern && !pattern.test(x))) bad(`‘${key}’ 목록에 올바르지 않은 값이 있습니다.`);
    return x.normalize("NFC");
  });
}

function int(o: Obj, key: string, min: number, max: number, required = false): number | undefined {
  const v = o[key];
  if (v === undefined || v === null) {
    if (required) bad(`‘${key}’ 값이 필요합니다.`);
    return undefined;
  }
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) bad(`‘${key}’ 값이 올바르지 않습니다.`);
  return v;
}

function assetCheck(assetId: unknown, where: string): void {
  if (typeof assetId !== "string" || !getImageAsset(assetId)) bad(`${where}에 등록되지 않은 안내 이미지가 지정되어 있습니다.`);
}

function cleanFaq(v: unknown, label: string) {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || v.length > 80) bad(`${label} 목록이 올바르지 않습니다.`);
  return v.map((raw) => {
    if (!isObj(raw)) bad(`${label} 항목이 올바르지 않습니다.`);
    const question = str(raw, "question", 500, true)!;
    const answer = str(raw, "answer", 5000, true)!;
    const out: { question: string; answer: string; assetId?: string } = { question, answer };
    if (raw.assetId !== undefined && raw.assetId !== null && raw.assetId !== "") {
      assetCheck(raw.assetId, label);
      out.assetId = raw.assetId as string;
    }
    return out;
  });
}

function cleanDetail(v: unknown) {
  if (v === undefined || v === null) return undefined;
  if (!isObj(v) || !Array.isArray(v.sections) || v.sections.length > 60) bad("상세 안내 구성이 올바르지 않습니다.");
  const sections = v.sections.map((s) => {
    if (!isObj(s) || typeof s.id !== "string" || typeof s.title !== "string" || !Array.isArray(s.blocks) || s.blocks.length > 200) bad("상세 안내의 섹션이 올바르지 않습니다.");
    for (const b of s.blocks) {
      if (!isObj(b) || !(BLOCK_TYPES as readonly string[]).includes(b.type as string)) bad("상세 안내의 블록 형식이 올바르지 않습니다.");
      if (b.type === "image") assetCheck(b.assetId, "상세 안내");
    }
    return s;
  });
  const detail: Obj = { ...v, sections };
  if (detail.faq !== undefined) detail.faq = cleanFaq(detail.faq, "상세 안내 FAQ");
  return detail as unknown as GuideContent["detail"];
}

function cleanImages(v: unknown) {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || v.length > 60) bad("안내 이미지 목록이 올바르지 않습니다.");
  return v.map((raw) => {
    if (!isObj(raw) || typeof raw.placement !== "string" || !(PLACEMENTS as readonly string[]).includes(raw.placement)) bad("안내 이미지 위치가 올바르지 않습니다.");
    assetCheck(raw.assetId, "안내 이미지");
    return { assetId: raw.assetId as string, placement: raw.placement as (typeof PLACEMENTS)[number] };
  });
}

function cleanSourceDocuments(v: unknown) {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || v.length > 40) bad("출처 목록이 올바르지 않습니다.");
  return v.map((raw) => {
    if (!isObj(raw)) bad("출처 항목이 올바르지 않습니다.");
    const out: Obj = { title: str(raw, "title", 300, true)! };
    const url = str(raw, "url", 500);
    if (url) {
      if (!/^https?:\/\//i.test(url)) bad("출처 주소는 http(s)로 시작해야 합니다.");
      out.url = url;
    }
    const kind = oneOf(raw, "kind", ["official-web", "department-material", "staff-provided", "legacy-seed"] as const);
    if (kind) out.kind = kind;
    const note = str(raw, "note", 1000);
    if (note) out.note = note;
    return out as unknown as NonNullable<GuideContent["sourceDocuments"]>[number];
  });
}

/** 서버가 정하는 값(버전 이력·첨부 파일)을 제외한 콘텐츠를 검사·정리합니다. 첨부 파일 원본(raw)은 따로 돌려줍니다. */
export function sanitizeGuide(input: unknown): { guide: GuideContent; rawSourceFiles: unknown } {
  if (!isObj(input)) bad("콘텐츠 형식이 올바르지 않습니다.");
  const o = input;
  const contentId = str(o, "contentId", 40, true)!;
  if (!CONTENT_ID.test(contentId)) bad("콘텐츠 ID 형식이 올바르지 않습니다.");

  const guide: GuideContent = {
    contentId,
    slug: str(o, "slug", 120, true)!,
    title: str(o, "title", 200, true)!,
    category: oneOf(o, "category", CATEGORIES, true)!,
    subcategory: str(o, "subcategory", 100) ?? "",
    departments: (strArray(o, "departments", 30, 40) ?? []) as GuideContent["departments"],
    patientStages: (strArray(o, "patientStages", 10, 40) ?? []) as GuideContent["patientStages"],
    summary: str(o, "summary", 5000, true)!,
    estimatedReadMinutes: int(o, "estimatedReadMinutes", 1, 240) ?? 2,
    status: oneOf(o, "status", STATUSES, true)!,
    needsClinicalReview: typeof o.needsClinicalReview === "boolean" ? o.needsClinicalReview : true,
    version: int(o, "version", 1, 100000, true)!,
    lastUpdated: str(o, "lastUpdated", 40, true)!,
  };

  const optional: Array<[keyof GuideContent, string | undefined]> = [
    ["importantNotice", str(o, "importantNotice", 20000)],
    ["before", str(o, "before", 40000)],
    ["during", str(o, "during", 40000)],
    ["after", str(o, "after", 40000)],
    ["location", str(o, "location", 5000)],
    ["contact", str(o, "contact", 5000)],
    ["categoryLabelOverride", str(o, "categoryLabelOverride", 40)],
    ["ownerDepartment", str(o, "ownerDepartment", 100)],
    ["reviewerDepartment", str(o, "reviewerDepartment", 100)],
    ["createdAt", str(o, "createdAt", 40)],
    ["lastReviewedAt", str(o, "lastReviewedAt", 40)],
    ["medicalReviewedAt", str(o, "medicalReviewedAt", 40)],
  ];
  for (const [k, v] of optional) if (v !== undefined) (guide as unknown as Obj)[k] = v;

  const faq = cleanFaq(o.faq, "FAQ");
  if (faq) guide.faq = faq;
  const related = strArray(o, "relatedContentIds", 60, 40, CONTENT_ID);
  if (related) guide.relatedContentIds = related;
  if (isObj(o.phaseLabelOverride)) {
    const p = o.phaseLabelOverride;
    const out: NonNullable<GuideContent["phaseLabelOverride"]> = {};
    for (const k of ["before", "during", "after"] as const) {
      const s = str(p, k, 60);
      if (s) out[k] = s;
    }
    guide.phaseLabelOverride = out;
  }
  const journey = strArray(o, "journeyStages", 20, 40);
  if (journey) guide.journeyStages = journey as GuideContent["journeyStages"];
  const topics = strArray(o, "topicCategories", 30, 40);
  if (topics) guide.topicCategories = topics as GuideContent["topicCategories"];
  const keywords = strArray(o, "keywords", 80, 60);
  if (keywords) guide.keywords = keywords;
  const audience = oneOf(o, "audience", AUDIENCES);
  if (audience) guide.audience = audience;
  const sources = cleanSourceDocuments(o.sourceDocuments);
  if (sources) guide.sourceDocuments = sources;
  const approval = oneOf(o, "approvalStatus", APPROVALS);
  if (approval) guide.approvalStatus = approval;
  const review = oneOf(o, "reviewStatus", REVIEW_STATUSES);
  if (review) guide.reviewStatus = review;
  const medical = oneOf(o, "medicalReview", MEDICAL);
  if (medical) guide.medicalReview = medical;
  const detail = cleanDetail(o.detail);
  if (detail) guide.detail = detail;
  const images = cleanImages(o.images);
  if (images) guide.images = images;
  if (isObj(o.classificationReview)) {
    const reason = str(o.classificationReview, "reason", 1000);
    if (reason) guide.classificationReview = { reason };
  }

  if (JSON.stringify(guide).length > MAX_GUIDE_BYTES) bad("콘텐츠 분량이 너무 큽니다. 내용을 나누어 등록해 주세요.");
  return { guide, rawSourceFiles: o.sourceFiles };
}
