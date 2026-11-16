import { MEDICAL_REVIEW_LABEL } from "@/lib/care-guide/review";
import type { GuideContent } from "@/lib/care-guide/types";

/**
 * 의료진 검토 상태 칩(직원·관리자 화면용, 중립 색상).
 * medicalReview 값이 없는 기존 콘텐츠에는 아무것도 그리지 않습니다.
 * ‘검토 완료’는 관리자 목록 등 필요한 곳에서만 showCompleted 로 보여 줍니다.
 */
export default function MedicalReviewChip({
  guide,
  showCompleted = false,
  className = "",
}: {
  guide: GuideContent;
  showCompleted?: boolean;
  className?: string;
}) {
  const s = guide.medicalReview;
  if (!s || (s === "completed" && !showCompleted)) return null;
  const tone = s === "pending" ? "bg-slate-100 text-slate-700 ring-slate-300" : "bg-blue-soft text-brand-blue-dark ring-brand-blue/20";
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ${tone} ${className}`}>
      의료 {MEDICAL_REVIEW_LABEL[s]}
    </span>
  );
}
