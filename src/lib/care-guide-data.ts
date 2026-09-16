export type MaterialCategory =
  | "질환안내"
  | "수술·검사 전후 주의사항"
  | "복약지도"
  | "퇴원 후 생활 가이드";

export type MaterialFormat = "동영상 가이드" | "카드뉴스" | "주의사항 리플렛";

export interface EduMaterial {
  id: string;
  title: string;
  category: MaterialCategory;
  format: MaterialFormat;
  /** 매칭되는 진료과 (시뮬레이터 추천용) */
  departments: string[];
  /** 매칭되는 진단명/시술명 (시뮬레이터 추천용) */
  diagnoses: string[];
  /** 매칭되는 처방·주의사항 유형 (시뮬레이터 추천용) */
  noteTypes: string[];
  tags: string[];
  summary: string;
  /** 썸네일에 사용할 Tailwind 그라디언트 클래스 */
  accent: string;
}

export const CATEGORIES: Array<MaterialCategory | "전체"> = [
  "전체",
  "질환안내",
  "수술·검사 전후 주의사항",
  "복약지도",
  "퇴원 후 생활 가이드",
];

export const NOTE_TYPES = ["복약 가이드", "퇴원 후 식이요법", "운동 치료"] as const;

export interface Department {
  id: string;
  label: string;
  diagnoses: string[];
}

export const DEPARTMENTS: Department[] = [
  { id: "cardio", label: "순환기내과", diagnoses: ["고혈압", "부정맥"] },
  { id: "gi", label: "소화기내과", diagnoses: ["위 내시경 시술", "위염"] },
  { id: "ortho", label: "정형외과", diagnoses: ["인공관절 수술", "골절"] },
];

export const MATERIALS: EduMaterial[] = [
  {
    id: "m01",
    title: "고혈압, 제대로 알고 관리하기",
    category: "질환안내",
    format: "카드뉴스",
    departments: ["순환기내과"],
    diagnoses: ["고혈압"],
    noteTypes: ["복약 가이드"],
    tags: ["#순환기내과", "#고혈압", "#질환안내"],
    summary: "고혈압의 원인과 증상, 생활 속 관리법을 카드뉴스로 알기 쉽게 정리했습니다.",
    accent: "from-sky-500 to-blue-600",
  },
  {
    id: "m02",
    title: "혈압강하제 복약 가이드",
    category: "복약지도",
    format: "주의사항 리플렛",
    departments: ["순환기내과"],
    diagnoses: ["고혈압", "부정맥"],
    noteTypes: ["복약 가이드"],
    tags: ["#순환기내과", "#복약지도", "#혈압약"],
    summary: "혈압약 복용 시간, 병용 금기 약물, 복용을 놓쳤을 때 대처법을 안내합니다.",
    accent: "from-blue-600 to-cyan-600",
  },
  {
    id: "m03",
    title: "부정맥 환자를 위한 생활 수칙",
    category: "질환안내",
    format: "동영상 가이드",
    departments: ["순환기내과"],
    diagnoses: ["부정맥"],
    noteTypes: ["운동 치료", "퇴원 후 식이요법"],
    tags: ["#순환기내과", "#부정맥", "#생활가이드"],
    summary: "부정맥 진단 후 일상에서 지켜야 할 운동·식이·주의 증상을 영상으로 설명합니다.",
    accent: "from-cyan-500 to-teal-600",
  },
  {
    id: "m04",
    title: "위 내시경 검사 전 준비사항",
    category: "수술·검사 전후 주의사항",
    format: "주의사항 리플렛",
    departments: ["소화기내과"],
    diagnoses: ["위 내시경 시술"],
    noteTypes: [],
    tags: ["#소화기내과", "#내시경주의사항", "#검사전준비"],
    summary: "내시경 검사 전 금식 시간, 복용을 중단해야 하는 약물 등을 안내합니다.",
    accent: "from-teal-500 to-emerald-600",
  },
  {
    id: "m05",
    title: "위 내시경 시술 후 식이요법",
    category: "퇴원 후 생활 가이드",
    format: "카드뉴스",
    departments: ["소화기내과"],
    diagnoses: ["위 내시경 시술", "위염"],
    noteTypes: ["퇴원 후 식이요법"],
    tags: ["#소화기내과", "#내시경주의사항", "#식이요법"],
    summary: "시술 직후 단계별 식사 진행 방법과 피해야 할 음식을 정리했습니다.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: "m06",
    title: "위염, 재발 막는 생활습관",
    category: "질환안내",
    format: "카드뉴스",
    departments: ["소화기내과"],
    diagnoses: ["위염"],
    noteTypes: ["퇴원 후 식이요법"],
    tags: ["#소화기내과", "#위염", "#질환안내"],
    summary: "위염의 원인과 증상, 재발 방지를 위한 식습관·약물 복용법을 안내합니다.",
    accent: "from-sky-500 to-teal-500",
  },
  {
    id: "m07",
    title: "인공관절 수술 후 재활 운동",
    category: "퇴원 후 생활 가이드",
    format: "동영상 가이드",
    departments: ["정형외과"],
    diagnoses: ["인공관절 수술"],
    noteTypes: ["운동 치료"],
    tags: ["#정형외과", "#인공관절수술", "#재활운동"],
    summary: "수술 후 단계별 재활 운동 방법을 실제 동작 영상으로 보여줍니다.",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    id: "m08",
    title: "인공관절 수술 전후 주의사항",
    category: "수술·검사 전후 주의사항",
    format: "주의사항 리플렛",
    departments: ["정형외과"],
    diagnoses: ["인공관절 수술"],
    noteTypes: [],
    tags: ["#정형외과", "#인공관절수술", "#수술전후주의사항"],
    summary: "수술 전 준비물, 수술 후 상처 관리와 이상 증상 발생 시 대처법을 안내합니다.",
    accent: "from-indigo-500 to-blue-600",
  },
  {
    id: "m09",
    title: "골절 환자를 위한 깁스 관리법",
    category: "퇴원 후 생활 가이드",
    format: "카드뉴스",
    departments: ["정형외과"],
    diagnoses: ["골절"],
    noteTypes: ["운동 치료"],
    tags: ["#정형외과", "#골절", "#깁스관리"],
    summary: "깁스 착용 기간 중 부종 관리, 청결 유지, 안전한 운동 범위를 안내합니다.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    id: "m10",
    title: "퇴원 후 꼭 확인해야 할 응급 증상",
    category: "퇴원 후 생활 가이드",
    format: "주의사항 리플렛",
    departments: ["순환기내과", "소화기내과", "정형외과"],
    diagnoses: [],
    noteTypes: ["퇴원 후 식이요법"],
    tags: ["#전과공통", "#퇴원가이드", "#응급증상"],
    summary: "진료과와 관계없이 퇴원 후 반드시 병원에 연락해야 하는 위험 신호를 정리했습니다.",
    accent: "from-teal-500 to-cyan-500",
  },
  {
    id: "m11",
    title: "당뇨병 자가관리의 기본",
    category: "질환안내",
    format: "동영상 가이드",
    departments: [],
    diagnoses: [],
    noteTypes: ["복약 가이드", "퇴원 후 식이요법"],
    tags: ["#내분비", "#당뇨병", "#자가관리"],
    summary: "혈당 자가 측정법과 인슐린·경구약 복용 원칙을 영상으로 안내합니다.",
    accent: "from-blue-500 to-cyan-600",
  },
  {
    id: "m12",
    title: "복약 순응도를 높이는 5가지 습관",
    category: "복약지도",
    format: "카드뉴스",
    departments: [],
    diagnoses: [],
    noteTypes: ["복약 가이드"],
    tags: ["#복약지도", "#복약순응도"],
    summary: "약 먹는 시간을 놓치지 않는 방법과 부작용 발생 시 대처 요령을 안내합니다.",
    accent: "from-sky-600 to-teal-600",
  },
  {
    id: "m13",
    title: "수술 후 상처 관리 기본 원칙",
    category: "수술·검사 전후 주의사항",
    format: "주의사항 리플렛",
    departments: ["정형외과", "소화기내과"],
    diagnoses: [],
    noteTypes: [],
    tags: ["#수술전후주의사항", "#상처관리"],
    summary: "수술 부위 소독, 드레싱 교체 주기, 감염 의심 증상을 정리했습니다.",
    accent: "from-teal-600 to-blue-600",
  },
  {
    id: "m14",
    title: "저염식 식단으로 혈압 관리하기",
    category: "퇴원 후 생활 가이드",
    format: "카드뉴스",
    departments: ["순환기내과"],
    diagnoses: ["고혈압"],
    noteTypes: ["퇴원 후 식이요법"],
    tags: ["#순환기내과", "#고혈압", "#저염식"],
    summary: "일상에서 실천 가능한 저염 식단 구성과 조리 팁을 소개합니다.",
    accent: "from-cyan-600 to-emerald-600",
  },
];
