import type { GuideContent, MedicalReviewStatus, ReviewStatus, SourceKind } from "./types";

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "작성 중",
  "review-requested": "부서 검토 요청",
  "revision-needed": "수정 필요",
  approved: "승인 완료",
  "revision-due": "개정 필요",
  retired: "사용 종료",
};

export const REVIEW_STATUS_ORDER: ReviewStatus[] = [
  "draft",
  "review-requested",
  "revision-needed",
  "approved",
  "revision-due",
  "retired",
];

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  "official-web": "병원 공식 홈페이지",
  "department-material": "부서 제작 안내자료",
  "staff-provided": "직원 제공 문구",
  "legacy-seed": "초기 예시 문구(근거 미확인)",
};

export const MEDICAL_REVIEW_LABEL: Record<MedicalReviewStatus, string> = {
  pending: "검토 대기",
  completed: "검토 완료",
};

/**
 * 의료진 검토 대기 여부. 새로 등록한 콘텐츠만 "pending"을 가지며, 값이 없는 기존 콘텐츠는 false 입니다.
 * (CMS 승인 상태·needsClinicalReview 와는 무관합니다. 콘텐츠 ID 목록으로 구분하지 않습니다.)
 */
export function isMedicalReviewPending(guide: GuideContent | undefined): boolean {
  return guide?.medicalReview === "pending";
}

/** 환자용 화면에 공개할 수 있는 콘텐츠인지: 게시 중이고, 의료진 검토 대기가 아닌 것 */
export function isPatientVisible(guide: GuideContent | undefined): guide is GuideContent {
  return Boolean(guide) && guide!.status === "게시" && !isMedicalReviewPending(guide);
}

/** 환자에게 전달(보내기·QR·안내자료 구성·인쇄)할 수 있는 콘텐츠인지 */
export function canDeliverToPatient(guide: GuideContent | undefined): boolean {
  return Boolean(guide) && !isMedicalReviewPending(guide);
}

/** 새로 등록하는 콘텐츠의 의료진 검토 기본값 */
export const NEW_CONTENT_MEDICAL_REVIEW: MedicalReviewStatus = "pending";

/**
 * 저장할 때 정할 의료진 검토 필드.
 * - 값이 없던 기존 콘텐츠를 ‘검토 완료’로 두면 값을 만들지 않고 그대로 둡니다(검토자·검토일을 지어내지 않음).
 * - 검토일은 관리자가 ‘검토 대기 → 검토 완료’로 바꾼 날만 기록하고, 이미 완료 기록이 있으면 그대로 유지합니다.
 */
export function medicalReviewOnSave(
  initial: GuideContent | null,
  form: GuideContent,
  today: string,
): Pick<GuideContent, "medicalReview" | "medicalReviewedAt"> {
  const wasLegacy = initial !== null && initial.medicalReview === undefined;
  const medicalReview = wasLegacy && form.medicalReview === "completed" ? undefined : form.medicalReview;
  let medicalReviewedAt: string | undefined;
  if (form.medicalReview === "completed") {
    medicalReviewedAt = initial?.medicalReview === "pending" ? today : form.medicalReviewedAt;
  }
  return { medicalReview, medicalReviewedAt };
}

export const MEDICAL_REVIEW_PENDING_NOTE =
  "의료진 검토 대기 중인 콘텐츠입니다. 환자용 화면에는 공개되지 않으며, 안내자료 구성·인쇄·환자 안내에는 검토 완료 후 사용할 수 있습니다.";

export function reviewStatusOf(guide: GuideContent): ReviewStatus {
  return guide.reviewStatus ?? "draft";
}

/**
 * 공식 안내 여부. 검토 상태가 "승인 완료"이고 승인 상태도 "승인"인 자료만 true입니다.
 * 그 외 자료는 화면 어디에서도 "공식 안내"로 표시하지 않습니다.
 */
export function isOfficial(guide: GuideContent): boolean {
  return reviewStatusOf(guide) === "approved" && guide.approvalStatus === "approved";
}

/** 검토 상태별 배지 색상(승인 완료만 초록, 사용 종료는 회색, 그 외는 주의 색) */
export function reviewBadgeClass(status: ReviewStatus): string {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "retired":
      return "bg-slate-100 text-slate-700 ring-slate-300";
    case "revision-needed":
    case "revision-due":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    default:
      return "bg-amber-50 text-amber-900 ring-amber-200";
  }
}

/** 안내 상세 구성에 남아 있는 "관련 부서 검토 필요" 항목 수 */
export function countReviewNeeded(guide: GuideContent): number {
  return (guide.detail?.sections ?? []).reduce(
    (sum, sec) => sum + sec.blocks.filter((b) => b.type === "review-needed").length,
    0,
  );
}

/**
 * "승인 완료"로 저장하기 전에 확인할 사항. 비어 있지 않으면 승인할 수 없습니다.
 * (근거가 비어 있는 안내나 확인 부서가 없는 안내를 공식 안내로 만들지 않기 위한 장치)
 */
export function approvalBlockers(guide: GuideContent): string[] {
  const blockers: string[] = [];
  if (!guide.ownerDepartment?.trim()) blockers.push("담당 부서를 입력해 주세요.");
  if (!guide.reviewerDepartment?.trim()) blockers.push("내용 확인 담당 부서를 입력해 주세요.");
  const open = countReviewNeeded(guide);
  if (open > 0) blockers.push(`아직 ‘관련 부서 검토 필요’ 항목이 ${open}개 남아 있습니다. 부서 자료로 채운 뒤 승인해 주세요.`);
  if ((guide.sourceDocuments ?? []).length > 0 && (guide.sourceDocuments ?? []).every((s) => s.kind === "legacy-seed")) {
    blockers.push("출처가 ‘초기 예시 문구(근거 미확인)’뿐입니다. 병원 자료 출처를 확인해 주세요.");
  }
  return blockers;
}
