export type Department =
  | "영상의학과"
  | "소화기내과"
  | "외과"
  | "정형외과"
  | "내과"
  | "순환기내과"
  | "진단검사의학과"
  | "핵의학과"
  | "마취통증의학과"
  | "재활의학과"
  | "원무팀"
  | "전과공통";

/**
 * 환자 여정 단계 코드입니다. Phase 1에서는 환자 데이터가 없으므로
 * 자동 추천에는 사용하지 않고, 콘텐츠 라이브러리의 "환자 여정 단계"
 * 필터 용도로만 사용합니다. (Phase 3에서 환자 데이터와 재연결 예정)
 */
export type StageCode =
  | "before-test"
  | "before-surgery"
  | "admitted"
  | "before-discharge"
  | "after-discharge";

export interface StageInfo {
  code: StageCode;
  label: string;
}

export const STAGES: Record<StageCode, StageInfo> = {
  "before-test": { code: "before-test", label: "검사 전" },
  "before-surgery": { code: "before-surgery", label: "수술 전" },
  admitted: { code: "admitted", label: "입원 중" },
  "before-discharge": { code: "before-discharge", label: "퇴원 전후" },
  "after-discharge": { code: "after-discharge", label: "퇴원 후" },
};

export type GuideCategory = "검사" | "수술" | "입원" | "퇴원" | "기타";

export interface FaqItem {
  question: string;
  answer: string;
}

/** 환자 안내 콘텐츠 표준 템플릿 (필요한 섹션만 채워서 사용) */
export interface GuideContent {
  contentId: string;
  /** 콘텐츠 고정 URL(/c/[slug])에 쓰이는 값. 개인정보를 포함하지 않습니다. */
  slug: string;
  title: string;
  category: GuideCategory;
  subcategory: string;
  departments: Department[];
  /** 환자 여정 단계 필터 태그 (Phase 1: 자동 추천에는 미사용) */
  patientStages: StageCode[];
  /** 2. 한눈에 보는 안내 */
  summary: string;
  /** 3. 꼭 확인해주세요 */
  importantNotice?: string;
  /** 4. 검사·치료 전 */
  before?: string;
  /** 5. 검사·치료 당일 */
  during?: string;
  /** 6. 검사·치료 후 */
  after?: string;
  /** 7. FAQ */
  faq?: FaqItem[];
  /** 8. 위치 */
  location?: string;
  /** 9. 문의 */
  contact?: string;
  /** 10. 관련 안내 */
  relatedContentIds?: string[];
  /**
   * category별 고정 라벨(PHASE_LABELS)로는 맞지 않는 콘텐츠(예: "수술" 카테고리에
   * 속하지만 실제로는 "시술"인 콘텐츠)를 위한 섹션 제목 재정의. 지정한 키만
   * 덮어쓰고 나머지는 category 기본값을 그대로 사용합니다.
   */
  phaseLabelOverride?: { before?: string; during?: string; after?: string };
  /** 환자 화면 상단 "한양대학교병원 {카테고리} 안내" 문구에서 category 대신 쓸 단어. */
  categoryLabelOverride?: string;
  estimatedReadMinutes: number;
  status: "게시" | "비게시";
  /** 병원 공식 검토가 필요한 프로토타입 콘텐츠 여부 */
  needsClinicalReview: boolean;
  version: number;
  lastUpdated: string;
}

export type DeliveryChannel = "sms" | "qr" | "kakao";

export const CHANNEL_LABEL: Record<DeliveryChannel, string> = {
  sms: "SMS",
  qr: "QR",
  kakao: "카카오 알림톡",
};

/**
 * 환자 식별정보를 전혀 포함하지 않는 발송 준비 이력입니다.
 * PII 제로 원칙에 따라 "발송 시각 / 콘텐츠(content_id) / 채널 / 완료 여부"
 * 4개 항목으로만 구성하며, 담당 직원 이름 등 그 외 정보는 기록하지 않습니다.
 */
export interface SendLogEntry {
  logId: string;
  contentId: string;
  contentTitle: string;
  channel: DeliveryChannel;
  completed: boolean;
  performedAt: string;
}
