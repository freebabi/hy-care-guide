export type Department =
  | "영상의학과"
  | "소화기내과"
  | "외과"
  | "정형외과"
  | "내과"
  | "심장내과"
  | "진단검사의학과"
  | "핵의학과"
  | "마취통증의학과"
  | "재활의학과"
  | "원무팀"
  | "치과"
  | "산부인과"
  | "응급의료센터"
  | "비뇨의학과"
  | "이비인후과"
  | "심장혈관흉부외과"
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

/** 환자 여정 단계의 내부 식별 ID. 화면 표시명은 taxonomy.ts의 JOURNEY_STAGES에서 관리합니다. */
export type JourneyStageId =
  | "pre-visit"
  | "arrival-registration"
  | "outpatient"
  | "examination"
  | "procedure"
  | "surgery"
  | "inpatient"
  | "discharge"
  | "post-discharge"
  | "emergency"
  | "hospital-facilities";

/** 주제 분류의 내부 식별 ID. 여정 단계와는 별도의 필드로 관리합니다. */
export type TopicId =
  | "outpatient-registration"
  | "examination"
  | "procedure"
  | "surgery-anesthesia"
  | "inpatient-life"
  | "patient-safety"
  | "infection-prevention"
  | "discharge-recovery"
  | "emergency"
  | "facilities-location"
  | "guardian"
  | "administration-certificates"
  | "cost-insurance"
  | "etc";

/** 승인 상태: 병원 승인이 끝난 자료만 공식 안내로 표시합니다. */
export type ApprovalStatus = "unapproved" | "approved";
/** 검토 상태(업무 흐름): 작성 중 → 부서 검토 요청 → 수정 필요 → 승인 완료 → 개정 필요 → 사용 종료 */
export type ReviewStatus =
  | "draft"
  | "review-requested"
  | "revision-needed"
  | "approved"
  | "revision-due"
  | "retired";
/**
 * 의료진(의료 내용) 검토 상태. CMS의 검토 상태·승인 상태와는 별개의 독립 필드입니다.
 * - 값이 없는 콘텐츠(기존 콘텐츠)는 검토가 끝난 것으로 보며 화면에 아무 표시도 하지 않습니다.
 * - 관리자가 새로 등록하는 콘텐츠는 "pending"(검토 대기)으로 시작하고, 실제 검토가 끝나면 "completed"로 바꿉니다.
 */
export type MedicalReviewStatus = "pending" | "completed";
export type Audience = "patient" | "guardian" | "both";

/**
 * 출처 구분.
 * - official-web: 병원 공식 홈페이지 안내
 * - department-material: 병원 부서(영상의학과 등)가 제작한 안내자료
 * - staff-provided: 병원 직원이 직접 전달한 문구
 * - legacy-seed: 초기 프로토타입에 들어 있던 예시 문구(근거 미확인)
 */
export type SourceKind = "official-web" | "department-material" | "staff-provided" | "legacy-seed";

export interface SourceDocument {
  title: string;
  url?: string;
  kind?: SourceKind;
  /** 이 출처에서 가져온 내용의 범위 */
  note?: string;
}

/** 상세 안내의 구성 블록 */
export type DetailBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: Array<{ title: string; text?: string }> }
  | { type: "callout"; tone: "info" | "warning"; text: string }
  /** 등록된 안내 이미지(image-assets.ts)를 설명과 가까운 위치에 넣습니다. */
  | { type: "image"; assetId: string }
  /** 근거 자료가 없어 비워 둔 항목. 직원 화면에는 "관련 부서 검토 필요"로 표시됩니다. */
  | { type: "review-needed"; topic: string };

export interface DetailSection {
  id: string;
  title: string;
  /** detail-icons.tsx의 아이콘 키 */
  icon?: string;
  blocks: DetailBlock[];
}

/** 상세 안내 전체 구성. 카드 요약(summary)과는 별도로 상세 화면에서만 보여줍니다. */
export interface DetailContent {
  /** "꼭 확인해주세요" 박스에 보여줄 근거 있는 핵심 문구 */
  notice?: string;
  sections: DetailSection[];
  /** 병원 자료에서 확인된 질문과 답변만 넣습니다. */
  faq?: FaqItem[];
}

export interface VersionHistoryEntry {
  version: number;
  date: string;
  summary: string;
  /** 이 수정이 어느 개선 요청에서 비롯됐는지 */
  requestId?: string;
}

export interface SourceFile {
  name: string;
  type: string;
  size: number;
  /** 프로토타입에서는 브라우저 저장소에 data URL로 보관합니다(1MB 이하). */
  dataUrl: string;
}

export type ImprovementKind = "error" | "improvement" | "inconvenience";
export type ImprovementStatus = "received" | "reviewing" | "approved" | "applied" | "rejected";

/** 직원이 제출하는 개선 요청. 기존 안내 콘텐츠는 건드리지 않고 별도로 보관합니다. */
export interface ImprovementRequest {
  requestId: string;
  contentId: string;
  contentTitle: string;
  /** 요청 당시 콘텐츠 버전 */
  contentVersion: number;
  kind: ImprovementKind;
  message: string;
  requesterDepartment: string;
  attachment?: SourceFile;
  status: ImprovementStatus;
  adminNote?: string;
  /** 반영 완료 시 변경된 콘텐츠 버전 */
  appliedVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  /** 답변 바로 아래에 보여줄 등록된 안내 이미지(image-assets.ts) */
  assetId?: string;
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

  // ── 2.0 정보구조: 기존 필드는 그대로 두고 아래 신규 필드만 추가합니다. ──
  // (title=title, summary=summary, 본문=before/during/after, primaryCategory=category,
  //  department=departments, contentStatus=status, updatedAt=lastUpdated 로 기존 필드를 그대로 사용합니다.)
  /** 연결된 환자 여정 단계. 여러 개 지정 가능. 비어 있으면 "분류 검토 대상"입니다. */
  journeyStages?: JourneyStageId[];
  /** 연결된 주제. 여정 단계와 별도로 여러 개 지정 가능. */
  topicCategories?: TopicId[];
  /** 검색 보조 키워드(별칭, 영문 약어, 흔한 표현). */
  keywords?: string[];
  audience?: Audience;
  /** 내용의 출처 자료. */
  sourceDocuments?: SourceDocument[];
  approvalStatus?: ApprovalStatus;
  reviewStatus?: ReviewStatus;
  /** 의료진 검토 상태(위 승인 상태와 별개). 없으면 기존 콘텐츠로 보고 검토 완료로 취급합니다. */
  medicalReview?: MedicalReviewStatus;
  /** 관리자가 ‘검토 완료’로 바꾼 날. 기록이 없는 기존 콘텐츠는 비워 둡니다(임의로 채우지 않음). */
  medicalReviewedAt?: string;
  /** 담당 부서: 자료를 제공했거나 관리하는 부서 */
  ownerDepartment?: string;
  /** 내용 확인 담당 부서: 내용의 정확성을 확인해야 하는(한) 부서 */
  reviewerDepartment?: string;
  /** 최초 등록일. 기록이 없는 초기 콘텐츠는 비워 둡니다(임의로 채우지 않음). */
  createdAt?: string;
  lastReviewedAt?: string;
  /**
   * 상세 안내 구성(안내 개요·사전 준비·진행 과정 등). 있으면 상세 화면이 이 구성을 보여주고,
   * 기존 importantNotice/before/during/after/faq 원문은 삭제하지 않고 직원 화면에서만 접어서 보여줍니다.
   */
  detail?: DetailContent;
  /**
   * 기존(전·당일·후) 형식 콘텐츠에서 이미지를 넣을 위치. 지정한 구역 바로 뒤에 표시합니다.
   * 상세 구성(detail)이 있는 콘텐츠는 섹션 안에 `image` 블록으로 직접 넣습니다.
   */
  images?: Array<{ assetId: string; placement: "summary" | "notice" | "before" | "during" | "after" }>;
  /** 분류가 모호해 담당자 확인이 필요한 경우 그 사유. */
  classificationReview?: { reason: string };
  /** 관리자가 저장할 때마다 쌓이는 버전 이력(최신이 앞). 기록이 없던 초기 콘텐츠는 비어 있습니다. */
  versionHistory?: VersionHistoryEntry[];
  /** 관리자가 첨부한 원본 파일(안내문 원본, 부서 제공 자료 등). */
  sourceFiles?: SourceFile[];

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

/** 안내 이미지의 사용 승인 상태 */
export type ImageApproval = "approved" | "internal-use" | "pending";

/** 웹에서 쓰는 안내 이미지 1개의 관리 정보. 원본은 reference-materials 폴더에 그대로 있습니다. */
export interface GuideImageAsset {
  /** 이미지 식별자(영문·숫자·하이픈) — 파일명과 같게 둡니다. */
  id: string;
  /** public 기준 웹 경로 (예: /assets/guides/xxx.jpg) */
  src: string;
  width: number;
  height: number;
  /** 이 이미지가 연결된 콘텐츠 ID들 */
  contentIds: string[];
  /** 이미지 설명(직원용 관리 설명) */
  description: string;
  /** 대체 텍스트(원본 문구 기반) */
  alt: string;
  /** 화면에 보이는 캡션(선택) */
  caption?: string;
  /** 원본 파일명(reference-materials 안) */
  sourceFile: string;
  /** 원본 자료의 파일 기준 날짜(없으면 파일 수정일) */
  sourceDate: string;
  /** 사용 승인 상태: approved = 웹·공개 사용 승인 / internal-use = 내부 사용만 / pending = 승인 대기 */
  approval: ImageApproval;
  /** 이 이미지를 마지막으로 검토한 날 */
  lastReviewedAt: string;
}
