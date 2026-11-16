import type { Audience, GuideContent, JourneyStageId, SourceDocument, TopicId } from "./types";

/**
 * 콘텐츠별 분류(여정 단계·주제·키워드)와 출처·담당 부서 원본입니다.
 * contentId를 키로 하며, guides-data.ts가 기존 콘텐츠에 이 값을 덧붙여 내보냅니다.
 *
 * 원칙
 * - 분류하기 어려운 자료에 임의로 단계를 지정하지 않고 `review`에 사유를 적어 "분류 검토 대상"으로 표시합니다.
 * - 출처가 없는 문구는 `SRC.legacy`(초기 예시 문구)로 표시해, 근거가 확인되기 전에는 공식 안내로 보지 않습니다.
 * - 승인 전 자료는 reviewStatus="draft"(작성 중), approvalStatus="unapproved"가 기본값입니다.
 */
interface Classification {
  stages: JourneyStageId[];
  topics: TopicId[];
  keywords: string[];
  sources?: SourceDocument[];
  audience?: Audience;
  review?: string;
  /** 담당 부서: 자료를 제공했거나 관리하는 부서 */
  owner?: string;
  /** 내용 확인 담당 부서: 내용의 정확성을 확인해야 하는 부서 */
  reviewer?: string;
}

const SEOUL = "https://seoul.hyumc.com";

const SRC = {
  // 영상의학과가 제작한 검사·시술 안내자료
  ct: { title: "영상의학과 CT실 검사 안내", url: "https://dladydrnl-dotcom.github.io/hyumc-ct/", kind: "department-material" },
  mri: { title: "영상의학과 MRI실 검사 안내", url: "https://hyumc-mri.github.io/hyumc-mri/index222.html", kind: "department-material" },
  xray: { title: "영상의학과 X-ray 검사안내", url: "https://hyumc-xray.github.io/guide/index.html", kind: "department-material" },
  us: { title: "영상의학과 초음파 검사 안내", url: "https://hyumc-us.github.io/exam/", kind: "department-material" },
  breast: { title: "갑상선·유방 검사실 검사 안내", url: "https://mg-us-guide.pages.dev/", kind: "department-material" },
  fluoro: { title: "영상의학과 투시검사 안내", url: "https://hyumc-fluoroscopy-guide.pages.dev/", kind: "department-material" },
  ir: { title: "인터벤션실 환자·보호자 안내", url: "https://hyumc-intervention.github.io/interventional-guide/", kind: "department-material" },
  // 병원 공식 홈페이지
  floor: { title: "한양대학교병원 층별안내", url: `${SEOUL}/hospital/locationList.do`, kind: "official-web" },
  lab: { title: "한양대학교병원 검사실안내", url: `${SEOUL}/conts/102002007000000.do`, kind: "official-web" },
  process: { title: "한양대학교병원 외래 진료절차", url: `${SEOUL}/conts/102002008001000.do`, kind: "official-web" },
  admission: { title: "한양대학교병원 입원절차 안내", url: `${SEOUL}/conts/102002006001000.do`, kind: "official-web" },
  discharge: { title: "한양대학교병원 퇴원절차 안내", url: `${SEOUL}/conts/102002006002000.do`, kind: "official-web" },
  visit: { title: "한양대학교병원 면회안내", url: `${SEOUL}/conts/102010002000000.do`, kind: "official-web" },
  convenience: { title: "한양대학교병원 편의시설", url: `${SEOUL}/conts/102010001001000.do`, kind: "official-web" },
  er: { title: "한양대학교병원 응급진료 안내", url: `${SEOUL}/conts/102002002000000.do`, kind: "official-web" },
  cert: { title: "한양대학교병원 제증명 발급", url: `${SEOUL}/conts/102008001000000.do`, kind: "official-web" },
  record: { title: "한양대학교병원 의무기록 사본발급", url: `${SEOUL}/conts/102008002000000.do`, kind: "official-web" },
  parking: { title: "한양대학교병원 주차안내", url: `${SEOUL}/conts/102009002000000.do`, kind: "official-web" },
  way: { title: "한양대학교병원 오시는 길", url: `${SEOUL}/conts/102009001000000.do`, kind: "official-web" },
  refer: { title: "한양대학교병원 진료협력센터", url: `${SEOUL}/srefer/`, kind: "official-web" },
  safety: {
    title: "한양대학교병원 환자 안전 안내",
    url: `${SEOUL}/conts/102002009000000.do`,
    kind: "official-web",
    note: "정확한 환자 확인, 수술부위 확인, 낙상예방, 안전한 투약 4단계",
  },
  notice5: {
    title: "호흡기감염병 예방을 위한 5대 예방수칙 (공지사항 2024-07-30)",
    url: `${SEOUL}/board/commBoardNoticeView.do?no=448`,
    kind: "official-web",
  },
  // 병원 Hihy 건강백과 (질병정보, 2026-06-26 등록 항목)
  hyPolyp: { title: "Hihy 건강백과 · 대장용종", url: `${SEOUL}/hydic/view002001001.do?no=1264`, kind: "official-web", note: "정의, 제거 방법, 시술 후 주의사항" },
  hyCoronary: {
    title: "Hihy 건강백과 · 관상동맥질환(협심증과 심근경색)",
    url: `${SEOUL}/hydic/view002001001.do?no=1489`,
    kind: "official-web",
    note: "관상동맥 조영술·스텐트 삽입, 시술 후 주의사항, 약 복용, 예방",
  },
  hyAngina: { title: "Hihy 건강백과 · 협심증", url: `${SEOUL}/hydic/view002001001.do?no=1353`, kind: "official-web" },
  hyEr: {
    title: "Hihy 건강저장소 · 신속·정확이 살린다, 급성 심장질환 (2018-01-05)",
    url: `${SEOUL}/board/commBoardHealthRepoView.do?no=3164`,
    kind: "official-web",
    note: "응급센터에서 관상동맥조영술이 가능하다는 설명",
  },
  hyCold: { title: "Hihy 건강백과 · 감기·독감·코로나19 비교", url: `${SEOUL}/hydic/view002001001.do?no=1465`, kind: "official-web", note: "손 씻기·기침 예절" },
  hyNoro: { title: "Hihy 건강백과 · 노로바이러스 감염증", url: `${SEOUL}/hydic/view002001001.do?no=1515`, kind: "official-web", note: "손 씻기 방법" },
  hyHip: { title: "Hihy 건강백과 · 고관절 골절", url: `${SEOUL}/hydic/view002001001.do?no=1480`, kind: "official-web", note: "낙상 후 통증이 있을 때" },
  hyChemo: { title: "Hihy 건강백과 · 항암화학요법 환자의 일상생활 관리", url: `${SEOUL}/hydic/view002003001.do?no=1546`, kind: "official-web", note: "감염 예방 관리" },
  // 2026-11-12 직원이 전달한 관상동맥조영술 안내 원문
  staffAngio: {
    title: "병원 안내 문구 (관상동맥조영술 검사 개요·방법·준비사항)",
    kind: "staff-provided",
    note: "병원 안내 문구를 직원이 전달(2026-11-12). 부서 승인 전 자료입니다.",
  },
  // 병원 내부 기준(공개 저장소에는 문서 번호·내부 명칭을 적지 않습니다)
  fallRule: {
    title: "환자 안내 관련 병원 내부 기준 (낙상 예방)",
    kind: "department-material",
    note: "병원 내부 기준을 환자용으로 쉽게 줄여 쓴 것입니다. 문서 번호와 내부 명칭은 공개하지 않으며, 관련 부서 검토 기준에 따릅니다. 웹 안내문은 부서 승인 전입니다.",
  },
  idRule: {
    title: "환자 안내 관련 병원 내부 기준 (환자 확인)",
    kind: "department-material",
    note: "병원 내부 기준을 환자용으로 쉽게 줄여 쓴 것입니다. 문서 번호와 내부 명칭은 공개하지 않으며, 관련 부서 검토 기준에 따릅니다. 웹 안내문은 부서 승인 전입니다.",
  },
  siteRule: {
    title: "환자 안내 관련 병원 내부 기준 (수술·시술 부위 확인)",
    kind: "department-material",
    note: "병원 내부 기준을 환자용으로 쉽게 줄여 쓴 것입니다. 문서 번호와 내부 명칭은 공개하지 않으며, 관련 부서 검토 기준에 따릅니다. 웹 안내문은 부서 승인 전입니다.",
  },
  handRule: {
    title: "환자 안내 관련 병원 내부 기준 (손위생)",
    kind: "department-material",
    note: "병원 내부 기준을 환자용으로 쉽게 줄여 쓴 것입니다. 문서 번호와 내부 명칭은 공개하지 않으며, 관련 부서 검토 기준에 따릅니다. 웹 안내문은 부서 승인 전입니다.",
  },
  infRule: {
    title: "환자 안내 관련 병원 내부 기준 (감염 예방 관리)",
    kind: "department-material",
    note: "병원 내부 기준을 환자용으로 쉽게 줄여 쓴 것입니다. 문서 번호와 내부 명칭은 공개하지 않으며, 관련 부서 검토 기준에 따릅니다. 웹 안내문은 부서 승인 전입니다.",
  },
  isoRule: {
    title: "환자 안내 관련 병원 내부 기준 (격리·마스크)",
    kind: "department-material",
    note: "병원 내부 기준을 환자용으로 쉽게 줄여 쓴 것입니다. 문서 번호와 내부 명칭은 공개하지 않으며, 관련 부서 검토 기준에 따릅니다. 웹 안내문은 부서 승인 전입니다.",
  },
  visitRule: {
    title: "환자 안내 관련 병원 내부 기준 (병문안 관리)",
    kind: "department-material",
    note: "병원 내부 기준 중 병문안객 기록지 안내만 참고했고, 현재 적용 중인 면회 제한(전면 금지·보호자 1인)과 다른 부분은 쓰지 않았습니다. 문서 번호와 내부 명칭은 공개하지 않습니다. 웹 안내문은 부서 승인 전입니다.",
  },
  // 병원 서비스전략팀이 제작한 포스터·인포그래픽(이미지 사용 승인 완료)
  svc: {
    title: "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
    kind: "department-material",
    note: "서비스전략팀 제작 이미지이며 웹·공개 사용 승인이 확인되었습니다. 이를 바탕으로 쓴 웹 안내문의 내용은 해당 부서의 의료 검토 전이므로 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다.",
  },
  // 직원이 직접 전달한 문구, 초기 예시 문구
  staff: { title: "병원 직원 제공 문구 (2026-09, 담당 부서 확인 필요)", kind: "staff-provided" },
  legacy: {
    title: "초기 프로토타입 예시 문구",
    kind: "legacy-seed",
    note: "수치·지침의 근거가 병원 자료로 확인되지 않았습니다. 부서 검토 전에는 공식 안내로 사용하지 않습니다.",
  },
} satisfies Record<string, SourceDocument>;

const EXAM: JourneyStageId[] = ["examination"];
const EXAM_T: TopicId[] = ["examination"];
const PROC: JourneyStageId[] = ["procedure"];
const PROC_T: TopicId[] = ["procedure"];
const RAD = "영상의학과";

export const CLASSIFICATION: Record<string, Classification> = {
  // ── 검사 ──
  c01: { stages: EXAM, topics: EXAM_T, keywords: ["CT", "씨티", "컴퓨터단층촬영", "조영제"], sources: [SRC.ct, SRC.floor], owner: RAD },
  c02: { stages: EXAM, topics: EXAM_T, keywords: ["MRI", "엠알아이", "자기공명영상", "폐쇄공포", "소음", "검사 과정", "MRI 접수", "탈의", "지혈"], sources: [SRC.mri, SRC.svc], owner: RAD },
  c03: { stages: EXAM, topics: EXAM_T, keywords: ["X-ray", "엑스레이", "일반촬영", "X선"], sources: [SRC.xray], owner: RAD },
  c04: { stages: EXAM, topics: EXAM_T, keywords: ["초음파", "US", "소노"], sources: [SRC.us], owner: RAD },
  c05: { stages: EXAM, topics: EXAM_T, keywords: ["위내시경", "내시경", "수면내시경", "위검사"], sources: [SRC.legacy], reviewer: "소화기내과" },
  c06: { stages: EXAM, topics: EXAM_T, keywords: ["대장내시경", "내시경", "장 정결", "장정결제"], sources: [SRC.legacy], reviewer: "소화기내과" },
  c07: { stages: EXAM, topics: EXAM_T, keywords: ["채혈", "피검사", "혈액검사", "임상검사", "공복"], sources: [SRC.legacy], reviewer: "진단검사의학과" },
  c08: {
    stages: [...EXAM, ...PROC],
    topics: [...EXAM_T, ...PROC_T],
    keywords: ["조직검사", "생검", "바이옵시"],
    sources: [SRC.legacy],
  },
  c09: { stages: EXAM, topics: EXAM_T, keywords: ["PET-CT", "PET", "페트", "암 검사"], sources: [SRC.legacy], reviewer: "핵의학과" },
  c10: { stages: EXAM, topics: EXAM_T, keywords: ["조영제", "조영제 부작용", "알레르기", "요오드"], sources: [SRC.ct], owner: RAD },
  c11: { stages: EXAM, topics: EXAM_T, keywords: ["심전도", "EKG", "ECG"], sources: [SRC.legacy, SRC.lab], reviewer: "심장내과" },
  c12: { stages: EXAM, topics: EXAM_T, keywords: ["심장초음파", "심초음파", "에코"], sources: [SRC.legacy, SRC.lab], reviewer: "심장내과" },
  c13: { stages: EXAM, topics: EXAM_T, keywords: ["핵의학", "뼈 스캔", "골 스캔", "방사성의약품"], sources: [SRC.legacy], reviewer: "핵의학과" },
  c14: {
    stages: ["pre-visit", ...EXAM],
    topics: EXAM_T,
    keywords: ["금식", "공복", "검사 전 금식"],
    sources: [SRC.legacy, SRC.ct, SRC.mri, SRC.us],
  },
  c15: { stages: EXAM, topics: EXAM_T, keywords: ["유방촬영", "맘모그래피", "맘모", "유방검진"], sources: [SRC.breast], owner: RAD },
  c51: { stages: EXAM, topics: EXAM_T, keywords: ["복부초음파", "상복부", "하복부", "간", "담낭", "췌장", "신장"], sources: [SRC.us], owner: RAD },
  c52: { stages: EXAM, topics: EXAM_T, keywords: ["갑상선초음파", "갑상선", "목 초음파", "경부"], sources: [SRC.us, SRC.breast], owner: RAD },
  c53: { stages: EXAM, topics: EXAM_T, keywords: ["유방초음파", "유방", "가슴 초음파"], sources: [SRC.us, SRC.breast], owner: RAD },
  c54: { stages: EXAM, topics: EXAM_T, keywords: ["혈관초음파", "도플러", "경동맥", "다리 혈관"], sources: [SRC.us], owner: RAD },
  c55: { stages: EXAM, topics: EXAM_T, keywords: ["근골격초음파", "어깨", "관절", "근육", "DDH"], sources: [SRC.us], owner: RAD },
  c56: {
    stages: [...EXAM, ...PROC],
    topics: [...EXAM_T, ...PROC_T],
    keywords: ["세포흡인", "조직검사", "결절", "FNA", "갑상선 결절", "유방 결절"],
    sources: [SRC.us],
    owner: RAD,
  },
  c57: { stages: EXAM, topics: EXAM_T, keywords: ["류마티스", "관절염", "류마티스 엑스레이"], sources: [SRC.xray], owner: RAD },
  c58: { stages: EXAM, topics: EXAM_T, keywords: ["3D 유방촬영", "토모신세시스", "단층촬영"], sources: [SRC.breast], owner: RAD },
  c59: { stages: EXAM, topics: EXAM_T, keywords: ["확대촬영", "미세석회화", "유방"], sources: [SRC.breast], owner: RAD },
  c60: {
    stages: [...EXAM, ...PROC],
    topics: [...EXAM_T, ...PROC_T],
    keywords: ["입체정위", "유방 생검", "진공흡인 생검", "미세석회화"],
    sources: [SRC.breast],
    owner: RAD,
  },
  c62: { stages: EXAM, topics: EXAM_T, keywords: ["상부위장관", "UGI", "소장조영", "위장 조영", "바륨"], sources: [SRC.fluoro], owner: RAD },
  c63: { stages: EXAM, topics: EXAM_T, keywords: ["식도조영", "삼킴", "바륨"], sources: [SRC.fluoro], owner: RAD },
  c64: { stages: EXAM, topics: EXAM_T, keywords: ["대장조영", "바륨", "관장"], sources: [SRC.fluoro], owner: RAD },
  c65: { stages: EXAM, topics: EXAM_T, keywords: ["요도조영", "방광조영", "RUG"], sources: [SRC.fluoro], owner: RAD },
  c66: { stages: EXAM, topics: EXAM_T, keywords: ["VCUG", "소아", "방광요관역류", "VUR"], sources: [SRC.fluoro], owner: RAD },
  c67: { stages: EXAM, topics: EXAM_T, keywords: ["TKRA", "무릎 인공관절", "인공관절"], sources: [SRC.fluoro], owner: RAD },
  c68: { stages: EXAM, topics: EXAM_T, keywords: ["연하검사", "VFSS", "MBS", "삼킴검사", "연하장애"], sources: [SRC.fluoro], owner: RAD },

  // ── 시술 ──
  c24: {
    stages: PROC,
    topics: PROC_T,
    keywords: ["시술", "관상동맥조영술", "스텐트", "용종절제술", "케모포트", "중심정맥관"],
    sources: [SRC.legacy],
  },
  c61: { stages: [...PROC, "surgery"], topics: [...PROC_T, "surgery-anesthesia"], keywords: ["유도선", "와이어", "위치결정술", "유방 수술 전"], sources: [SRC.breast], owner: RAD },
  c69: { stages: PROC, topics: PROC_T, keywords: ["척추 주사", "경막외", "스테로이드 주사", "후관절"], sources: [SRC.fluoro], owner: RAD },
  c70: {
    stages: PROC,
    topics: PROC_T,
    keywords: ["인터벤션", "중재시술", "색전술", "스텐트", "TACE", "배액술", "PICC", "케모포트", "뇌혈관조영술"],
    sources: [SRC.ir],
    owner: RAD,
  },
  c73: {
    stages: PROC,
    topics: PROC_T,
    keywords: ["관상동맥조영술", "심혈관 조영", "심장 조영", "협심증", "심근경색", "카테터", "금식", "메트포르민", "당뇨약", "와파린", "항응고제", "아스피린", "클로피도그렐", "서혜부", "요골동맥", "대퇴동맥", "조영제 알레르기"],
    sources: [SRC.staffAngio, SRC.hyCoronary, SRC.hyEr, SRC.safety, SRC.lab],
    reviewer: "심장내과",
  },
  c74: {
    stages: PROC,
    topics: PROC_T,
    keywords: ["관상동맥 스텐트", "스텐트 삽입술", "심장 스텐트", "협심증", "심근경색", "항혈전제"],
    sources: [SRC.hyCoronary, SRC.hyAngina, SRC.hyEr, SRC.safety],
    reviewer: "심장내과",
  },
  c75: {
    stages: PROC,
    topics: PROC_T,
    keywords: ["용종절제술", "내시경 시술", "대장 용종", "폴립", "대장내시경", "점막절제술"],
    sources: [SRC.hyPolyp, SRC.safety, SRC.lab],
    reviewer: "소화기내과",
  },
  c76: {
    stages: PROC,
    topics: PROC_T,
    keywords: ["케모포트", "중심정맥관", "포트 삽입", "항암 주사", "카테터", "PICC"],
    sources: [SRC.ir, SRC.hyChemo],
    owner: RAD,
    reviewer: RAD,
  },

  // ── 수술 및 마취 ──
  c16: { stages: ["surgery"], topics: ["surgery-anesthesia"], keywords: ["수술", "수술 전", "수술 당일", "보호자 문자", "금식", "수술진행현황", "수술환자현황", "수술 진행 상황", "DID", "보호자 대기"], sources: [SRC.staff, SRC.svc, SRC.legacy] },
  c19: {
    stages: ["surgery", "inpatient"],
    topics: ["surgery-anesthesia", "discharge-recovery"],
    keywords: ["수술 후", "회복", "통증 조절", "PCA", "인스피로미터", "드레싱", "재활"],
    sources: [SRC.staff, SRC.legacy],
  },
  c22: {
    stages: ["surgery"],
    topics: ["surgery-anesthesia"],
    keywords: ["수술 동의서", "마취 상담", "마취", "동의서"],
    sources: [SRC.staff, SRC.legacy],
    reviewer: "마취통증의학과",
  },

  // ── 입원 및 병동 생활 ──
  c26: { stages: ["inpatient"], topics: ["inpatient-life", "guardian"], keywords: ["입원생활", "입원 준비물", "지참약", "면회", "에티켓", "식사", "귀중품", "소등", "회진", "보호자식", "사물함"], sources: [SRC.visit, SRC.svc, SRC.staff, SRC.legacy] },
  c27: { stages: ["inpatient", "hospital-facilities"], topics: ["facilities-location", "inpatient-life"], keywords: ["편의시설", "휠체어", "수유실", "카페", "편의점", "ATM", "식당", "영상 CD"], sources: [SRC.convenience] },
  c29: {
    stages: ["inpatient", "surgery"],
    topics: ["patient-safety", "inpatient-life"],
    keywords: ["낙상", "낙상예방", "넘어짐", "호출벨", "콜벨", "샤워실", "미끄러움", "안전바", "침대 난간", "사이드레일", "휠체어 바퀴", "수액걸이", "화장실 손잡이", "슬리퍼", "신발", "낙상 고위험", "넘어졌을 때"],
    sources: [SRC.fallRule, SRC.safety, SRC.hyHip, SRC.svc, SRC.staff, SRC.legacy],
    reviewer: "간호국",
  },
  c30: {
    stages: ["examination", "surgery", "inpatient"],
    topics: ["patient-safety"],
    keywords: ["환자안전", "환자 확인", "수술부위 확인", "안전한 투약", "낙상예방", "복용약", "치료 결정"],
    sources: [SRC.safety, SRC.siteRule, SRC.svc, SRC.staff],
    reviewer: "간호국",
  },
  c33: {
    stages: ["inpatient"],
    topics: ["infection-prevention", "patient-safety"],
    keywords: ["감염예방", "5대 예방수칙", "호흡기감염병", "손씻기", "기침예절", "면회 제한"],
    sources: [SRC.notice5, SRC.visit, SRC.isoRule, SRC.infRule, SRC.staff, SRC.legacy],
    reviewer: "감염관리실",
  },
  c34: { stages: ["inpatient"], topics: ["inpatient-life", "guardian"], keywords: ["간호간병통합서비스", "간병", "보호자 상주"], sources: [SRC.admission, SRC.legacy] },
  c71: { stages: ["inpatient"], topics: ["inpatient-life"], keywords: ["입원수속", "입원약정서", "팔찌", "입실", "중간정산"], sources: [SRC.admission], owner: "원무팀" },
  c77: {
    stages: ["outpatient", "examination", "procedure", "inpatient"],
    topics: ["patient-safety"],
    keywords: ["환자 확인", "정확한 환자 확인", "이름", "등록번호", "환자 팔찌", "나의 정보", "환자용 인식표", "인식표", "개방형 질문", "수술부위 표시", "수술 부위 확인", "시술 부위", "타임아웃"],
    sources: [SRC.idRule, SRC.siteRule, SRC.safety, SRC.staff, SRC.admission, SRC.svc],
    reviewer: "간호국",
  },
  c78: {
    stages: ["inpatient"],
    topics: ["infection-prevention", "patient-safety"],
    keywords: ["손위생", "손씻기", "손 씻기", "손소독제", "손세정제"],
    sources: [SRC.handRule, SRC.staff, SRC.notice5, SRC.visit, SRC.isoRule, SRC.hyCold, SRC.hyNoro, SRC.hyChemo],
    reviewer: "감염관리실",
  },
  c79: {
    stages: ["inpatient"],
    topics: ["infection-prevention"],
    keywords: ["기침예절", "기침 예절", "재채기", "마스크", "옷소매", "휴지", "마스크 착용 방법", "N95", "외과용 마스크"],
    sources: [SRC.notice5, SRC.visit, SRC.isoRule, SRC.hyCold],
    reviewer: "감염관리실",
  },
  c80: {
    stages: ["inpatient"],
    topics: ["guardian", "patient-safety"],
    keywords: ["보호자 협조", "보호자", "면회", "출입증", "낙상", "환자 확인"],
    sources: [SRC.safety, SRC.visit, SRC.visitRule, SRC.admission, SRC.er],
    audience: "guardian",
    reviewer: "간호국",
  },

  c81: {
    stages: ["inpatient"],
    topics: ["inpatient-life", "guardian"],
    keywords: ["병동 출입", "출입증", "보호자 출입증", "환자 팔찌", "바코드", "병문안", "면회", "보호자 교대", "재발급"],
    sources: [SRC.svc],
    reviewer: "원무팀",
  },
  c82: {
    stages: ["emergency", "surgery"],
    topics: ["emergency", "surgery-anesthesia", "guardian"],
    keywords: ["응급실 수술", "수술 보호자", "보호자 대기실", "수술 대기", "수술 문자", "제왕절개"],
    sources: [SRC.svc],
    audience: "guardian",
    reviewer: "응급의료센터",
  },
  c83: {
    stages: ["emergency", "inpatient"],
    topics: ["emergency", "inpatient-life", "facilities-location"],
    keywords: ["응급병동", "환자여정", "병동 위치", "401호", "식사 시간", "전동", "퇴원"],
    sources: [SRC.svc],
    reviewer: "응급의료센터",
  },
  c84: {
    stages: ["procedure", "post-discharge"],
    topics: ["procedure", "discharge-recovery"],
    keywords: ["PICC", "피크", "말초삽입 중심정맥관", "말초중심정맥관", "고정 테이프", "소독 부위", "삽입 부위"],
    sources: [SRC.svc, SRC.ir],
    owner: RAD,
    reviewer: RAD,
  },
  c85: {
    stages: ["arrival-registration", "outpatient", "hospital-facilities"],
    topics: ["outpatient-registration", "facilities-location"],
    keywords: ["치과", "스케일링", "패스트트랙", "건강검진센터", "종합검진센터", "파노라마", "치석"],
    sources: [SRC.svc],
    reviewer: "치과",
  },
  c86: {
    stages: ["arrival-registration", "outpatient"],
    topics: ["outpatient-registration"],
    keywords: ["산부인과", "외래 접수", "접수 절차", "수납", "진료 대기"],
    sources: [SRC.svc, SRC.process],
    reviewer: "산부인과",
  },
  c87: {
    stages: ["examination", "surgery", "inpatient"],
    topics: ["patient-safety", "surgery-anesthesia"],
    keywords: ["치료 결정", "동의서", "통증 조절", "통증 조절 요청", "환자 참여", "질문", "건강 정보"],
    sources: [SRC.svc, SRC.safety],
    reviewer: "간호국",
  },
  c88: {
    stages: ["inpatient"],
    topics: ["inpatient-life", "guardian"],
    keywords: ["고객의 소리", "불만", "불편 사항", "환자 권리", "고객상담실", "고객서비스센터", "담당 간호사에게 요청"],
    sources: [SRC.svc],
    reviewer: "고객지원팀",
  },
  c89: {
    stages: ["surgery", "inpatient", "emergency"],
    topics: ["patient-safety", "inpatient-life"],
    keywords: ["통증", "통증 조절", "진통제", "통증 척도", "NRS", "FPRS", "냉찜질", "온찜질", "마사지", "아파요"],
    sources: [SRC.svc],
    reviewer: "간호국",
  },
  c91: {
    stages: ["arrival-registration", "outpatient", "hospital-facilities"],
    topics: ["cost-insurance", "outpatient-registration"],
    keywords: ["하이패스", "진료비 하이패스", "후불결제", "신용카드", "무인수납", "수납 없이", "익일 결제", "알림톡", "처방전", "Hi-pass"],
    sources: [SRC.svc],
    owner: "원무팀",
    reviewer: "원무팀",
  },
  c90: {
    stages: ["surgery"],
    topics: ["surgery-anesthesia", "guardian"],
    keywords: ["로봇수술", "로봇 수술", "다빈치", "로봇수술센터", "수술 전 준비", "금식", "수술 보호자", "전립선", "자궁", "갑상선", "수술 후 주의사항"],
    sources: [SRC.svc],
    reviewer: "로봇수술센터",
  },

  // ── 퇴원 ──
  c35: { stages: ["discharge", "post-discharge"], topics: ["discharge-recovery"], keywords: ["퇴원", "퇴원약", "퇴원 수속", "복약", "상처 관리", "응급실"], sources: [SRC.discharge, SRC.legacy], owner: "원무팀" },

  // ── 병원 이용·행정·응급 ──
  c43: { stages: ["arrival-registration", "hospital-facilities"], topics: ["facilities-location"], keywords: ["검사실 위치", "검사실", "층별안내", "채혈실", "CT실", "영상의학과 접수", "키오스크", "번호표"], sources: [SRC.floor, SRC.lab, SRC.svc] },
  c44: { stages: ["arrival-registration", "outpatient", "hospital-facilities"], topics: ["facilities-location", "outpatient-registration"], keywords: ["진료실 위치", "진료과 위치", "층별안내", "진료과", "본관 층별안내", "1층 평면도", "위치안내도"], sources: [SRC.floor, SRC.svc] },
  c45: { stages: ["arrival-registration", "outpatient"], topics: ["outpatient-registration"], keywords: ["접수", "수납", "진료절차", "초진", "재진", "요양급여의뢰서", "1층 위치안내도", "하이패스"], sources: [SRC.process, SRC.svc], owner: "원무팀" },
  c46: {
    stages: ["surgery", "inpatient", "emergency"],
    topics: ["guardian"],
    keywords: ["보호자", "대기공간", "휴게공간", "면회", "중환자실", "응급실 보호자"],
    sources: [SRC.visit, SRC.er, SRC.staff],
    audience: "guardian",
  },
  c47: { stages: ["discharge", "post-discharge", "hospital-facilities"], topics: ["administration-certificates"], keywords: ["제증명", "진단서", "소견서", "의무기록", "사본발급", "영상CD", "입퇴원확인서"], sources: [SRC.cert, SRC.record], owner: "원무팀" },
  c48: { stages: ["arrival-registration", "hospital-facilities"], topics: ["facilities-location"], keywords: ["주차", "주차요금", "무료주차", "선불 기간권", "주차 환불", "복지카드", "셔틀버스", "지하철", "버스", "오시는 길"], sources: [SRC.parking, SRC.way, SRC.svc] },
  c49: { stages: ["post-discharge", "hospital-facilities"], topics: ["cost-insurance"], keywords: ["실손보험", "비급여", "진료비", "세부내역서", "납입증명서"], sources: [SRC.convenience, SRC.cert], owner: "원무팀" },
  c50: { stages: ["pre-visit", "arrival-registration"], topics: ["outpatient-registration"], keywords: ["진료협력센터", "진료의뢰서", "처음 오신 분", "타병원"], sources: [SRC.refer, SRC.process] },
  c72: { stages: ["emergency"], topics: ["emergency", "guardian"], keywords: ["응급실", "응급진료", "응급의료센터", "119"], sources: [SRC.er] },
};

/** 기존 콘텐츠에 분류·출처·검토 상태 필드를 덧붙입니다. 기존 필드는 건드리지 않습니다. */
export function applyClassification(guide: GuideContent): GuideContent {
  const c = CLASSIFICATION[guide.contentId];
  return {
    ...guide,
    journeyStages: c ? c.stages : guide.journeyStages,
    topicCategories: c ? c.topics : guide.topicCategories,
    keywords: c ? c.keywords : guide.keywords,
    audience: c ? (c.audience ?? "both") : guide.audience,
    sourceDocuments: c?.sources ?? guide.sourceDocuments,
    ownerDepartment: guide.ownerDepartment ?? c?.owner,
    reviewerDepartment: guide.reviewerDepartment ?? c?.reviewer,
    // 승인 기록이 없는 콘텐츠는 모두 "작성 중 / 미승인"입니다. 임의로 승인 처리하지 않습니다.
    reviewStatus: guide.reviewStatus ?? "draft",
    approvalStatus: guide.approvalStatus ?? "unapproved",
    classificationReview: c?.review ? { reason: c.review } : guide.classificationReview,
  };
}

/** 분류 검토 대상 여부: 명시적으로 표시됐거나, 여정 단계·주제가 비어 있는 경우 */
export function needsClassificationReview(guide: GuideContent): boolean {
  return (
    Boolean(guide.classificationReview) ||
    (guide.journeyStages ?? []).length === 0 ||
    (guide.topicCategories ?? []).length === 0
  );
}

export function classificationReviewReason(guide: GuideContent): string | null {
  if (guide.classificationReview) return guide.classificationReview.reason;
  if ((guide.journeyStages ?? []).length === 0 || (guide.topicCategories ?? []).length === 0) {
    return "여정 단계 또는 주제가 지정되지 않았습니다.";
  }
  return null;
}
