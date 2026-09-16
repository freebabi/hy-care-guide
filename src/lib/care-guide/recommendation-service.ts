import type { GuideContent, Patient } from "./types";

export interface RecommendedGuide {
  guide: GuideContent;
  reason: string;
}

/**
 * 환자 상태(진료과 + 현재 여정 단계) 기반 Rule-based 추천 로직입니다.
 *
 * 지금은 규칙 기반으로 동작하지만, 이 함수의 시그니처(환자 -> 추천 콘텐츠 목록)만
 * 유지하면 내부 구현을 AI 모델/외부 API 호출로 교체할 수 있도록
 * 별도 서비스 모듈로 분리해두었습니다. UI는 이 함수만 호출합니다.
 */
export function recommendGuidesForPatient(
  patient: Patient,
  guides: GuideContent[],
): RecommendedGuide[] {
  const matched = guides.filter(
    (guide) =>
      guide.status === "게시" &&
      guide.patientStages.includes(patient.stage) &&
      guide.departments.includes(patient.department),
  );

  return matched.map((guide) => ({ guide, reason: guide.recommendReason }));
}
