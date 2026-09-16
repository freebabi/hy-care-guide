export type Department =
  | "영상의학과"
  | "소화기내과"
  | "외과"
  | "정형외과"
  | "내과"
  | "순환기내과";

/** 환자의 현재 진료 여정 단계 코드 */
export type StageCode =
  | "ct-scheduled"
  | "mri-scheduled"
  | "gastroscopy-scheduled"
  | "colonoscopy-scheduled"
  | "surgery-scheduled"
  | "admitted"
  | "blood-test-scheduled"
  | "discharge-scheduled";

export interface StageInfo {
  code: StageCode;
  label: string;
}

export const STAGES: Record<StageCode, StageInfo> = {
  "ct-scheduled": { code: "ct-scheduled", label: "CT 검사 예정" },
  "mri-scheduled": { code: "mri-scheduled", label: "MRI 검사 예정" },
  "gastroscopy-scheduled": { code: "gastroscopy-scheduled", label: "위내시경 검사 예정" },
  "colonoscopy-scheduled": { code: "colonoscopy-scheduled", label: "대장내시경 검사 예정" },
  "surgery-scheduled": { code: "surgery-scheduled", label: "수술 예정" },
  admitted: { code: "admitted", label: "입원 중" },
  "blood-test-scheduled": { code: "blood-test-scheduled", label: "채혈 예정" },
  "discharge-scheduled": { code: "discharge-scheduled", label: "퇴원 예정" },
};

export type GuideCategory = "검사" | "수술" | "입원" | "퇴원" | "복약" | "생활안내";

export interface FaqItem {
  question: string;
  answer: string;
}

/** 환자 안내 콘텐츠 표준 템플릿 (필요한 섹션만 채워서 사용) */
export interface GuideContent {
  contentId: string;
  title: string;
  category: GuideCategory;
  departments: Department[];
  /** 이 콘텐츠가 매칭되는 환자 여정 단계 */
  patientStages: StageCode[];
  /** 추천 이유로 노출되는 짧은 문구 */
  recommendReason: string;
  /** 2. 한눈에 보는 안내 */
  summary: string;
  /** 3. 꼭 확인해주세요 */
  mustCheck?: string;
  /** 4. 검사/치료 전 */
  beforeCare?: string;
  /** 5. 검사/치료 당일 */
  dayOfCare?: string;
  /** 6. 검사/치료 후 */
  afterCare?: string;
  /** 7. 주의사항 */
  precautions?: string;
  /** 8. FAQ */
  faq?: FaqItem[];
  /** 10. 위치 */
  location?: string;
  /** 11. 문의 */
  contact?: string;
  /** 12. 관련 안내 */
  relatedContentIds?: string[];
  readMinutes: number;
  status: "게시" | "비게시";
  /** 병원 공식 검토가 필요한 프로토타입 콘텐츠 여부 */
  needsClinicalReview: boolean;
  version: number;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Patient {
  patientId: string;
  name: string;
  registrationNumber: string;
  department: Department;
  stage: StageCode;
  scheduledAt?: string;
}

export type DeliveryChannel = "kakao" | "sms" | "qr";

export interface SentRecord {
  recordId: string;
  token: string;
  patientId: string;
  patientName: string;
  contentIds: string[];
  channel: DeliveryChannel;
  sentAt: string;
  sentBy: string;
  readAt?: string;
}
