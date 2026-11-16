import type { JourneyStageId, TopicId } from "./types";

export interface JourneyStageInfo {
  id: JourneyStageId;
  /** 화면에 표시하는 단계 번호 */
  order: number;
  label: string;
  /** 카드에 표시하는 한 줄 설명 */
  description: string;
  /** 이 단계에서 찾게 되는 세부 안내 항목 */
  subItems: string[];
}

/** 환자 여정 11단계. 내부 ID(id)와 한글 표시명(label)을 분리해 관리합니다. */
export const JOURNEY_STAGES: JourneyStageInfo[] = [
  {
    id: "pre-visit",
    order: 1,
    label: "병원 방문 전",
    description: "오시기 전에 미리 준비할 안내",
    subItems: ["진료 예약 및 내원 준비", "진료 전 준비사항", "방문 전 확인사항"],
  },
  {
    id: "arrival-registration",
    order: 2,
    label: "병원 도착 및 접수",
    description: "도착해서 접수·수납을 마칠 때까지",
    subItems: ["주차 및 교통", "병원 위치 찾기", "접수 및 수납", "원내 이동 안내"],
  },
  {
    id: "outpatient",
    order: 3,
    label: "외래 진료",
    description: "진료 절차와 진료 후 안내",
    subItems: ["진료 절차", "진료과 이용", "진료 후 처방 및 안내"],
  },
  {
    id: "examination",
    order: 4,
    label: "검사",
    description: "검사별 준비와 검사 후 주의사항",
    subItems: ["영상검사", "내시경", "혈액 및 임상검사", "기능검사", "검사 전후 준비"],
  },
  {
    id: "procedure",
    order: 5,
    label: "시술",
    description: "시술 전후 준비와 관리",
    subItems: ["심혈관 시술", "내시경 시술", "영상의학과 중재시술", "카테터 및 포트 삽입", "시술 후 관리"],
  },
  {
    id: "surgery",
    order: 6,
    label: "수술 및 마취",
    description: "수술 준비부터 회복·재활까지",
    subItems: ["수술 전 준비", "수술 동의 및 마취 상담", "수술 당일", "수술 후 회복 및 재활"],
  },
  {
    id: "inpatient",
    order: 7,
    label: "입원 및 병동 생활",
    description: "입원 수속과 병동 생활, 안전",
    subItems: ["입원 결정 및 수속", "병실 생활", "식사 및 편의시설", "간호간병통합서비스", "환자 안전", "감염 예방", "낙상 예방"],
  },
  {
    id: "discharge",
    order: 8,
    label: "퇴원 준비",
    description: "퇴원 결정과 수속, 수납·퇴원약",
    subItems: ["퇴원 결정 및 수속", "수납 및 정산", "퇴원약 수령", "퇴원 전 교육"],
  },
  {
    id: "post-discharge",
    order: 9,
    label: "퇴원 후 관리",
    description: "집에서의 관리와 외래 재진",
    subItems: ["복약", "상처 관리", "일상생활", "외래 재진", "응급상황 확인"],
  },
  {
    id: "emergency",
    order: 10,
    label: "응급진료",
    description: "응급실 이용과 보호자 안내",
    subItems: ["응급의료센터 이용", "응급실 접수 및 진료 절차", "보호자 안내"],
  },
  {
    id: "hospital-facilities",
    order: 11,
    label: "병원 이용 및 편의시설",
    description: "위치·교통·편의시설·서류·비용",
    subItems: ["진료실 및 검사실 위치", "주차 및 대중교통", "편의시설", "의무기록 및 제증명", "비용 및 보험 관련 안내"],
  },
];

export interface TopicInfo {
  id: TopicId;
  label: string;
}

/** 주제 분류 14종. 여정 단계와는 별도로 한 콘텐츠에 여러 개를 연결할 수 있습니다. */
export const TOPICS: TopicInfo[] = [
  { id: "outpatient-registration", label: "외래 진료 및 접수" },
  { id: "examination", label: "검사" },
  { id: "procedure", label: "시술" },
  { id: "surgery-anesthesia", label: "수술 및 마취" },
  { id: "inpatient-life", label: "입원생활" },
  { id: "patient-safety", label: "환자 안전" },
  { id: "infection-prevention", label: "감염 예방" },
  { id: "discharge-recovery", label: "퇴원 및 회복" },
  { id: "emergency", label: "응급진료" },
  { id: "facilities-location", label: "병원 위치 및 편의시설" },
  { id: "guardian", label: "보호자 안내" },
  { id: "administration-certificates", label: "행정 및 제증명" },
  { id: "cost-insurance", label: "진료비 및 보험" },
  { id: "etc", label: "기타" },
];

export const JOURNEY_BY_ID = new Map(JOURNEY_STAGES.map((s) => [s.id, s]));
export const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

/**
 * 입원 수속(admission)은 별도 단계가 아니라 "입원 및 병동 생활"(inpatient)의 세부 항목입니다.
 * 데이터에 admission이 들어와도 inpatient로 인식하도록 별칭을 둡니다.
 */
const JOURNEY_ALIASES: Record<string, JourneyStageId> = { admission: "inpatient" };

export function normalizeJourneyId(id: string): JourneyStageId | undefined {
  if (JOURNEY_BY_ID.has(id as JourneyStageId)) return id as JourneyStageId;
  return JOURNEY_ALIASES[id];
}

export function journeyLabel(id: JourneyStageId): string {
  return JOURNEY_BY_ID.get(id)?.label ?? id;
}

export function topicLabel(id: TopicId): string {
  return TOPIC_BY_ID.get(id)?.label ?? id;
}
