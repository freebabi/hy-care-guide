import { applyClassification } from "./classification";
import type { GuideContent } from "./types";
import { slugEquals } from "./slug";
import { EXTRA_GUIDES } from "./guides-data-extra";

/**
 * 프로토타입용 Mock 콘텐츠입니다. 구체적인 수치(금식 시간, 복용법 등)는
 * 예시이며, 실제 게시 전 반드시 병원 공식 검토(주치의/간호부/약제부 등)를
 * 거쳐야 합니다. `needsClinicalReview: true` 항목은 특히 더 필요합니다.
 *
 * Phase 1에서는 환자 데이터와 연결하지 않습니다. `slug`는 환자에게
 * 전달되는 고정 URL(/c/[slug])에 쓰이며 개인정보를 포함하지 않습니다.
 */
const RAW_GUIDES: GuideContent[] = [
  // ───────────────────── 검사 (32) ─────────────────────
  {
    contentId: "c01",
    slug: "ct-prep",
    title: "CT 검사 안내",
    category: "검사",
    subcategory: "CT",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "조영제 사용 여부에 따른 금식 시간부터 검사 당일 절차, 검사 후 주의사항까지 CT 검사 전 과정을 안내합니다.",
    importantNotice:
      "조영제를 사용하는 검사인 경우 신장질환·조영제 알레르기·임신 여부·당뇨약(메트포르민 성분) 복용 여부를 검사 전 반드시 알려주셔야 합니다.",
    before:
      "[조영제를 사용하는 CT]\n• 검사 4시간 전부터 금식 (복부는 6시간, 물은 소량 가능)\n• 6개월 이내 신장수치(eGFR) 혈액검사 필요 — 없으면 당일 채혈 (결과 확인 약 1시간~1시간 30분)\n\n[조영제를 사용하지 않는 CT]\n• 금식 불필요\n• 검사 부위의 금속(장신구·보청기·틀니 등) 제거",
    during:
      "① 영상의학과 접수 (서관 3층 국제병원 CT실은 CT실에서 직접 접수)\n② 검사복으로 환복\n③ 조영제 검사만: 혈관주사 삽입\n④ 대기 후 검사 (5~15분)\n⑤ 주사 부위 지혈 후 귀가\n\n조영제가 들어갈 때 몸이 뜨겁거나 입안에서 쇠 맛이 날 수 있으며, 곧 사라지는 정상 반응입니다.",
    after:
      "• 조영제 배출을 돕기 위해 충분한 수분(3컵)을 드세요\n• 두드러기·가려움·호흡곤란이 있으면 즉시 영상의학과 또는 응급실로 연락하세요\n• 바로 일상생활이 가능합니다\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    faq: [
      { question: "보호자가 검사실에 함께 들어갈 수 있나요?", answer: "방사선 안전을 위해 환자분만 입장하는 것이 원칙입니다. 거동이 불편하시면 담당 방사선사와 상의해주세요." },
      { question: "금속 임플란트가 있어도 검사할 수 있나요?", answer: "네, CT는 금속 때문에 제한되는 경우가 거의 없습니다. 검사 전에 알려주세요." },
      { question: "임신 중인데 CT를 찍어도 되나요?", answer: "임신(가능성 포함) 사실은 접수 시 반드시 먼저 알려주세요. 담당 의료진이 진행 여부를 판단합니다." },
    ],
    location: "본관 3층 영상의학과 CT촬영실 · 서관 3층 국제병원 CT실",
    contact: "영상의학과 CT실 02-2290-9175 (예약·변경 02-2290-9738) · 평일 08:30~17:30, 토 08:30~12:30",
    relatedContentIds: ["c10", "c14"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c02",
    slug: "mri-prep",
    title: "MRI 검사 안내",
    category: "검사",
    subcategory: "MRI",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "조영제 사용 여부에 따른 금식 시간부터 검사 당일 절차, 검사 후 주의사항까지 MRI 검사 전 과정을 안내합니다.",
    importantNotice:
      "체내 금속 삽입물(인공관절, 심장박동기, 인공와우, 신경자극기 등)이나 문신·반영구화장이 있는 경우 반드시 사전에 알려주세요.",
    before:
      "• 화장과 금속 물질(시계·보청기·틀니·머리핀·벨트·액세서리 등)은 모두 제거해주세요\n• 폐쇄공포감이 있다면 미리 알려주세요\n\n[조영제를 사용하는 MRI]\n• 4~6시간 이상 금식\n• 6개월 이내 신장수치(eGFR) 혈액검사 필요\n\n[조영제를 사용하지 않는 MRI]\n• 금식 불필요 (복부 MRI는 4~6시간 금식)\n\n[만 6세 이하 아동]\n• 예약 1시간 전 도착, 검사 6시간 전부터 금식, 검사 4시간 전부터 재우지 않기",
    during:
      "검사 중 소음이 발생하므로 귀마개를 착용할 수 있습니다.\n조영제를 사용하는 경우 검사 전 정맥주사를 삽입합니다.\n검사는 30분에서 1시간 걸리며, 움직이지 않고 누워 계셔야 합니다.",
    after:
      "조영제를 사용한 경우 배출을 돕기 위해 충분한 수분(3컵) 섭취를 권장합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    faq: [
      { question: "폐쇄공포증이 있는데 검사가 가능한가요?", answer: "사전에 알려주시면 진정제 사용이나 수면 검사 등 대안을 상의할 수 있습니다." },
      { question: "검사 중 \"쿵쿵, 땅땅\" 소리가 크게 나요.", answer: "자기장을 사용하는 과정에서 나는 정상적인 기계 소음이며, 귀마개나 헤드폰을 제공합니다." },
      { question: "치아 임플란트나 인공관절이 있어도 검사할 수 있나요?", answer: "최근 제품은 대부분 가능하지만, 검사 전 반드시 의료진에게 알리고 안전성을 확인받아야 합니다." },
    ],
    location: "본관 3층 영상의학과 MRI촬영실",
    contact: "영상의학과 MRI실 02-2290-9179 (예약·변경 02-2290-9738) · 평일 08:30~17:30, 토 08:30~12:30",
    images: [{ assetId: "mri-process-01", placement: "during" }],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 5,
    lastUpdated: "2026-11-10",
  },
  {
    contentId: "c03",
    slug: "xray-prep",
    title: "X-ray 검사 안내",
    category: "검사",
    subcategory: "X-ray",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "X-ray 촬영 시 준비사항과 소요 시간을 안내합니다.",
    importantNotice: "임신 중이거나 임신 가능성이 있다면 촬영 전에 꼭 알려주세요.",
    before:
      "• 특별한 준비나 금식은 필요하지 않은 경우가 많습니다\n• 촬영 부위의 금속(목걸이·시계·단추·지퍼 등)은 제거해주세요\n• 통증이 심하거나 움직이기 어려우면 미리 말씀해주세요",
    during:
      "① 영상의학과 접수 후 검사실 앞에서 대기\n② 호명되면 입실, 안내에 따라 자세를 잡고 잠시 움직이지 않기 (필요 시 숨 참기)\n③ 촬영은 부위당 5분 이내로 끝납니다",
    after:
      "바로 일상생활이 가능합니다.\n영상 CD·사본은 본관 3층 사본발급처에서 발급받을 수 있습니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 3층 영상의학과 일반촬영실",
    contact: "영상의학과 X-ray 02-2290-9171 · 평일 08:30~17:30, 토 08:30~12:30",
    relatedContentIds: ["c57"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c04",
    slug: "ultrasound-prep",
    title: "초음파 검사 안내",
    category: "검사",
    subcategory: "초음파",
    departments: ["영상의학과", "내과"],
    patientStages: ["before-test"],
    summary: "모든 초음파 검사에 공통인 접수·진행 순서입니다. 검사 부위별 준비사항은 '관련 안내'에서 확인해주세요.",
    importantNotice: "금식 여부는 검사 부위마다 다릅니다. 상복부 초음파는 금식이 필요하니 부위별 안내를 꼭 확인해주세요.",
    before:
      "• 접수 시간보다 10~15분 일찍 도착해주세요\n• 이전 초음파·CT·MRI 자료가 있으면 가져오세요\n• 임신 중이거나 가능성이 있다면 미리 알려주세요",
    during:
      "① 수납 후 본관 3층 영상의학과에서 접수\n② 초음파실 앞 전광판을 확인하고 호명될 때까지 대기\n③ 검사 부위에 젤을 바르고 촬영 (통증 없음)\n\n검사 중 자세를 바꾸거나 숨을 참으라는 안내가 있을 수 있습니다.",
    after:
      "젤을 휴지로 닦으면 바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 3층 영상의학과 초음파검사실",
    contact: "영상의학과 검사예약 02-2290-9738",
    relatedContentIds: ["c51", "c52", "c53", "c54", "c55", "c56"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c05",
    slug: "gastroscopy-prep",
    title: "위내시경 검사 안내",
    category: "검사",
    subcategory: "위내시경",
    departments: ["소화기내과"],
    patientStages: ["before-test"],
    summary: "위내시경 검사 절차와 진정 내시경 여부에 따른 주의사항을 안내합니다.",
    before: "검사 전 8시간 금식이 필요합니다(물 포함, 담당 부서 안내 우선).",
    during: "진정 내시경으로 진행하는 경우, 검사 후 직접 운전은 삼가고 보호자와 동행해주세요.",
    after: "검사 후 목 이물감이 있을 수 있으며 대부분 자연히 호전됩니다. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    faq: [{ question: "혈압약은 먹어도 되나요?", answer: "소량의 물과 함께 복용 가능한 경우가 많으나, 담당 의료진 확인이 필요합니다." }],
    location: "서관 6층 소화기 내시경 검사실",
    contact: "소화기내과 검사예약 02-2290-8114",
    relatedContentIds: ["c07", "c46", "c75"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-08-01",
  },
  {
    contentId: "c06",
    slug: "colonoscopy-prep",
    title: "대장내시경 검사 안내",
    category: "검사",
    subcategory: "대장내시경",
    departments: ["소화기내과"],
    patientStages: ["before-test"],
    summary: "대장내시경 검사를 위한 장 정결 준비 절차를 안내합니다.",
    importantNotice: "장 정결제는 처방받은 시간과 방법을 반드시 지켜서 복용해주세요.",
    before: "검사 전날 저녁부터 저잔사식 위주로 섭취하고, 처방된 장 정결제를 복용합니다.",
    during: "검사 당일에는 물 이외의 음식 섭취를 피해주세요.",
    after: "가스가 찬 느낌이 있을 수 있으며 시간이 지나면 호전됩니다. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "서관 6층 소화기 내시경 검사실",
    contact: "소화기내과 검사예약 02-2290-8114",
    relatedContentIds: ["c05", "c46", "c75"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-08-01",
  },
  {
    contentId: "c07",
    slug: "blood-test",
    title: "채혈 및 임상검사 안내",
    category: "검사",
    subcategory: "채혈 및 임상검사",
    departments: ["진단검사의학과", "전과공통"],
    patientStages: ["before-test", "admitted"],
    summary: "채혈 검사 전후 확인 사항을 안내합니다.",
    before: "검사 항목에 따라 8~12시간 금식이 필요할 수 있습니다.",
    during:
      "채혈실 순번에 따라 이름과 등록번호를 확인한 뒤 진행하며, 검사 항목에 따라 1~3개 튜브 정도의 혈액을 채취합니다. 소요 시간은 5분 이내로 짧습니다.",
    after: "채혈 부위는 5분 이상 지그시 눌러 지혈해주세요. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 3층 진단검사의학과 채혈실",
    contact: "대표전화 02-2290-8114",
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c08",
    slug: "biopsy-prep",
    title: "조직검사 안내",
    category: "검사",
    subcategory: "조직검사",
    departments: ["외과", "소화기내과"],
    patientStages: ["before-test"],
    summary: "조직검사 절차와 결과 확인까지 걸리는 기간을 안내합니다.",
    importantNotice: "항응고제(혈액을 묽게 하는 약) 복용 중이라면 검사 전 반드시 의료진과 상의해주세요.",
    before:
      "항응고제나 아스피린 계열 약물을 복용 중이라면 검사 며칠 전부터 중단이 필요할 수 있으니 사전에 반드시 담당 의료진과 상의해주세요. 검사 부위에 따라 금식이 필요할 수 있습니다.",
    during:
      "국소마취 후 바늘이나 특수 기구로 조직을 채취하며, 부위에 따라 10~30분 정도 소요됩니다. 검사 중 눌리는 느낌이나 약간의 통증이 있을 수 있습니다.",
    after: "검사 부위 통증이나 소량의 출혈이 있을 수 있으며, 조직검사 결과는 통상 5~7일 소요됩니다. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c09",
    slug: "pet-ct-prep",
    title: "PET-CT 검사 안내",
    category: "검사",
    subcategory: "PET-CT",
    departments: ["핵의학과"],
    patientStages: ["before-test"],
    summary: "방사성의약품을 이용한 PET-CT 검사 준비사항을 안내합니다.",
    importantNotice: "검사 전날부터 격렬한 운동을 피하고, 당일 검사 전 6시간 금식이 필요합니다.",
    before: "혈당이 높으면 검사가 지연될 수 있어, 당뇨가 있는 경우 사전에 알려주세요.",
    during: "약물 주입 후 1시간가량 안정을 취한 뒤 촬영이 진행되며, 촬영 자체는 20~30분 정도 소요됩니다.",
    after:
      "검사 후 방사성의약품 배출을 돕기 위해 충분한 수분(3컵) 섭취를 권장합니다. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 핵의학과 PET-CT/감마카메라실",
    contact: "핵의학과 검사예약 02-2290-8114",
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c10",
    slug: "contrast-media",
    title: "조영제 검사 및 부작용 안내",
    category: "검사",
    subcategory: "조영제 검사 및 부작용",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "조영제를 사용하는 검사 전 확인이 필요한 사항을 안내합니다.",
    importantNotice: "조영제 알레르기 반응 경험이 있거나 신장 기능에 이상이 있다면 반드시 검사 전 의료진에게 알려주세요.",
    before: "당뇨약(메트포르민 계열) 복용 중이라면 사전에 담당 의료진과 복용 중단 여부를 상의해주세요.",
    during:
      "검사 종류에 따라 정맥주사 또는 경구로 조영제를 투여합니다. 이상 증상이 느껴지면 즉시 의료진에게 알려주세요.\n\n투여할 때 이런 느낌이 들 수 있으며, 조영제가 혈관을 일시적으로 넓혀서 생기는 정상 반응입니다. 곧 사라집니다.\n• 온몸이 뜨거운 느낌\n• 소변을 지리는 듯한 느낌 (실제로 소변이 나오지는 않습니다)\n• 입안의 쇠 맛·쓴맛",
    after:
      "• 조영제 배출을 돕기 위해 충분한 수분(3컵)을 드세요\n• 어지러움·두드러기 등 이상 반응이 있으면 즉시 알려주세요\n• 주사 부위가 부으면 냉·온찜질과 휴식으로 지켜보되, 손끝 저림·감각 저하·피부색 변화·물집이 생기거나 통증이 점점 심해지면 병원에 내원하세요\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    faq: [
      { question: "수유 중인데 조영제 검사를 받아도 되나요?", answer: "네, 정상적인 모유 수유가 가능합니다. 걱정되신다면 검사 후 24시간 동안 유축해서 버린 뒤 수유를 재개하셔도 됩니다." },
    ],
    location: "본관 3층 영상의학과",
    contact: "영상의학과 검사예약 02-2290-9738",
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c11",
    slug: "ekg-prep",
    title: "심전도 검사 안내",
    category: "검사",
    subcategory: "심전도",
    departments: ["심장내과"],
    patientStages: ["before-test"],
    summary: "심전도 검사 절차와 소요 시간을 안내합니다.",
    before: "검사 전 특별한 준비는 필요 없으나, 로션이나 오일 사용은 전극 부착을 방해할 수 있어 피해주세요.",
    during: "상의를 탈의하고 가슴, 팔, 다리에 전극을 부착해 5분 이내로 측정합니다.",
    after: "검사 후 특별한 제한 없이 바로 일상생활이 가능합니다. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "서관 5층 심전도실",
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c12",
    slug: "echocardiography-prep",
    title: "심장초음파 검사 안내",
    category: "검사",
    subcategory: "심장초음파",
    departments: ["심장내과"],
    patientStages: ["before-test"],
    summary: "심장초음파 검사 준비사항과 소요 시간을 안내합니다.",
    before: "별도의 금식 없이 진행되나, 담당 부서 안내를 우선 확인해주세요.",
    during: "검사는 30분 내외로 진행되며 왼쪽으로 누운 자세를 취하게 됩니다.",
    after:
      "검사 후 특별한 제한 없이 바로 일상생활이 가능합니다. 젤은 닦아내시면 됩니다. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "서관 5층 심장내과 심장초음파실",
    contact: "심장내과 검사예약 02-2290-8114",
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c13",
    slug: "nuclear-medicine-prep",
    title: "핵의학검사 안내",
    category: "검사",
    subcategory: "핵의학검사",
    departments: ["핵의학과"],
    patientStages: ["before-test"],
    summary: "뼈scan 등 핵의학검사 절차와 소요 시간을 안내합니다.",
    before: "방사성의약품 주입 후 촬영까지 대기 시간이 있을 수 있습니다.",
    during: "방사성의약품을 주사한 후 검사 종류에 따라 수십 분에서 몇 시간의 대기 시간을 거쳐 촬영을 진행합니다. 촬영 자체는 통증이 없습니다.",
    after: "검사 후 방사성의약품 배출을 돕기 위해 충분한 수분(3컵) 섭취를 권장합니다. 검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 핵의학과",
    contact: "핵의학과 검사예약 02-2290-8114",
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c14",
    slug: "fasting-guide",
    title: "검사 전 금식 가이드",
    category: "검사",
    subcategory: "검사 전 금식 가이드",
    departments: ["전과공통"],
    patientStages: ["before-test"],
    summary: "검사 종류별 금식 기준을 한눈에 정리한 공통 안내입니다.",
    importantNotice: "검사별 금식 시간이 다르므로 반드시 담당 부서 안내를 우선 확인해주세요.",
    before:
      "일반채혈: 8~12시간 금식 (검사 항목에 따라 다름)\n초음파: 상복부 8시간 이상 금식 / 하복부는 방광 채우기 / 그 외 해당없음\n내시경: 위내시경 8시간 금식 / 대장내시경은 전날 장 정결, 당일 물 외 금식\nPET-CT: 6시간 금식\nCT: 조영제 사용 시 4시간 금식 (복부 6시간) / 조영제 미사용 해당없음\nMRI: 조영제 사용 시 4~6시간 금식 / 조영제 미사용 해당없음 (복부 MRI는 4~6시간 금식)\nX-RAY: 해당없음\n투시조영검사: 검사별로 다르므로 예약 시 안내 확인",
    phaseLabelOverride: { before: "검사 종류" },
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c15",
    slug: "mammography-prep",
    title: "유방촬영(맘모그래피) 검사 안내",
    category: "검사",
    subcategory: "유방촬영(맘모그래피)",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "유방촬영 검사 시 준비사항과 촬영 시 유의사항을 안내합니다.",
    importantNotice: "임신 중이거나 임신 가능성이 있으면 검사 전에 꼭 말씀해 주세요.",
    before:
      "• 검사 당일 데오드란트·파우더는 사용하지 마세요\n• 상의·하의가 분리된 옷을 권장합니다\n• 유방 수술 이력과 타병원 검사 영상(CD 등)이 있으면 알려주세요\n• 가슴 보형물이 있어도 촬영할 수 있으니 미리 알려주세요",
    during:
      "① 수납 후 본관 3층 영상의학과에서 접수\n② 본관 2층 5번 검사실로 이동, 탈의실(검사실 왼쪽)에서 가운으로 갈아입기\n③ 유방을 두 판으로 눌러 촬영 (5~15분)\n\n• 일반 복장은 상의만, 원피스는 상·하의 모두 갈아입습니다\n• 압박 시 몇 초간 아플 수 있으니 심하면 바로 말씀해 주세요\n• 귀중품은 탈의실에 두지 말고 직접 가지고 입실하세요",
    after:
      "압박 부위가 일시적으로 눌린 느낌이 있을 수 있으나 곧 회복되며, 바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    faq: [
      { question: "추가 촬영을 하라고 하면 이상이 있는 건가요?", answer: "아닙니다. 조직이 겹쳐 보이거나 특정 부위를 확대해 확인해야 할 때, 자세·호흡으로 영상이 흐릿할 때도 추가 촬영을 합니다." },
      { question: "유방초음파도 함께 받아야 하나요?", answer: "유방촬영은 미세석회화를, 초음파는 치밀유방 속 혹을 잘 찾아 서로 보완합니다. 필요한 검사는 의료진이 판단합니다." },
    ],
    location: "본관 2층 5번 검사실(유방촬영실) · 접수는 본관 3층 영상의학과",
    contact: "유방검사 02-2290-9170 (예약·변경 02-2290-9738) · 평일 08:30~17:30",
    relatedContentIds: ["c58", "c59", "c60", "c61", "c53"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-02",
  },

  // ── 초음파: 검사 부위별 ──
  {
    contentId: "c51",
    slug: "abdominal-ultrasound",
    title: "복부(상·하복부) 초음파 검사 안내",
    category: "검사",
    subcategory: "복부 초음파",
    departments: ["영상의학과", "내과"],
    patientStages: ["before-test"],
    summary: "간·담낭·췌장·신장·방광·전립선 등을 보는 상·하복부 초음파의 준비사항을 안내합니다.",
    importantNotice: "상복부는 8시간 이상 금식, 하복부는 방광을 채우고 방문하세요.",
    before:
      "[상복부 — 간·담낭·담도·췌장·비장·신장]\n• 검사 8시간 이상 전부터 금식 (물은 소량 가능)\n\n[하복부 — 방광·전립선·고환 등]\n• 방광을 채운 상태로 방문, 검사 직전에는 화장실에 가지 않기\n\n[공통]\n• 껌·담배는 피해주세요 (장내 가스가 영상을 흐리게 합니다)\n• 복용 중인 약은 처방 의료진에게 확인하고, 당뇨약은 꼭 상의하세요",
    during:
      "검사는 약 5~10분 걸립니다.\n전립선 검사는 검사실에서 옷을 갈아입습니다.\n가스나 복부 지방으로 잘 보이지 않으면 CT·MRI 등 추가 검사를 안내할 수 있습니다.",
    after:
      "젤을 닦으면 바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 3층 영상의학과 초음파검사실",
    contact: "영상의학과 검사예약 02-2290-9738",
    relatedContentIds: ["c04", "c14"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c52",
    slug: "thyroid-ultrasound",
    title: "갑상선·경부 초음파 검사 안내",
    category: "검사",
    subcategory: "갑상선·경부 초음파",
    departments: ["영상의학과", "내과"],
    patientStages: ["before-test"],
    summary: "갑상선·목 림프절·침샘을 보는 초음파의 준비사항을 안내합니다.",
    before: "• 금식·물 섭취 제한이 없습니다\n• 목걸이 등 장신구를 풀고, 목이 드러나는 편한 옷을 입어주세요",
    during:
      "검사는 약 5~10분 걸립니다.\n본관 2층 갑상선·유방 초음파실(5번 검사실)은 접수가 오전 10시 10분에 마감되며, 오후에는 본관 3층 초음파실에서 진행합니다.",
    after:
      "젤을 닦으면 바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 5번 검사실(갑상선·유방 초음파실)",
    contact: "영상의학과 검사예약 02-2290-9738",
    relatedContentIds: ["c04", "c56"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c53",
    slug: "breast-ultrasound",
    title: "유방 초음파 검사 안내",
    category: "검사",
    subcategory: "유방 초음파",
    departments: ["영상의학과", "외과"],
    patientStages: ["before-test"],
    summary: "유방·겨드랑이 림프절을 보는 초음파의 준비사항을 안내합니다.",
    before:
      "• 금식·물 섭취 제한이 없습니다\n• 상의·하의가 분리된 옷을 입고 오세요\n• 이전 유방촬영·초음파 자료가 있으면 가져오세요",
    during:
      "검사는 약 10~25분 걸립니다.\n본관 2층 갑상선·유방 초음파실(5번 검사실)은 접수가 오전 10시 10분에 마감되며, 오후에는 본관 3층 초음파실에서 진행합니다.",
    after:
      "젤을 닦으면 바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 5번 검사실(갑상선·유방 초음파실)",
    contact: "유방검사 02-2290-9170 (예약·변경 02-2290-9738) · 평일 08:30~17:30",
    relatedContentIds: ["c15", "c04", "c56"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c54",
    slug: "vascular-doppler-ultrasound",
    title: "혈관 도플러 초음파 검사 안내",
    category: "검사",
    subcategory: "혈관 도플러 초음파",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "경동맥·팔다리 혈관을 보는 도플러 초음파의 준비사항을 안내합니다.",
    before: "• 경동맥·팔다리 혈관 검사는 특별한 준비가 없습니다\n• 검사실에서 옷을 갈아입으니 편한 복장으로 오세요",
    during: "검사는 약 5~15분 걸립니다.",
    after:
      "젤을 닦으면 바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 3층 영상의학과 초음파검사실",
    contact: "영상의학과 검사예약 02-2290-9738",
    relatedContentIds: ["c04"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c55",
    slug: "musculoskeletal-ultrasound",
    title: "근골격 초음파 검사 안내",
    category: "검사",
    subcategory: "근골격 초음파",
    departments: ["영상의학과", "정형외과"],
    patientStages: ["before-test"],
    summary: "손·발·어깨·고관절 등 근육·관절을 보는 초음파의 준비사항을 안내합니다.",
    before:
      "• 금식·물 섭취 제한이 없습니다\n• 검사 부위를 쉽게 드러낼 수 있는 옷을 입으세요\n• X-ray 처방이 있으면 촬영 후 초음파를 시행합니다\n• 이전 X-ray·MRI 자료가 있으면 가져오세요",
    during: "손·발·어깨·고관절·연부조직, 소아 천골 dimple·DDH 검사를 시행하며 약 5~15분 걸립니다.",
    after:
      "젤을 닦으면 바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 3층 영상의학과 초음파검사실",
    contact: "영상의학과 검사예약 02-2290-9738",
    relatedContentIds: ["c04", "c03"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c56",
    slug: "ultrasound-guided-biopsy",
    title: "초음파 유도 세포흡인·조직검사 안내",
    category: "검사",
    subcategory: "초음파 유도 세포흡인·조직검사",
    departments: ["영상의학과", "외과"],
    patientStages: ["before-test"],
    summary: "초음파를 보며 유방·갑상선 등의 결절에서 조직을 얻는 검사의 준비사항과 검사 후 주의사항을 안내합니다.",
    importantNotice: "아스피린·항응고제 등 항혈전제를 중단하지 않았다면 검사 당일 반드시 알려주세요.",
    before:
      "• 외래에서 동의서를 작성한 뒤 방문하세요\n• 출혈이 잘 멎지 않았던 적이나 약물 알레르기가 있으면 알려주세요\n• 임신 중이거나 가능성이 있다면 미리 알려주세요",
    during: "검사는 약 15~20분 걸립니다.",
    after:
      "• 검사 부위를 눌러 지혈해주세요\n• 출혈·부기·심한 통증이 있으면 병원에 문의하세요\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 3층 영상의학과 초음파검사실",
    contact: "영상의학과 검사예약 02-2290-9738",
    relatedContentIds: ["c04", "c08"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },

  // ── X-ray: 류마티스 ──
  {
    contentId: "c57",
    slug: "rheumatology-xray",
    title: "류마티스 X-ray 검사 안내",
    category: "검사",
    subcategory: "류마티스 X-ray",
    departments: ["영상의학과", "내과"],
    patientStages: ["before-test"],
    summary: "류마티스 관절염의 뼈·관절 변화를 확인하는 X-ray입니다. 일반 X-ray와 접수 장소가 다릅니다.",
    importantNotice: "임신 중이거나 임신 가능성이 있다면 촬영 전에 꼭 알려주세요.",
    before:
      "• 촬영 부위의 금속 물품은 제거해주세요\n• 다른 병원에서 찍은 류마티스 관련 X-ray·영상 CD가 있으면 가져오세요\n• 환자등록카드 또는 영수증을 가져오세요",
    during:
      "① 류마티스병원(동관) 1층 무인수납기에서 접수\n② 대기 전광판에서 순서 확인\n③ 호명되면 입장 — 양쪽 관절을 비교하기 위해 좌우 모두 촬영\n\n질환의 진행을 보기 위해 추적검사를 하기도 합니다 (담당 의사가 결정).",
    after:
      "바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "류마티스병원(동관) 1층 방사선촬영실",
    contact: "류마티스 X-ray 촬영실 02-2290-9242 · 평일 08:30~17:30, 토 08:30~12:30",
    relatedContentIds: ["c03"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },

  // ── 유방: 촬영·조직검사 종류별 ──
  {
    contentId: "c58",
    slug: "breast-tomosynthesis",
    title: "3D 유방 단층촬영술 안내",
    category: "검사",
    subcategory: "3D 유방 단층촬영술(Tomosynthesis)",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "유방 조직을 얇은 단면으로 나눠 찍는 정밀 촬영입니다.",
    importantNotice: "임신 중이거나 임신 가능성이 있으면 검사 전에 꼭 말씀해 주세요.",
    before: "• 준비는 기본 유방촬영과 같습니다 (데오드란트·파우더 금지, 상·하의 분리된 옷)",
    during:
      "• 기본 유방촬영과 방식은 비슷합니다\n• 치밀유방이나 조직이 겹쳐 2D에서 보기 어려웠던 병변을 더 명확히 구분합니다\n• 숨 참는 시간이 2~3초 더 길 수 있습니다\n• 장비가 움직여도 몸에 닿지 않으니 편안히 자세를 유지하세요",
    after:
      "바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 5번 검사실(유방촬영실) · 접수는 본관 3층 영상의학과",
    contact: "유방검사 02-2290-9170 (예약·변경 02-2290-9738) · 평일 08:30~17:30",
    relatedContentIds: ["c15"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c59",
    slug: "breast-magnification-view",
    title: "유방 확대 촬영술 안내",
    category: "검사",
    subcategory: "유방 확대 촬영술(Magnification View)",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "기본 촬영에서 확인된 특정 부위를 확대해 자세히 보는 추가 검사입니다.",
    importantNotice: "암이 확진되어서 하는 검사가 아니라, 병변의 모양을 선명하게 확인하기 위한 과정입니다.",
    before: "• 준비는 기본 유방촬영과 같습니다 (데오드란트·파우더 금지, 상·하의 분리된 옷)",
    during:
      "• 미세석회화·미세 병변이 보인 부위만 확대해 촬영합니다\n• 확인이 필요한 부위만 국소적으로 압박합니다\n• 압박 위치를 잡는 과정이 다소 정교하게 진행될 수 있습니다",
    after:
      "바로 일상생활이 가능합니다.\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 5번 검사실(유방촬영실) · 접수는 본관 3층 영상의학과",
    contact: "유방검사 02-2290-9170 (예약·변경 02-2290-9738) · 평일 08:30~17:30",
    relatedContentIds: ["c15"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c60",
    slug: "breast-stereotactic-biopsy",
    title: "입체정위 유방 생검술 안내",
    category: "검사",
    subcategory: "입체정위 유방 생검술",
    departments: ["영상의학과", "외과"],
    patientStages: ["before-test"],
    summary: "유방촬영에서 보인 미세석회화 등의 병변을 3차원으로 위치를 잡아 조직을 채취하는 검사입니다.",
    importantNotice: "임신 중이거나 임신 가능성이 있으면 검사 전에 꼭 말씀해 주세요.",
    before:
      "• 유방촬영에서 확인된 병변 중 조직검사가 필요한 부위가 대상입니다\n• 유방 수술 이력과 타병원 검사 영상(CD 등)이 있으면 알려주세요",
    during: "입체정위 원리로 병변 위치를 3차원으로 정확히 측정한 뒤, 생검용 바늘로 조직을 채취합니다.",
    after:
      "• 병원에서 약 30분 지혈한 뒤 추가 출혈(통증·부음)이 없는지 확인하고 귀가합니다\n• 2~3일간 검사 부위에 물이 닿지 않게 하세요\n• 음주와 격렬한 운동은 삼가세요\n• 통증·열감이 계속되거나 부기가 심해지고 호흡곤란이 있으면 병원에 문의하세요\n• 조직검사 결과는 보통 7일 이후에 나옵니다\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 5번 검사실 · 접수는 본관 3층 영상의학과",
    contact: "유방검사 02-2290-9170 (예약·변경 02-2290-9738) · 평일 08:30~17:30",
    relatedContentIds: ["c15", "c61", "c08"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },

  // ── 투시조영검사: 검사 종류별 ──
  {
    contentId: "c62",
    slug: "upper-gi-small-bowel-series",
    title: "상부위장관·소장조영검사 안내",
    category: "검사",
    subcategory: "상부위장관·소장조영검사",
    departments: ["영상의학과", "소화기내과"],
    patientStages: ["before-test"],
    summary: "조영제를 마시며 식도 하부·위·십이지장·소장을 X선으로 실시간 확인하는 검사입니다.",
    importantNotice: "과거 조영제 이상반응(두드러기·호흡곤란 등)이 있었거나 임신 가능성이 있다면 검사 전에 꼭 알려주세요.",
    before: "• 검사 전 금식이 필요합니다\n• 흡연·껌 섭취는 피해주세요\n• 복용약은 병원 안내를 따르세요",
    during:
      "① 검사대에 올라 안내에 따라 자세를 취합니다\n② 조영제와 발포제(공기를 만드는 약)를 마십니다\n③ 조영제가 지나가는 모습을 보며 몸을 돌리거나 복부를 압박해 촬영합니다\n\n• \"트림을 참으세요\" 등 방송 안내에 따라주세요\n• 복부 팽만감이 있을 수 있습니다\n• 소장조영검사는 소장 전체를 통과할 때까지 촬영해 시간이 더 걸립니다",
    after:
      "• 변비가 생길 수 있으니 수분 제한이 없다면 물을 충분히 드세요\n• 1~2일간 대변 색이 하얗거나 밝게 나올 수 있으며 정상입니다\n• 심한 복통·지속적인 구토·심한 복부 팽만이 있으면 의료진에게 알려주세요\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    relatedContentIds: ["c14", "c10"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c63",
    slug: "esophagography",
    title: "식도조영검사 안내",
    category: "검사",
    subcategory: "식도조영검사",
    departments: ["영상의학과", "소화기내과"],
    patientStages: ["before-test"],
    summary: "조영제를 삼키며 식도의 형태와 음식물이 내려가는 과정을 확인하는 검사입니다.",
    importantNotice: "과거 조영제 이상반응(두드러기·호흡곤란 등)이 있었거나 임신 가능성이 있다면 검사 전에 꼭 알려주세요.",
    before: "• 검사 종류에 따라 금식이 필요할 수 있으니 음식·음료 섭취 여부는 병원 안내를 따르세요",
    during:
      "① 검사대에서 안내에 따라 자세를 취합니다\n② 안내에 따라 조영제를 삼킵니다\n③ 식도를 지나는 모습을 보며 여러 자세로 촬영합니다\n\n조영제가 기도로 들어가는지 확인하는 촬영도 있으니, 의료진이 안내하는 순간에 삼키고 임의로 움직이지 마세요.",
    after:
      "• 수분 제한이 없다면 물을 충분히 드세요\n• 두드러기·호흡곤란·심한 어지러움이 있으면 즉시 의료진에게 알려주세요\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    relatedContentIds: ["c14", "c10"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c64",
    slug: "barium-enema",
    title: "대장조영검사 안내",
    category: "검사",
    subcategory: "대장조영검사",
    departments: ["영상의학과", "소화기내과"],
    patientStages: ["before-test"],
    summary: "조영제로 직장과 대장의 형태·상태(협착, 폐색 등)를 확인하는 검사입니다.",
    importantNotice: "과거 조영제 이상반응(두드러기·호흡곤란 등)이 있었거나 임신 가능성이 있다면 검사 전에 꼭 알려주세요.",
    before:
      "• 대장에 변이 남아 있으면 검사가 어려워 장 정결이 중요합니다\n• 병원에서 안내받은 식이 제한·금식·하제 복용 방법을 정확히 따라주세요",
    during:
      "① 검사대에 옆으로 눕습니다\n② 직장에 카테터를 넣고 조영제(및 공기)를 주입합니다\n③ 대장이 채워지는 모습을 보며 여러 자세로 촬영합니다\n\n변이 마려운 느낌이나 복부 팽만감이 생길 수 있으며, 심하면 참지 말고 말씀해주세요.",
    after:
      "• 바륨 조영제를 사용한 경우: 변비가 생길 수 있으니 수분 제한이 없다면 물을 충분히 드시고, 1~2일간 대변 색이 하얗거나 밝게 나올 수 있으며 정상입니다\n• 심한 복통·지속적인 구토·심한 출혈이 있으면 의료진에게 알려주세요\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    relatedContentIds: ["c14", "c10"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c65",
    slug: "urethrography-cystography",
    title: "요도·방광조영검사 안내",
    category: "검사",
    subcategory: "요도·방광조영검사",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "조영제로 요도(RUG)와 방광의 형태·이상 여부를 확인하는 검사입니다.",
    importantNotice: "과거 조영제 이상반응(두드러기·호흡곤란 등)이 있었거나 임신 가능성이 있다면 검사 전에 꼭 알려주세요.",
    before: "• 준비사항은 예약 시 안내받은 내용을 확인해주세요",
    during:
      "[요도조영(RUG) — 요도 협착·손상 확인]\n① 검사대에 눕고 검사 부위를 소독합니다\n② 필요하면 검사관을 넣고 조영제를 주입합니다\n③ 요도를 지나는 모습을 여러 자세로 촬영합니다\n\n[방광조영 — 방광 형태·이상 확인]\n① 방광에 카테터를 넣고 조영제를 주입합니다\n② 방광이 채워지는 모습을 촬영합니다\n③ 조영제를 배출하고 다시 촬영한 뒤 카테터를 제거합니다\n\n약간의 불편감이나 소변이 마려운 느낌이 있을 수 있습니다.",
    after:
      "• 수분 제한이 없다면 물을 충분히 드세요\n• 두드러기·얼굴·목 부종·호흡곤란이 있으면 즉시 의료진에게 알려주세요\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    relatedContentIds: ["c66", "c10"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c66",
    slug: "vcug",
    title: "소아 배뇨성 방광요도조영검사(VCUG) 안내",
    category: "검사",
    subcategory: "소아 배뇨성 방광요도조영검사(VCUG)",
    departments: ["영상의학과"],
    patientStages: ["before-test"],
    summary: "소변을 볼 때 소변이 방광에서 요관으로 거꾸로 흐르는지(방광요관역류, VUR) 확인하는 소아 검사입니다.",
    importantNotice: "과거 조영제 이상반응이 있었다면 검사 전에 꼭 알려주세요.",
    before: "• 대부분 특별한 금식이 필요하지 않을 수 있으나, 검사 목적과 환자 상태에 따라 다르니 병원 안내를 따르세요",
    during:
      "① 검사대에 눕고 소독 후, 요도를 통해 방광에 카테터를 넣어 조영제를 채웁니다\n② 방광이 채워지는 동안과 소변을 보는 동안 역류가 있는지 촬영합니다\n③ 검사실 안 화장실에서 남은 소변을 모두 본 뒤, 배뇨 후 촬영을 합니다\n\n카테터 때문에 아이가 불편하거나 긴장할 수 있으니, 보호자는 아이가 검사에 협조하도록 도와주세요.",
    after:
      "• 수분 제한이 없다면 물을 충분히 드세요\n• 두드러기·호흡곤란이 있으면 즉시 의료진에게 알려주세요\n검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    relatedContentIds: ["c65"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c67",
    slug: "tkra-fluoroscopy",
    title: "무릎관절 전치환술(TKRA) 정밀검사 안내",
    category: "검사",
    subcategory: "무릎관절 전치환술(TKRA) 정밀검사",
    departments: ["영상의학과", "정형외과"],
    patientStages: ["before-test"],
    summary: "투시 장비로 여러 자세에서 인공관절의 위치와 무릎을 움직일 때의 상태를 확인하는 검사입니다.",
    importantNotice: "임신 중이거나 임신 가능성이 있다면 검사 전에 꼭 알려주세요.",
    before: "• 검사 부위의 금속물·액세서리를 제거하고 검사복으로 갈아입을 수 있습니다",
    during: "의료진의 방송에 따라 무릎을 굽히거나 엎드리는 등 자세를 바꾸며 촬영합니다.",
    after: "검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    faq: [
      {
        question: "일반 X-ray를 찍었는데 왜 또 투시검사를 하나요?",
        answer: "일반 X-ray는 다리 전체의 정렬과 구조를 보고, 투시 정밀검사는 여러 자세에서 인공관절의 위치와 움직일 때의 상태를 확인합니다.",
      },
    ],
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    relatedContentIds: ["c03"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c68",
    slug: "swallowing-study",
    title: "연하검사(VFSS·MBS) 안내",
    category: "검사",
    subcategory: "연하검사(VFSS & MBS)",
    departments: ["영상의학과", "재활의학과"],
    patientStages: ["before-test"],
    summary: "음식을 삼키는 과정을 X선 영상으로 보며 삼킴 기능과 흡인 여부를 평가하는 검사입니다.",
    before: "• 금식이 필요 없는 경우도 있으나 검사 목적과 환자 상태에 따라 다르니, 검사 전 식사 여부는 병원 안내를 따르세요",
    during:
      "① 검사대 또는 장비 앞에서 자세를 취합니다\n② 제공되는 음식·음료를 삼키면 입→인두→식도로 넘어가는 과정을 촬영합니다\n③ 필요하면 자세나 삼키는 방법을 바꿔 평가합니다\n\n음식물이 기도로 들어가는 흡인 여부를 확인하니, 의료진의 지시에 따라 삼켜주세요.",
    after: "검사 결과는 예약된 진료일에 담당 교수님을 통해 안내받습니다.",
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },

  // ───────────────────── 수술·시술 (11) ─────────────────────
  {
    contentId: "c16",
    slug: "surgery-guide",
    title: "수술 안내",
    category: "수술",
    subcategory: "수술 전·중·후",
    departments: ["외과", "정형외과"],
    patientStages: ["before-surgery", "admitted"],
    summary: "입원 및 수술 전 준비물부터 수술 당일 절차, 수술 후 회복 과정까지 전 과정을 안내합니다.",
    importantNotice:
      "복용 중인 모든 약물(건강기능식품 포함)을 입원 시 의료진에게 알려주세요. 수술 후 심한 통증, 출혈, 고열이 있으면 즉시 담당 간호사에게 알려주세요.",
    before:
      "• 수술 전날 자정부터 금식이 필요하며, 세부 시간은 담당 병동 안내를 따라주세요\n• 복용 중인 모든 약물(건강기능식품 포함)은 입원 시 의료진에게 알려주세요\n• 의료진 확인 없이 임의로 복용을 중단하거나 지속하지 마세요\n• 수술 동의서 작성과 마취 사전 상담은 별도 안내에 따라 진행됩니다",
    during:
      "수술 전날 병동에서 환복, 정맥주사 확보 등 수술 준비를 마친 후 수술 당일 수술 스케줄대로 수술 준비실로 이동하며, 이동 전 의료진의 최종 확인 절차를 거칩니다.\n수술 진행 안내는 입원 시 등록한 보호자 번호로 문자 발송되며 수술이 끝나면 담당의가 결과를 안내합니다.",
    after:
      "• 마취 회복 후 의료진 지시에 따라 단계적으로 식이를 진행합니다\n• 통증·배액관·상처 상태를 의료진이 주기적으로 확인합니다\n• 심한 통증, 출혈, 고열이 있으면 즉시 담당 간호사에게 알려주세요",
    faq: [
      {
        question: "보호자는 수술 중 어디서 기다리나요?",
        answer: "입원하신 병실에서 대기하실 수 있으며, 본관 3층 응급실 보호자 대기실을 이용할 수 있습니다.",
      },
      {
        question: "수술 진행 상황은 어디에서 볼 수 있나요?",
        answer:
          "수술실 앞에는 보호자 대기공간이 없지만, 본관 5층 수술실 앞 ‘수술환자현황’ 화면(DID)으로 수술 진행 현황을 볼 수 있습니다. 화면에는 집도과별로 대기·수술중·회복중·완료 상태가 표시됩니다. 입원 시 등록한 보호자 번호로도 문자로 안내합니다.",
        assetId: "or-guardian-did-01",
      },
    ],
    location: "본관 5층 수술실 · 본관 3층 응급실 보호자 대기실",
    relatedContentIds: ["c19", "c22", "c82", "c90"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 4,
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c19",
    slug: "post-surgery-recovery",
    title: "수술 후 회복 관리 안내",
    category: "수술",
    subcategory: "수술 후 통증·식사·재활",
    departments: ["외과", "정형외과", "마취통증의학과", "재활의학과"],
    patientStages: ["admitted"],
    summary: "수술 후 통증 조절, 단계별 식이 진행, 재활운동과 폐 합병증 예방(인스피로미터 사용법)까지 회복 전 과정을 안내합니다.",
    importantNotice:
      "통증을 참기보다 담당 의료진에게 통증 정도를 알려 적절한 조절을 받으시고, 무리한 운동은 오히려 회복을 늦출 수 있으니 반드시 담당 의료진의 운동 처방을 따르세요.",
    during:
      "수술 후 통증을 조절이 필요한 경우 언제든지 의료진에게 알려주시기 바랍니다. 자가 통증 조절 장치(PCA)를 사용하는 경우 사용법을 담당 간호사에게 안내받으며, 정해진 용량 안에서 스스로 조절할 수 있습니다.",
    after:
      "[식사]\n• 장 기능 회복 정도에 따라 의료진이 금식 → 유동식 → 일반식 순으로 단계적으로 조절합니다\n\n[호흡 운동 — 인스피로미터(폐활량 운동기구)]\n• 폐렴·무기폐 예방을 위해 하루 여러 차례 사용하세요\n• 마우스피스를 입에 물고 천천히 최대한 깊게 들이마셔 공이나 피스톤을 목표 높이까지 올린 뒤, 2~3초 유지하고 천천히 내쉽니다\n\n[재활 운동]\n• 의료진이 안내하는 범위 안에서 단계적으로 관절 운동 범위를 늘려가세요\n• 무리한 운동은 회복을 늦출 수 있으니 담당 의료진의 운동 처방을 따르세요\n\n[수술 부위 관리]\n• 드레싱은 담당 의료진이 주기에 맞춰 교체합니다.\n• 상처 부위에 발적·진물·열감이 있으면 감염 가능성이 있으니 즉시 병원에 문의하세요",
    faq: [
      {
        question: "인스피로미터는 왜 사용하나요?",
        answer:
          "수술 후 얕은 호흡이 지속되면 폐렴 등 폐 합병증 위험이 높아집니다. 인스피로미터로 깊은 호흡을 반복 연습하면 폐가 완전히 펴지는 데 도움이 되어 합병증을 예방할 수 있습니다.",
      },
    ],
    relatedContentIds: ["c89", "c90"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c22",
    slug: "surgery-consent",
    title: "수술 동의서 및 마취 상담 안내",
    category: "수술",
    subcategory: "수술 동의서 작성 및 마취 사전 상담",
    departments: ["외과", "정형외과", "마취통증의학과"],
    patientStages: ["before-surgery"],
    summary: "수술 동의서 작성 절차와 마취 방법·위험도를 확인하는 마취 사전 상담 절차를 함께 안내합니다.",
    before:
      "[수술 동의서]\n• 집도의의 수술 설명을 들은 후 환자 본인 또는 법정대리인이 입원하신 병동(병실)에서 서명합니다\n\n[마취 사전 상담 — 본관 5층 마취통증의학과]\n• 기존 질환, 복용 약물, 마취 관련 과거력을 정확히 알려주세요",
    location: "입원 병동(수술 동의서) · 본관 5층 마취통증의학과(마취 사전 상담)",
    relatedContentIds: ["c87"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c24",
    slug: "procedure-before-after",
    title: "시술 전후 안내",
    category: "수술",
    subcategory: "전후 관리",
    departments: ["외과", "내과", "심장내과", "소화기내과"],
    patientStages: ["before-surgery", "admitted"],
    summary: "수술보다 회복이 짧은 대표 시술(관상동맥조영술/스텐트 삽입술, 내시경 용종절제술, 중심정맥관/케모포트 삽입술) 전후 유의사항을 안내합니다.",
    importantNotice:
      "이 통합 안내는 초기 예시 문구이며 금식 시간 등의 수치와 지침은 병원 자료로 확인되지 않았습니다. 환자 안내에는 시술별 개별 안내(관상동맥조영술·스텐트 삽입술·내시경 용종절제술·중심정맥관/케모포트)를 사용해 주세요.",
    before:
      "[공통]\n• 금식 여부와 항응고제(혈액을 묽게 하는 약)·아스피린 계열 약물 중단 여부를 담당 의료진과 반드시 상의하세요\n\n[관상동맥조영술 · 스텐트 삽입술]\n• 시술 4~6시간 전부터 금식\n• 항응고제 복용 중이면 사전에 중단 여부를 상의\n\n[내시경 용종절제술]\n• 8시간 이상 금식 (위내시경·대장내시경과 동일)\n• 대장 용종절제술은 장 정결제 복용이 추가로 필요\n\n[중심정맥관 · 케모포트 삽입술]\n• 금식 없이 진행되는 경우가 많지만, 항응고제 복용 여부는 사전에 확인",
    after:
      "[공통]\n• 시술 부위 안정을 위해 당일은 무리한 활동을 피하세요\n• 지혈 부위를 압박·고정합니다\n\n[관상동맥조영술 · 스텐트 삽입술]\n• 시술 부위(손목 또는 사타구니)를 일정 시간 압박 고정합니다\n• 지혈 후에도 당일은 무리한 걸음이나 운전을 피하세요\n\n[내시경 용종절제술]\n• 출혈 예방을 위해 시술 후 며칠간 자극적인 음식, 무리한 운동, 항응고제 재복용을 피하고 의료진 안내를 따르세요\n\n[중심정맥관 · 케모포트 삽입술]\n• 삽입 부위 소독과 드레싱 교체 주기를 의료진 안내에 따라 지키세요\n• 발적·부종·발열이 있으면 즉시 알려주세요",
    // "시술"은 "수술" 카테고리 필터 안에 있지만 서로 다른 개념이라, 이 콘텐츠에서
    // 노출되는 "수술" 문구(구간 라벨, 상단 배지·배너)는 전부 "시술"로 재정의합니다.
    phaseLabelOverride: { before: "시술 전", after: "시술 후" },
    categoryLabelOverride: "시술",
    relatedContentIds: ["c70", "c73", "c74", "c75", "c76", "c84"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-09-19",
  },
  {
    contentId: "c61",
    slug: "breast-lesion-localization",
    title: "유방 병변 위치 결정술 안내",
    category: "수술",
    subcategory: "유방 병변 위치 결정술(Localization)",
    departments: ["영상의학과", "외과"],
    patientStages: ["before-surgery"],
    summary: "수술 전, 만져지지 않는 유방 병변의 위치를 영상으로 확인해 미리 표시하는 시술입니다.",
    importantNotice: "시술 중에는 정확한 위치를 잡을 수 있도록 움직이지 마시고, 안내받은 자세를 유지해 주세요.",
    before:
      "• 유방촬영 또는 초음파를 보며 미세한 바늘(유도선)을 병변 위치에 넣어 수술 부위를 표시합니다\n• 바늘 위치를 영상으로 확인한 뒤, 피부 밖으로 나온 부분은 소독하고 거즈·테이프로 고정합니다",
    during: "시술 중에는 절대 움직이지 마세요. 움직이면 정확한 위치를 잡기 어렵습니다.",
    after:
      "• 유도선이 빠지거나 위치가 바뀌지 않도록 상체 움직임을 최소화하세요\n• 피부 밖으로 나온 유도선은 손으로 만지거나 절대 잡아당기지 마세요",
    phaseLabelOverride: { before: "시술 전", during: "시술 당일", after: "시술 후" },
    categoryLabelOverride: "시술",
    location: "본관 2층 5번 검사실 · 접수는 본관 3층 영상의학과",
    contact: "유방검사 02-2290-9170 (예약·변경 02-2290-9738) · 평일 08:30~17:30",
    relatedContentIds: ["c15", "c60"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c69",
    slug: "fluoroscopic-spine-injection",
    title: "척추 주사치료(투시 유도) 안내",
    category: "수술",
    subcategory: "투시 유도 척추 주사치료",
    departments: ["영상의학과", "마취통증의학과"],
    patientStages: ["before-surgery"],
    summary: "투시 영상으로 척추 후관절 위치를 확인해 스테로이드·국소마취제를 주입하는 통증·염증 치료입니다.",
    importantNotice: "항응고제·항혈소판제 복용 여부, 스테로이드·국소마취제 이상반응 이력, 임신 가능성을 미리 알려주세요.",
    before: "• 의료진의 사전 안내를 확인해주세요\n• 복용 중인 약은 임의로 중단하지 말고 의료진에게 알려주세요",
    during:
      "① 엎드리거나 지정된 자세를 취하고 소독합니다\n② 투시 영상으로 목표 지점을 확인합니다 (필요하면 소량의 조영제로 주사침 위치를 다시 확인)\n③ 치료 약물을 주입하고 주사침을 제거합니다",
    after:
      "• 주사 부위가 일시적으로 아프거나 뻐근할 수 있습니다\n• 활동·귀가 여부는 의료진 안내에 따르세요\n• 심한 통증·출혈·발열이 있으면 의료진에게 알려주세요",
    phaseLabelOverride: { before: "시술 전", during: "시술 당일", after: "시술 후" },
    categoryLabelOverride: "시술",
    location: "본관 2층 7번 투시조영검사실 · 접수는 본관 3층 영상의학과",
    contact: "투시조영검사실 02-2290-9172 · 평일 08:30~17:30",
    relatedContentIds: ["c70"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c70",
    slug: "interventional-radiology",
    title: "영상의학과 인터벤션(영상중재시술) 안내",
    category: "수술",
    subcategory: "영상의학과 인터벤션",
    departments: ["영상의학과"],
    patientStages: ["before-surgery", "admitted"],
    summary: "영상으로 보며 가느다란 카테터·바늘로 진단·치료하는 시술입니다. 대부분 피부를 크게 절개하지 않습니다.",
    importantNotice: "복용 중인 약(항혈소판제·항응고제·당뇨약)은 임의로 중단하지 말고 의료진에게 알려주세요.",
    before:
      "[시술 종류]\n• 신경·두경부: 뇌혈관조영술, 경동맥 스텐트, 뇌동맥류 색전술, 급성 뇌경색 혈전제거술 등\n• 복부·혈관: 간동맥 화학색전술(TACE), 혈관성형술·스텐트, 담낭·담도·농양 배액술, 케모포트·PICC·투석용 카테터 삽입 등\n• 근골격: 요추 경막외 주사, 척수강내 항암제 주입\n• 호흡기: 폐결절 조직검사, 기관지동맥 색전술\n\n[준비]\n• 금식 시간을 확인하세요 (시술·마취 방법에 따라 다름)\n• 모든 복용 약과 알레르기(조영제·약물)를 알려주세요\n• 신장질환·당뇨·임신 가능성·최근 발열이나 감염도 알려주세요\n• 설명을 듣고 동의서를 확인합니다",
    during:
      "① 환자 확인\n② 소독·마취 (국소·진정·전신 중 시술에 맞게 선택)\n③ 영상을 보며 시술\n④ 지혈·삽입관 고정\n⑤ 회복 후 병실로 이동\n\n• 불편하거나 아프면 바로 알려주세요\n• 영상 확인을 위해 움직이지 말아야 하는 순간이 있습니다\n• 보호자 입실은 일반적으로 제한됩니다",
    after:
      "• 안정 시간과 걷기 시작하는 시기는 시술 부위에 따라 다르니 의료진 안내를 따르세요\n• 식사·물은 의료진이 가능하다고 안내한 뒤 시작하세요\n• 시술 부위에서 피가 나면 깨끗한 거즈로 강하게 누르고, 멈추지 않거나 부어오르면 즉시 병원에 연락하세요\n• 배액관·케모포트·PICC 등은 임의로 당기거나 열지 말고, 발적·부종·분비물·발열이 있으면 알려주세요",
    phaseLabelOverride: { before: "시술 전", during: "시술 당일", after: "시술 후" },
    categoryLabelOverride: "시술",
    location: "본관 3층 영상의학과 접수처를 지나 복도 끝 인터벤션실",
    contact: "인터벤션실 02-2290-9178 (시술 준비·일정은 담당 간호사에게 문의)",
    relatedContentIds: ["c24", "c69", "c76", "c84"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },

  // ── 시술별 개별 안내: 병원 공식 자료(Hihy 건강백과, 영상의학과 인터벤션 안내)에서 확인된 내용만 담고,
  //    근거 자료가 없는 항목은 "review-needed"(관련 부서 검토 필요)로 남깁니다. 승인 전까지 공식 안내가 아닙니다. ──
  {
    contentId: "c73",
    slug: "coronary-angiography",
    title: "관상동맥조영술 안내",
    category: "수술",
    subcategory: "시술 · 관상동맥조영술",
    departments: ["심장내과"],
    patientStages: ["before-surgery", "admitted"],
    summary:
      "협심증·심근경색증을 진단하기 위해 심장 혈관(관상동맥)을 직접 촬영하는 가장 정확한 검사입니다. 금식·약 복용 안내와 검사 과정을 쉽게 정리했고, 일부 세부 안내는 담당 부서 검토 중입니다.",
    detail: {
      notice: "금식과 복용 약은 반드시 의료진의 안내를 따라 주세요. 약은 스스로 끊거나 바꾸지 마세요.",
      sections: [
        {
          id: "overview",
          title: "관상동맥조영술이란?",
          icon: "heart",
          blocks: [
            {
              type: "paragraph",
              text: "협심증·심근경색증처럼 심장 혈관이 좁아지거나 막히는 병을 진단하는 검사입니다. 심장에 피를 공급하는 혈관(관상동맥)을 직접 촬영해, 좁아지거나 막힌 곳이 있는지 살펴봅니다.",
            },
            {
              type: "callout",
              tone: "info",
              text: "심전도·핵의학 촬영·심장초음파는 혈관이 좁아진 정도를 간접적으로 알아내는 검사이고, 관상동맥조영술은 혈관을 직접 촬영하는 가장 정확한 방법입니다.",
            },
          ],
        },
        {
          id: "purpose",
          title: "검사의 목적",
          icon: "target",
          blocks: [
            {
              type: "list",
              items: [
                "심장에 혈액을 공급하는 관상동맥이 좁아지거나 막혀 생기는 질환(관상동맥질환)을 진단합니다. 협심증과 심근경색이 대표적입니다.",
                "응급실에서는 급성 심장질환의 원인을 가려내는 여러 검사 중 하나로 시행됩니다. 한양대학교병원 권역응급의료센터는 응급 환자를 위한 관상동맥조영술이 가능하다고 소개하고 있습니다.",
              ],
            },
          ],
        },
        {
          id: "before",
          title: "검사 전 준비",
          icon: "clipboard",
          blocks: [
            {
              type: "callout",
              tone: "warning",
              text: "최소 6시간 금식이 필요합니다. 보통 검사 당일 아침부터 금식합니다.",
            },
            {
              type: "paragraph",
              text: "관을 사타구니 또는 손목의 동맥으로 넣어 시술하므로, 사타구니(서혜부)의 털을 제거하는 준비를 합니다.",
            },
            { type: "paragraph", text: "먹고 있는 약 중 아래 약은 시술 전에 멈추거나 미리 먹어야 할 수 있습니다. 반드시 의료진에게 확인하세요." },
            {
              type: "list",
              items: [
                "피를 묽게 하는 약(와파린 같은 항응고제): 시술 2~5일 전에 멈춰야 할 수 있습니다. 약을 끊기 어렵다면 주사로 바꾸기도 합니다.",
                "당뇨약(메트포르민): 조영제가 콩팥(신장) 기능에 영향을 줄 수 있어 시술 24~48시간 전에 멈춰야 할 수 있습니다.",
                "혈전(피떡)을 막는 약(아스피린·클로피도그렐): 스텐트 등 관상동맥 치료를 함께 할 예정이면 시술 전에 미리 먹게 될 수 있습니다. 필요하면 혈전을 막는 약을 미리 투여합니다.",
                "위고비·마운자로 등은 소화 시간이 지연되어 수술 및 검사 전 중단하거나 금식 시간이 바뀔 수 있습니다.",
                "매일 복용하는 약이 아니라면 복용 주기를 말씀해 주세요.",
              ],
            },
            { type: "callout", tone: "warning", text: "약을 스스로 끊거나 바꾸지 마세요. 먹고 있는 약은 모두 의료진에게 알려 주세요." },
            {
              type: "paragraph",
              text: "조영제(혈관을 잘 보이게 하는 약)에 알레르기나 과민반응을 겪은 적이 있다면 반드시 말씀해 주세요. 미리 조치가 필요합니다. 이전에 약을 먹고 알레르기 등 이상 증상이 있었던 경우도 꼭 알려 주세요.",
            },
            { type: "review-needed", topic: "입원 여부, 검사 당일 준비물, 검사 동의서 안내" },
          ],
        },
        {
          id: "process",
          title: "검사 당일 진행 과정",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "환자 확인", text: "처치 및 시술 전에는 성함과 등록번호를 확인합니다. 직접 말씀하기 어려운 경우 보호자와 함께 확인합니다." },
                { title: "검사실 침대에 눕기", text: "투시기계가 설치된 검사실 침대에 눕습니다." },
                { title: "국소마취", text: "관이 들어갈 부위(사타구니 또는 손목)의 피부에 국소마취를 합니다." },
                { title: "관(카테터) 넣기", text: "가느다란 관을 사타구니(대퇴동맥) 또는 손목(요골동맥) 혈관으로 넣어 심장 혈관 입구까지 이동시킵니다." },
                { title: "조영제 주입과 촬영", text: "관상동맥이 시작되는 곳에서 조영제를 주입하며 여러 각도에서 혈관 모양을 촬영합니다. 검사 중에는 혈압, 맥박, 심전도를 계속 확인합니다." },
                { title: "관 제거와 지혈", text: "검사가 끝나면 관을 빼고, 관이 지나간 동맥을 눌러 피를 멈추게 합니다(지혈)." },
              ],
            },
            { type: "paragraph", text: "검사 시간은 약 30분~1시간입니다." },
            { type: "paragraph", text: "장소: 본관 5층 심혈관촬영실 (평일 08:30~17:30, 토요일 08:30~12:30)" },
            {
              type: "paragraph",
              text: "검사·수술 중에는 보호자 대기공간이 따로 없어, 응급실 옆 휴게공간 또는 본관 3층 휴게공간을 이용해 주세요.",
            },
            { type: "review-needed", topic: "검사 당일 도착 시각, 접수 방법과 상세 진행 순서, 검사 전후 대기·관찰을 포함한 전체 소요 시간" },
          ],
        },
        {
          id: "after",
          title: "검사 후 관찰 및 관리",
          icon: "care",
          blocks: [
            {
              type: "paragraph",
              text: "동맥을 찔러 관이 지나갔기 때문에, 검사 후에는 충분한 지혈이 필요합니다. 손목을 이용한 경우 2~4시간 지혈이 필요하고 사타구니를 이용한 경우 침상 안정이 필요합니다. 자세한 내용은 의료진의 안내를 따라 주세요.",
            },
            { type: "review-needed", topic: "검사 후 관찰 항목(출혈·통증·감각 변화 등)과 환자가 직접 확인할 사항" },
          ],
        },
        {
          id: "recovery",
          title: "귀가 및 회복 관련 안내",
          icon: "home",
          blocks: [
            { type: "review-needed", topic: "귀가 가능 시점, 당일 귀가 또는 입원 여부, 귀가 후 일상생활·운동·샤워·운전 관련 안내" },
          ],
        },
        {
          id: "caution",
          title: "주의사항",
          icon: "alert",
          blocks: [
            {
              type: "callout",
              tone: "warning",
              text: "휴식 시에도 가슴 통증이 20분 이상 지속되거나 니트로글리세린을 써도 통증이 가라앉지 않으면 즉시 응급실을 방문하시기 바랍니다.",
            },
            { type: "paragraph", text: "증상이 심하거나 응급상황으로 판단되는 경우 즉시 119 또는 가까운 응급실을 이용하시기 바랍니다." },
            { type: "review-needed", topic: "검사 후 시술 부위 이상(출혈·부종 등) 발생 시 연락 방법" },
          ],
        },
      ],
      faq: [
        {
          question: "관상동맥조영술은 얼마나 걸리나요?",
          answer: "검사 시간은 약 30분~1시간입니다. 접수와 준비, 검사 후 지혈·관찰 시간까지 합친 전체 시간은 담당 의료진에게 확인해 주세요.",
        },
        {
          question: "조영술을 하면서 치료도 할 수 있나요?",
          answer: "병원 건강백과는 관상동맥 조영술이 진단과 치료(스텐트 삽입)를 동시에 진행할 수 있다고 안내합니다. 치료를 함께 할 예정이면 시술 전에 먹는 약이 달라질 수 있으니 의료진에게 확인해 주세요.",
        },
        {
          question: "손목과 사타구니 중 어디로 하나요?",
          answer: "손목(요골동맥) 또는 사타구니(대퇴동맥) 혈관을 이용합니다. 어느 쪽을 이용할지는 담당 의료진에게 확인해 주세요.",
        },
      ],
    },
    categoryLabelOverride: "시술",
    location: "본관 5층 심혈관촬영실",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c74", "c24", "c77"],
    estimatedReadMinutes: 4,
    status: "게시",
    needsClinicalReview: true,
    version: 3,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c74",
    slug: "coronary-stent",
    title: "관상동맥 스텐트 삽입술 안내",
    category: "수술",
    subcategory: "시술 · 관상동맥 스텐트",
    departments: ["심장내과"],
    patientStages: ["before-surgery", "admitted"],
    summary:
      "좁아진 심장 혈관을 철망(스텐트)으로 넓히는 시술입니다. 시술 후 약 복용이 특히 중요하며, 병원 확인이 끝난 내용만 안내합니다.",
    detail: {
      notice:
        "스텐트 시술 후에는 피를 맑게 하는 약을 먹는데, 임의로 끊으면 혈관이 다시 막혀 매우 위험합니다. 치과 치료나 내시경, 수술이 예정되어 있다면 반드시 심장내과 전문의와 먼저 상의하세요.",
      sections: [
        {
          id: "overview",
          title: "스텐트 삽입술이란?",
          icon: "heart",
          blocks: [
            { type: "paragraph", text: "스텐트 삽입술은 좁아진 혈관을 철망(스텐트)으로 넓히는 시술입니다. 병원 자료에서는 ‘경피적 심혈관 중재시술’이라고도 부릅니다." },
            { type: "paragraph", text: "관상동맥은 심장 근육에 산소를 공급하는 혈관으로, 좁아지거나 막히면 협심증이나 심근경색이 생길 수 있습니다." },
          ],
        },
        {
          id: "difference",
          title: "관상동맥조영술과 무엇이 다른가요?",
          icon: "question",
          blocks: [
            {
              type: "list",
              items: [
                "관상동맥조영술: 혈관 상태를 직접 촬영해 확인하는 가장 정밀한 진단 방법입니다.",
                "스텐트 삽입술: 좁아진 혈관을 철망(스텐트)으로 넓히는 치료 시술입니다.",
              ],
            },
            { type: "paragraph", text: "관상동맥 조영술은 진단과 치료(스텐트 삽입)를 동시에 진행할 수 있다고 안내됩니다." },
          ],
        },
        {
          id: "purpose",
          title: "시술 목적",
          icon: "target",
          blocks: [
            {
              type: "list",
              items: [
                "안정형 협심증: 가슴 통증을 완화시켜 삶의 질을 높입니다.",
                "급성 관상동맥 증후군(불안정 협심증·심근경색): 생존율을 높이는 필수 시술입니다.",
              ],
            },
            { type: "paragraph", text: "심근경색과 협심증은 응급질환으로, 초기에 신속하고 정확하게 진단해 치료하는 것이 중요하다고 안내됩니다." },
          ],
        },
        {
          id: "before",
          title: "시술 전 준비",
          icon: "clipboard",
          blocks: [
            {
              type: "list",
              items: [
                "입원 전 복용 중인 약은 모두 의료진에게 알려 주세요.",
                "이전에 약을 복용했을 때 알레르기 등 이상 증상이 있었다면 꼭 말씀해 주세요.",
                "아스피린 등 항응고제·항혈소판제(피를 묽게 하거나 피가 엉기는 것을 막는 약)는 수술 및 시술 전 중단해야 할 수 있습니다. 중단이 필요한지는 의료진에게 확인하세요.",
              ],
            },
            { type: "review-needed", topic: "시술 전 금식 여부와 시간" },
            { type: "review-needed", topic: "시술 전 복용 약별 중단·유지 지침, 입원 여부, 동의서 안내" },
          ],
        },
        {
          id: "process",
          title: "시술 당일 진행 과정",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "환자 확인", text: "처치 및 시술 전에는 성함과 등록번호를 확인합니다." },
                { title: "혈관 상태 확인", text: "손목 또는 사타구니 동맥에 국소마취를 한 뒤 카테터를 넣어 혈관 상태를 촬영합니다." },
              ],
            },
            { type: "paragraph", text: "장소: 본관 5층 심혈관촬영실 (평일 08:30~17:30, 토요일 08:30~12:30)" },
            { type: "review-needed", topic: "스텐트를 넣는 단계의 상세 순서, 마취·진정 방법, 시술 소요 시간" },
          ],
        },
        {
          id: "after",
          title: "시술 후 관찰 및 관리",
          icon: "care",
          blocks: [
            {
              type: "paragraph",
              text: "시술 후 주의사항으로, 손목을 이용한 경우 2~4시간 지혈이 필요하고 사타구니를 이용한 경우 침상 안정이 필요하다고 안내됩니다. 자세한 내용은 의료진의 안내를 따라 주세요.",
            },
            { type: "review-needed", topic: "시술 후 관찰 항목과 환자가 직접 확인할 사항" },
          ],
        },
        {
          id: "recovery",
          title: "회복 및 생활 관리",
          icon: "home",
          blocks: [
            {
              type: "list",
              items: [
                "스텐트 삽입 후 6개월~1년간은 약(항혈전제: 피가 굳어 혈관이 막히는 것을 막는 약)을 임의로 중단하면 재발 위험이 매우 높습니다.",
                "내시경·치과 치료·수술 등이 예정된 경우 반드시 심장내과 전문의와 상의한 뒤 결정하세요.",
                "체중 감량, 규칙적인 유산소 운동, 저염식이, 금연·금주가 중요합니다.",
                "평소 고혈압·당뇨·고지혈증을 잘 관리하고 정기적인 검진을 받으세요.",
              ],
            },
            { type: "review-needed", topic: "퇴원 후 일상 복귀 시기와 운동 강도" },
          ],
        },
        {
          id: "caution",
          title: "주의사항",
          icon: "alert",
          blocks: [
            {
              type: "callout",
              tone: "warning",
              text: "휴식 시에도 가슴 통증이 20분 이상 지속되거나 니트로글리세린을 써도 통증이 가라앉지 않으면 즉시 응급실을 방문하시기 바랍니다.",
            },
            { type: "paragraph", text: "병원 건강백과의 정보만으로 스스로 판단하지 말고, 약과 치료에 대해서는 반드시 의료진과 상의하세요." },
          ],
        },
      ],
      faq: [
        {
          question: "스텐트 시술 후 약을 중간에 끊어도 되나요?",
          answer:
            "안 됩니다. 스텐트 삽입 후 6개월~1년간은 약(항혈전제: 피가 굳어 혈관이 막히는 것을 막는 약)을 임의로 중단하면 재발 위험이 매우 높습니다. 약을 조절해야 하는 상황이라면 반드시 심장내과 전문의와 상의하세요.",
        },
        {
          question: "치과 치료나 내시경 검사를 받아도 되나요?",
          answer: "내시경·치과 치료·수술 등이 예정된 경우에는 반드시 심장내과 전문의와 먼저 상의하고 결정하셔야 합니다.",
        },
        {
          question: "관상동맥조영술과 스텐트 삽입술은 같은 시술인가요?",
          answer: "목적이 다릅니다. 조영술은 혈관 상태를 확인하는 진단 방법이고, 스텐트 삽입은 좁아진 혈관을 넓히는 치료 시술입니다. 두 가지를 동시에 진행할 수 있다고 안내됩니다.",
        },
      ],
    },
    categoryLabelOverride: "시술",
    location: "본관 5층 심혈관촬영실",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c73", "c24", "c77"],
    estimatedReadMinutes: 4,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-06",
  },
  {
    contentId: "c75",
    slug: "endoscopic-polypectomy",
    title: "내시경 용종절제술 안내",
    category: "수술",
    subcategory: "시술 · 내시경 용종절제술",
    departments: ["소화기내과"],
    patientStages: ["before-surgery", "admitted"],
    summary:
      "대장내시경 중에 대장 용종을 제거하는 시술입니다. 병원 건강백과로 확인된 내용(제거 방법, 시술 후 주의사항)을 안내하며, 세부 준비사항은 담당 부서 검토 중입니다.",
    detail: {
      notice: "용종을 제거한 뒤 심한 복통, 다량의 혈변, 어지러움이 나타나면 즉시 병원을 방문하세요.",
      sections: [
        {
          id: "overview",
          title: "내시경 용종절제술이란?",
          icon: "info",
          blocks: [
            { type: "paragraph", text: "대장 용종은 대장 점막에 생기는 양성 종양(혹)을 통칭하는 말입니다. 대장 용종은 대장내시경을 하는 도중에 제거합니다." },
            { type: "callout", tone: "info", text: "이 안내는 병원 건강백과의 ‘대장 용종’ 설명을 기준으로 합니다." },
            { type: "review-needed", topic: "위·소장 등 대장 이외 부위의 내시경 용종절제술" },
          ],
        },
        {
          id: "purpose",
          title: "시술 목적",
          icon: "target",
          blocks: [
            {
              type: "list",
              items: [
                "대장 용종은 대부분 증상이 없어 대장내시경 검사 중에 우연히 발견됩니다.",
                "일부 용종은 대장암으로 발전할 수 있어 발견 시 제거하는 것이 원칙입니다.",
                "육안으로 악성 여부를 구별하기 어려운 경우가 많아, 발견된 용종은 진단과 치료 목적으로 반드시 제거합니다.",
              ],
            },
            {
              type: "paragraph",
              text: "용종은 크게 두 가지로 나뉩니다. 종양성(선종성) 용종은 대장암으로 발전할 가능성이 있고 크기가 클수록 악성 세포를 포함할 가능성이 높아집니다. 비종양성 용종(과형성 용종, 염증성 용종 등)은 암으로 발전할 가능성이 거의 없습니다.",
            },
          ],
        },
        {
          id: "before",
          title: "시술 전 준비",
          icon: "clipboard",
          blocks: [
            {
              type: "list",
              items: [
                "입원 전 복용 중인 약은 모두 의료진에게 알려 주세요.",
                "아스피린 등 항응고제·항혈소판제(피를 묽게 하거나 피가 엉기는 것을 막는 약)는 수술 및 시술 전 중단해야 할 수 있습니다. 중단이 필요한지는 의료진에게 확인하세요.",
              ],
            },
            { type: "review-needed", topic: "장 정결제 복용 방법과 시간, 식이 제한, 금식 여부" },
            { type: "review-needed", topic: "시술 전 복용 약별 중단·유지 지침, 동의서 안내" },
          ],
        },
        {
          id: "process",
          title: "시술 진행 과정",
          icon: "route",
          blocks: [
            { type: "paragraph", text: "대장 용종은 대장내시경 시행 중에 제거합니다. 용종의 크기와 형태에 따라 다음과 같은 방법을 사용합니다." },
            {
              type: "list",
              items: [
                "겸자 절제술: 집게(겸자)를 이용해 작은 용종을 제거하는 방법입니다.",
                "올가미 절제술: 올가미로 용종을 잡아 제거하는 방법입니다.",
                "점막 절제술: 점막하층에 용액을 주입한 뒤 올가미로 제거하는 방법입니다.",
                "점막하 박리술: 내시경용 칼(knife)을 이용해 점막을 박리하며 제거하는 방법으로, 비교적 큰 병변에 사용합니다.",
              ],
            },
            {
              type: "paragraph",
              text: "용종을 제거했어도 조직검사에서 절제 가장자리에 암이 남아 있거나 암의 침범 깊이가 깊은 경우에는 추가 수술이 필요할 수 있습니다.",
            },
            { type: "paragraph", text: "장소: 서관 6층 소화기 내시경 검사실 (평일 08:30~17:30, 토요일 08:30~12:30)" },
            { type: "review-needed", topic: "수면(진정) 내시경 여부, 시술 소요 시간, 시술 당일 순서" },
          ],
        },
        {
          id: "after",
          title: "시술 후 관찰",
          icon: "care",
          blocks: [
            {
              type: "list",
              items: [
                "용종 제거 후에는 시술 중 공기가 주입되어 일시적인 복부 불편감이 생길 수 있습니다. 가스가 배출되면 호전됩니다.",
                "소량의 혈변은 시술 후 일시적으로 나타날 수 있습니다.",
              ],
            },
            { type: "review-needed", topic: "병원 내 시술 후 관찰 시간과 귀가 가능 기준" },
          ],
        },
        {
          id: "life",
          title: "식사 및 일상생활 관련 안내",
          icon: "home",
          blocks: [
            { type: "list", items: ["시술 후 1~2주는 무리한 운동을 피합니다.", "시술 후 1~2주는 금주합니다."] },
            { type: "review-needed", topic: "시술 후 식사 시작 시기와 식이 내용" },
          ],
        },
        {
          id: "symptom",
          title: "이상 증상이 있을 때",
          icon: "alert",
          blocks: [
            {
              type: "callout",
              tone: "warning",
              text: "심한 복통, 다량의 혈변, 어지러움이 나타나면 즉시 병원을 방문하시기 바랍니다.",
            },
            { type: "paragraph", text: "소량의 혈변이 시술 후 일시적으로 나타날 수 있으나, 증상이 지속되거나 심해지면 전문의에게 연락하시기 바랍니다." },
            { type: "review-needed", topic: "야간·휴일 포함 연락 방법과 연락처" },
          ],
        },
      ],
      faq: [
        {
          question: "대장 용종은 왜 모두 제거하나요?",
          answer:
            "일부 용종은 대장암으로 발전할 수 있고, 육안으로 악성 여부를 구별하기 어려운 경우가 많아 발견된 용종은 진단과 치료 목적으로 반드시 제거합니다.",
        },
        {
          question: "용종을 제거하는 방법에는 어떤 것이 있나요?",
          answer: "용종의 크기와 형태에 따라 겸자 절제술, 올가미 절제술, 점막 절제술, 점막하 박리술 중에서 사용합니다.",
        },
        {
          question: "시술 후 소량의 피가 섞여 나오면 어떻게 하나요?",
          answer:
            "소량의 혈변은 시술 후 일시적으로 나타날 수 있습니다. 증상이 지속되거나 심해지면 전문의에게 연락하시고, 다량의 혈변이나 심한 복통, 어지러움이 있으면 즉시 병원을 방문하세요.",
        },
        {
          question: "시술 후 운동이나 음주는 언제부터 할 수 있나요?",
          answer: "시술 후 1~2주는 무리한 운동을 피하고 금주하도록 안내됩니다.",
        },
      ],
    },
    categoryLabelOverride: "시술",
    location: "서관 6층 소화기 내시경 검사실",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c05", "c06", "c24", "c77"],
    estimatedReadMinutes: 4,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-06",
  },
  {
    contentId: "c76",
    slug: "chemoport-insertion",
    title: "중심정맥관·케모포트 삽입술 안내",
    category: "수술",
    subcategory: "시술 · 중심정맥관·케모포트",
    departments: ["영상의학과", "외과"],
    patientStages: ["before-surgery", "admitted"],
    summary:
      "영상의학과 인터벤션실에서 시행하는 중심정맥관·케모포트 삽입술의 준비, 진행 과정, 시술 후 관리를 안내합니다. 케모포트 고유의 관리 지침은 담당 부서 검토 중입니다.",
    detail: {
      notice:
        "삽입관(PICC, 케모포트, Perm catheter 등)은 관 종류마다 드레싱·샤워·세척 방법이 다릅니다. 병원이 안내한 방법을 따르고, 관을 당기거나 임의로 열지 마세요.",
      sections: [
        {
          id: "overview",
          title: "케모포트란?",
          icon: "info",
          blocks: [
            {
              type: "paragraph",
              text: "영상의학과 인터벤션실에서는 ‘케모포트 삽입술’, ‘말초삽입 중심정맥관(PICC)’, ‘터널식 투석용 카테터(Perm catheter)’ 등의 삽입 시술을 시행합니다.",
            },
            {
              type: "callout",
              tone: "info",
              text: "아래 준비·진행·시술 후 안내는 영상의학과 인터벤션 안내(중재시술 공통)를 기준으로 합니다. 케모포트만의 세부 지침은 별도로 확인이 필요합니다.",
            },
            { type: "review-needed", topic: "케모포트의 구조와 쓰임에 대한 쉬운 설명" },
          ],
        },
        {
          id: "purpose",
          title: "삽입 목적",
          icon: "target",
          blocks: [{ type: "review-needed", topic: "케모포트·중심정맥관을 삽입하는 목적과 대상" }],
        },
        {
          id: "before",
          title: "시술 전 준비",
          icon: "clipboard",
          blocks: [
            {
              type: "list",
              items: [
                "금식: 음식과 물을 언제부터 드시지 말아야 하는지 확인하세요. 시술 종류와 진정·마취 방법에 따라 시간이 다를 수 있습니다.",
                "복용 약: 모든 복용 약을 의료진에게 알려 주세요. 항혈소판제, 항응고제, 당뇨약은 복용 방법이 달라질 수 있으며, 약은 임의로 중단하지 않습니다.",
                "알레르기: 과거 조영제 부작용이나 약물 알레르기를 알려 주세요.",
                "건강 상태: 신장질환, 당뇨, 임신 가능성, 최근 발열이나 감염 등을 알려 주세요.",
                "검사·동의서: 혈액검사와 영상검사를 확인하고, 설명을 들은 뒤 동의서를 확인합니다.",
                "시술 준비: 정맥주사(IV) 확보, 환자복 착용, 액세서리 제거 등을 합니다.",
                "미리 물어볼 것: 마취 방법, 예상 시술 시간, 시술 후 안정 시간, 보호자 대기 장소 등",
              ],
            },
            { type: "review-needed", topic: "케모포트 삽입 시술의 구체적인 금식 시간" },
          ],
        },
        {
          id: "process",
          title: "삽입 과정",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "환자 확인", text: "이름과 생년월일 등으로 예정된 시술을 확인합니다." },
                { title: "시술 준비", text: "동의서와 검사 결과를 확인하고, 필요하면 정맥주사와 모니터링 장비를 준비합니다." },
                { title: "소독·마취", text: "시술 부위를 소독하고 멸균포를 덮습니다. 국소마취, 진정, 전신마취 중 시술과 환자 상태에 맞는 방법을 정합니다." },
                { title: "영상 유도 시술", text: "영상으로 위치를 확인하며 시술합니다. 불편하거나 통증이 있으면 바로 알려 주세요." },
                { title: "지혈·삽입관 고정", text: "혈관 시술 후에는 부위를 지혈하고, 삽입관은 위치를 확인한 뒤 고정합니다." },
                { title: "회복·이동", text: "혈압, 맥박, 산소포화도와 시술 부위를 확인한 뒤 병실 또는 회복 공간으로 이동합니다." },
              ],
            },
            {
              type: "list",
              items: [
                "영상 확인을 위해 움직이지 말아야 하는 순간이 있습니다. 기침, 통증, 호흡곤란, 화장실 등 불편한 점은 임의로 움직이지 말고 먼저 말씀해 주세요.",
                "방사선 사용과 멸균 관리가 필요해 보호자 입실은 일반적으로 제한됩니다. 필요하면 의료진이 별도로 안내합니다.",
              ],
            },
            { type: "paragraph", text: "장소: 본관 3층 영상의학과 접수처를 지나 복도 끝 인터벤션실" },
          ],
        },
        {
          id: "after",
          title: "시술 후 관리",
          icon: "care",
          blocks: [
            {
              type: "list",
              items: [
                "안정: 출혈을 막고 상태를 관찰하기 위해 안정이 필요할 수 있습니다. 안정 시간과 자세, 걷기 시작하는 시기는 시술 부위와 종류에 따라 다릅니다.",
                "식사와 물: 마취·진정 여부와 회복 상태에 따라 다르며, 의료진이 가능하다고 안내한 뒤 시작합니다.",
                "샤워와 운전: 시술 부위, 삽입관 유무, 진정·마취 여부에 따라 달라집니다. 진정이나 마취를 받았다면 운전 제한이 필요할 수 있습니다.",
                "조영제를 사용한 경우 수분 섭취가 도움이 되기도 하지만, 심장·신장질환이 있으면 수분 제한이 필요할 수 있습니다.",
                "집에서 시술 부위에 출혈이 생기면 깨끗한 거즈 등으로 강하게 압박하고, 멈추지 않거나 빠르게 붓는 경우 즉시 의료기관의 도움을 받으세요.",
              ],
            },
            { type: "paragraph", text: "퇴원 시 받은 개별 안내가 있다면 그 지침을 우선합니다." },
          ],
        },
        {
          id: "wound",
          title: "상처 및 피부 관리",
          icon: "hand",
          blocks: [
            {
              type: "list",
              items: [
                "삽입 부위를 깨끗하게 유지하세요.",
                "PICC, 케모포트, Perm catheter는 관 종류마다 드레싱, 샤워, 세척 방법이 다릅니다. 병원이 안내한 방법을 따르세요.",
              ],
            },
            { type: "review-needed", topic: "케모포트의 드레싱 교체 주기·방법, 샤워·목욕, 운동, 포트 사용 및 관리 방법" },
          ],
        },
        {
          id: "infection",
          title: "감염 예방 및 생활 시 주의사항",
          icon: "shield",
          blocks: [
            {
              type: "list",
              items: [
                "삽입관을 당기거나 임의로 열지 마세요.",
                "삽입 부위에 발적, 부종, 통증, 분비물, 발열이 있으면 의료진에게 알려 주세요.",
                "손을 자주 씻고, 외출 시 손 소독제를 사용하세요. (항암화학요법 환자의 일상생활 관리 안내)",
              ],
            },
            {
              type: "callout",
              tone: "warning",
              text: "항암치료로 면역력이 약해질 수 있으며, 발열이나 감염 증상이 생기면 응급상황일 수 있으므로 즉시 병원을 방문해야 합니다.",
            },
            { type: "review-needed", topic: "케모포트 사용 중 일상생활(운동, 목욕, 수면 자세 등) 세부 주의사항" },
          ],
        },
      ],
      faq: [
        {
          question: "시술은 많이 아픈가요? 전신마취로 하나요?",
          answer: "대부분 국소마취로 진행하며 시술에 따라 진정이나 전신마취를 쓸 수도 있습니다. 불편하면 참지 않고 알려 주세요.",
        },
        {
          question: "왜 금식을 해야 하나요?",
          answer: "진정이나 마취 중 위 내용물이 역류해 기도로 들어가는 위험을 줄이기 위해서입니다.",
        },
        {
          question: "혈액희석제(항응고제·항혈소판제)는 어떻게 하나요?",
          answer: "출혈 위험과 중단 시 혈전 위험을 함께 고려해야 하므로, 중단 여부와 시점은 개별 안내를 따르세요. 임의로 중단하지 마세요.",
        },
        {
          question: "당뇨약이나 인슐린은 어떻게 하나요?",
          answer: "금식 여부와 약 종류에 따라 조절 방법이 다르므로 종류와 용량을 미리 의료진에게 알려 주세요.",
        },
        {
          question: "보호자가 시술실에 함께 들어갈 수 있나요?",
          answer: "방사선 사용과 멸균 관리가 필요해 일반적으로 제한됩니다. 필요한 경우 의료진이 별도로 안내합니다.",
        },
      ],
    },
    categoryLabelOverride: "시술",
    location: "본관 3층 영상의학과 접수처를 지나 복도 끝 인터벤션실",
    contact: "인터벤션실 02-2290-9178 (시술 준비·일정은 담당 간호사에게 문의)",
    relatedContentIds: ["c70", "c24", "c78", "c84"],
    estimatedReadMinutes: 5,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-06",
  },


  // ───────────────────── 입원 (7) ─────────────────────
  {
    contentId: "c26",
    slug: "hospital-life",
    title: "입원생활 안내",
    category: "입원",
    subcategory: "입원생활 안내",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary: "입원 준비물부터 복약 관리, 병실 생활 에티켓, 환자복·침구 교환, 식사, 면회 안내까지 입원생활 전반을 한 번에 안내합니다.",
    importantNotice:
      "복용 중인 모든 약(처방약·건강기능식품 포함)은 입원 시 반드시 간호사에게 알려주시고, 확인 전까지 임의로 복용하지 마세요.",
    before:
      "[입원 준비물]\n• 신분증 · 개인 세면도구 · 여벌 속옷 · 지참약(있는 경우)\n\n[복용 중인 약]\n• 처방약과 건강기능식품을 포함해 복용 중인 모든 약을 입원 시 간호사에게 전달해 주시고, 자가약을 임의로 복용하지 마세요.",
    during:
      "• 환자복·침구는 정기적으로 교환해드립니다. 오염되었거나 교환이 필요하면 담당 간호사에게 요청하세요\n• 식사는 처방된 식이(일반식·치료식 등)에 맞춰 병동에서 제공됩니다. 알레르기나 종교상 제한 식품이 있으면 미리 간호사에게 알려주세요\n• 식사 시간(일반 병동 기준): 아침 07:40~08:10 / 점심 12:30~13:00 / 저녁 18:00~18:30 · 보호자 식사는 전액 본인부담입니다. 응급병동은 식사 시간이 다릅니다(‘응급병동 이용 안내’ 참고)\n\n[병실 생활 에티켓]\n• TV·라디오는 이어폰을 사용해주세요\n• 전화 통화는 작은 목소리로 짧게, 가능하면 복도나 지정 장소에서 해주세요\n• 휴대전화는 항상 진동 모드로 설정해주세요\n• 침상 주변은 다른 환자와 보호자의 이동에 방해되지 않도록 정리정돈해주세요\n• 공용 냉장고에는 냄새와 오염 방지를 위해 밀폐용기에 담아 보관해주세요\n\n[병원 생활 안내 자료에 있는 내용]\n• 밤 9시에는 소등하고 대화와 TV 시청을 자제해 주세요\n• 귀중품은 개인 사물함에 보관해 주세요. 본인 부주의로 인한 분실은 병원에서 책임지지 않습니다\n• 담요는 1인 1장 제공되며 오염 시 교환할 수 있습니다. 사용한 세탁물은 세탁물 수집장소에 넣어 주세요\n• 환자 혼동의 우려와 환자 안전을 위해 침상 간 이동은 하지 않습니다\n• 회진 시간은 시간표를 참고해 주세요. 환자와 보호자는 병실에서 대기하며, 궁금한 사항은 메모지에 미리 적어 회진 때 문의해 주세요\n• 보호자식을 원하시면 간호사실에서 신청할 수 있습니다 (보호자 식사는 전액 본인부담)",
    after:
      "감염관리를 위한 보건복지부 지침에 따라 입원 기간 중 지정된 보호자 1명을 제외한 방문객의 면회를 전면 제한합니다.\n간호간병통합병동은 보호자 상주가 제한됩니다.",
    faq: [
      {
        question: "자가약은 계속 먹어도 되나요?",
        answer: "담당 의료진이 확인 후 복용 가능 여부를 알려드립니다. 확인 전까지는 임의로 복용하지 마세요.",
      },
      {
        question: "보호자가 병실에 상주할 수 있나요?",
        answer: "일반병동은 보호자 상주가 가능하나, 간호간병통합병동은 전담 인력이 간호·간병을 제공해 보호자 상주가 제한됩니다.",
      },
    ],
    location: "각 병동 안내데스크",
    contact: "원무팀 입원계 02-2290-8114",
    relatedContentIds: ["c71", "c27", "c34", "c48", "c81", "c88", "c99", "c102", "c96"],
    images: [{ assetId: "hospital-life-01", placement: "during" }],
    estimatedReadMinutes: 4,
    status: "게시",
    needsClinicalReview: false,
    version: 5,
    lastUpdated: "2026-11-10",
  },
  {
    contentId: "c27",
    slug: "ward-facilities",
    title: "편의시설 안내",
    category: "입원",
    subcategory: "편의시설 안내",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary: "식당·카페, 편의점, 은행, 휠체어 대여, 수유실, 건강 측정 등 병원 안 편의시설을 건물·층별로 안내합니다.",
    before:
      "[1층]\n• 안내데스크 — 휠체어 대여\n• 고객서비스센터 · 처음 오신 분 창구 (평일 08:30~17:30)\n• 스마트 고객건강라운지 — 혈압·키·몸무게·BMI 측정 (평일 08:30~17:30)\n• 외래 약국\n• 할리스 커피 (평일 07:00~21:00, 주말 07:00~20:00)\n• 신한은행 ATM\n• 실손보험 청구 키오스크\n• 영상 CD 등록기 (엘리베이터 앞)\n\n[3층]\n• 무인 민원 발급기 — 주민등록등·초본 등 (평일 08:30~17:30)\n• 오피스 센터 — 팩스 · PC(인터넷) 이용 (평일 08:30~17:30)\n• 실손보험 청구 키오스크\n• 영상 CD 등록기 (신경외과 외래 앞, 영상의학과 접수 앞)\n• HY 수유실 — 동관으로 가는 통로 엘리베이터 옆 (08:00~18:00)",
    during:
      "[1층]\n• 장례식장 사무실\n\n[4층]\n• 자동 혈압계 (평일 08:30~17:30)\n• 영상 CD 등록기 (심장내과 외래 앞)\n\n[5층]\n• 자동 혈압계\n\n[6층]\n• 스마트 고객건강라운지 · 자동 혈압계\n• ATM — 신한·하나·국민은행 (24시간)",
    after:
      "[1층]\n• 안내데스크 — 휠체어 대여\n• 식당 마이델플레이스 — 한식·중식 (평일 08:10~18:30, 공휴일 11:00~14:20)\n• 파리바게뜨 — 커피·빵\n• 세븐일레븐 편의점 (24시간)\n• 신한은행 한양대 출장소 (09:00~16:00) · ATM\n• 영상 CD 등록기 (류마티스내과 외래 앞)\n\n[지하 1층]\n• 의료기 매장 — 보청기·노인용품·간호용품 (평일 08:30~19:00, 토 08:30~13:00)",
    phaseLabelOverride: { before: "본관", during: "서관", after: "동관 · 류마티스병원" },
    faq: [
      { question: "휠체어는 어디서 빌릴 수 있나요?", answer: "본관 1층 또는 동관 1층 안내데스크에서 대여할 수 있습니다." },
      { question: "병실 안 냉장고·TV는 어떻게 쓰나요?", answer: "이용 방법은 병동 간호사실에 문의해주세요." },
    ],
    location: "한양대학교병원",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c101", "c102"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 4,
    lastUpdated: "2026-11-02",
  },
  // ── 환자 안전·감염 예방 계열: 병원 공식 환자 안전 안내(STEP 1~4), 면회안내, 5대 예방수칙, 직원 제공 원문에서 확인된 내용만 담습니다.
  //    근거가 없는 항목은 "review-needed"로 남기며, 기존 원문(importantNotice/before/during/faq)은 보존만 하고 직원 화면에서만 접어서 보여줍니다. ──
  {
    contentId: "c29",
    slug: "fall-prevention",
    title: "낙상예방 안내",
    category: "입원",
    subcategory: "낙상예방 안내",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary:
      "입원 중 넘어지거나 미끄러지는 사고를 함께 막기 위한 안내입니다. 병원 공식 안내로 확인된 내용만 담았고, 상황별 세부 지침은 담당 부서 검토 중입니다.",
    importantNotice: "어지러움이 있을 때는 침대에서 천천히 일어나고, 필요 시 호출벨로 도움을 요청하세요.",
    before: "거동이 어려우신 경우 이동 시 보호자분의 도움이 필요합니다. 미끄럼 방지 신발을 착용하며, 발에 맞는 신발을 착용합니다.",
    faq: [
      {
        question: "화장실은 혼자 가도 되나요?",
        answer: "밤에 화장실에 갈 때는 반드시 보호자와 함께 가세요. 어지럽거나 거동이 불편하다면 호출벨을 눌러 도움을 받은 후 이동하세요.",
      },
    ],
    detail: {
      notice: "도움이 필요하면 참지 말고 호출벨(콜벨)로 직원을 불러 주세요. 넘어졌다면 억지로 일어나지 말고 바로 알려 주세요.",
      sections: [
        {
          id: "why",
          title: "낙상이란? 왜 조심해야 하나요?",
          icon: "info",
          blocks: [
            {
              type: "paragraph",
              text: "낙상은 갑자기 몸의 자세가 바뀌어 넘어지거나 바닥으로 떨어지는 것을 말합니다. 병원은 집과 달라 낯설고, 몸 상태도 평소와 다를 수 있어 더 조심해야 합니다.",
            },
            { type: "paragraph", text: "다음에 해당하면 넘어질 위험이 높습니다." },
            {
              type: "list",
              items: ["수술·마취를 받은 뒤", "수면제·진통제를 복용했을 때", "고령 (만 70세 이상은 낙상 고위험으로 분류합니다)", "어지러움이 있을 때"],
            },
            { type: "image", assetId: "fall-call-bell-01" },
            {
              type: "paragraph",
              text: "병원도 함께 노력합니다. 입원할 때 낙상 위험을 평가하고, 수술 후·진정제·혈압약·이뇨제를 쓴 뒤처럼 몸 상태가 바뀌면 다시 평가합니다. 위험이 높은 분은 침대에 표지를 붙이고 환자 팔찌에 스티커를 붙여 모든 직원이 알 수 있게 합니다. 입원할 때 낙상 예방 유인물을 드리고, 호출벨·침대 난간·휠체어 사용법을 알려 드립니다. 침대 난간과 바퀴, 샤워실·화장실 바닥, 조명, 바닥 물기도 병원이 점검합니다.",
            },
          ],
        },
        {
          id: "participate",
          title: "낙상 예방활동 6가지",
          icon: "shield",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "침대 난간(사이드레일)은 항상 올려두세요", text: "침대에서 떨어질 위험이 있습니다." },
                { title: "화장실에서는 손잡이를 잡으세요", text: "미끄러지지 않도록 일어설 때 손잡이를 잡습니다." },
                { title: "난간을 넘지 말고 내린 뒤 내려오세요", text: "난간을 넘지 말고, 반드시 난간을 내린 후 침대에서 내려옵니다." },
                { title: "침대·휠체어 바퀴는 항상 고정하세요", text: "휠체어는 타기 전과 내린 후에 바퀴가 고정되어 있는지 꼭 확인합니다." },
                { title: "수액걸이를 밀 때 조심하세요", text: "수액걸이를 밀면서 이동할 때 넘어지지 않도록 조심합니다." },
                { title: "도움을 요청하세요", text: "갑자기 일어나면 어지러울 수 있으니 도움을 요청합니다." },
              ],
            },
            { type: "image", assetId: "patient-safety-fall-pain-01" },
          ],
        },
        {
          id: "bed",
          title: "침대에서 일어날 때 · 어지러울 때",
          icon: "bed",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "누운 상태", text: "서두르지 말고 한 단계씩 천천히 합니다." },
                { title: "앉기", text: "천천히 일어나 앉습니다." },
                { title: "잠시 기다리기", text: "앉은 채로 잠시 기다리며 어지럽지 않은지 확인합니다." },
                { title: "서기", text: "어지럽지 않을 때 천천히 일어섭니다." },
              ],
            },
            {
              type: "callout",
              tone: "warning",
              text: "어지러우면 서둘러 일어나지 마세요. 앉거나 누운 채로 호출벨을 눌러 직원을 불러 주세요. 수면제·진통제를 먹은 뒤나 수술·마취 후에는 특히 어지러울 수 있습니다.",
            },
          ],
        },
        {
          id: "toilet",
          title: "화장실 이용할 때",
          icon: "walk",
          blocks: [
            {
              type: "list",
              items: [
                "잠자리에 들기 전에 화장실을 다녀오세요.",
                "밤에 화장실에 갈 때는 반드시 보호자(또는 직원)와 함께 가세요. 침대에서 내려올 때도 도움을 받으세요.",
                "화장실에서 일어설 때는 손잡이를 잡으세요.",
                "어지럽거나 거동이 불편하면 혼자 가지 말고 호출벨을 눌러 도움을 받은 뒤 이동하세요.",
              ],
            },
          ],
        },
        {
          id: "walk",
          title: "걸을 때 · 신발과 주변",
          icon: "shoe",
          blocks: [
            {
              type: "list",
              items: [
                "미끄러운 슬리퍼는 절대 신지 마세요. 미끄러운 신발도 신으면 안 됩니다.",
                "발에 맞는 편한 신발을 신으세요.",
                "걸음이 불편하면 이동할 때 보호자의 도움을 받으세요.",
                "바닥에 물건을 두지 않고, 소지품은 손이 닿는 가까운 곳에 두세요.",
              ],
            },
            { type: "review-needed", topic: "보행 보조도구(지팡이·보행기·휠체어) 사용 기준과 방법" },
          ],
        },
        {
          id: "shower",
          title: "샤워실 이용할 때",
          icon: "shield",
          blocks: [
            {
              type: "list",
              items: [
                "물기로 인해 바닥이 미끄러우니 주의하세요.",
                "안전을 위해 안전바와 의자를 이용하세요.",
                "도움이 필요한 경우 호출벨을 눌러주세요.",
              ],
            },
          ],
        },
        {
          id: "call",
          title: "호출벨과 보호자의 도움",
          icon: "bell",
          blocks: [
            {
              type: "list",
              items: [
                "호출벨은 침대 옆, 화장실, 샤워실에 있습니다.",
                "도움이 필요하면 참지 말고 호출벨을 눌러 직원을 불러 주세요.",
                "보호자는 보행이 불편한 환자가 이동할 때 환자 옆에서 팔을 잡아 주세요.",
                "밤에 환자가 화장실에 갈 때는 보호자가 함께 가 주세요.",
              ],
            },
            { type: "review-needed", topic: "호출 후 직원이 올 때까지 기다리는 방법, 보호자가 자리를 비울 때 직원에게 알리는 방법" },
          ],
        },
        {
          id: "move",
          title: "검사·치료받으러 이동할 때",
          icon: "route",
          blocks: [
            {
              type: "list",
              items: [
                "침대나 진찰대에 오르내릴 때는 직원이나 보호자의 도움을 받으세요.",
                "휠체어로 옮겨 탈 때는 바퀴가 잠겨 있는지, 발판이 올려져 있는지 확인합니다.",
                "투석·재활치료를 받은 뒤에는 갑자기 일어나지 말고 충분히 쉬었다가 일어나세요. 어지러우면 직원에게 알려 주세요.",
                "응급실에서는 보호자가 함께 있으며, 이동할 때 항상 동행합니다.",
              ],
            },
          ],
        },
        {
          id: "fall",
          title: "넘어졌을 때",
          icon: "alert",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "억지로 일어나지 마세요", text: "억지로 일어나려고 하지 말고, 호출벨을 누르거나 큰 소리로 주변에 알려 주세요." },
                { title: "바로 알려 주세요", text: "입원 중이면 해당 병동 간호사실, 외래 진료나 방문 중이면 고객지원팀(02-2290-9596~7)에 알립니다." },
                { title: "직원이 확인합니다", text: "직원이 상태를 확인하고 낙상 위험을 다시 평가합니다." },
              ],
            },
            { type: "callout", tone: "warning", text: "다치지 않은 것 같아도 넘어졌다면 반드시 알려 주세요." },
            { type: "paragraph", text: "넘어진 뒤 다음 증상이 있으면 꼭 알려 주세요." },
            { type: "list", items: ["출혈", "두통", "어지러움", "의식 변화"] },
          ],
        },
      ],
      faq: [
        {
          question: "화장실은 혼자 가도 되나요?",
          answer: "밤에 화장실에 갈 때는 반드시 보호자와 함께 가세요. 어지럽거나 거동이 불편하다면 호출벨을 눌러 도움을 받은 후 이동하세요.",
        },
      ],
    },
    relatedContentIds: ["c30", "c80", "c26", "c89"],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: true,
    version: 7,
    createdAt: "2026-09-19",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c30",
    slug: "patient-safety-id",
    title: "환자 안전",
    category: "입원",
    subcategory: "환자 안전",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary:
      "병원이 안내하는 환자 안전 4단계(환자 확인·수술부위 확인·낙상예방·안전한 투약)를 한눈에 보고, 항목별 상세 안내로 이동할 수 있는 안내입니다.",
    importantNotice: "입원 후 모든 순간이 치료결정과정 참여입니다.",
    before:
      "환자 안전을 위해 환자 확인이 필요한 단계마다 이름과 등록번호를 확인합니다. 이름과 등록번호를 말씀해 주세요. 직접 말씀하기 어려우신 환자분의 경우 보호자분과 함께 확인합니다.",
    during: "현재 주요 증상, 과거 질환, 알러지 반응 등 건강 정보를 의료진에게 말씀해 주세요.",
    phaseLabelOverride: { before: "정확한 환자 확인 함께하기", during: "정확한 나의 정보 알려주기" },
    detail: {
      notice: "입원 후 모든 순간이 치료결정과정 참여입니다. 궁금한 점은 언제든 의료진에게 물어보세요.",
      sections: [
        {
          id: "overview",
          title: "환자 안전 4단계",
          icon: "shield",
          blocks: [
            { type: "paragraph", text: "한양대학교병원은 환자 안전을 위해 아래 4가지를 환자·보호자와 함께하자고 안내합니다." },
            {
              type: "steps",
              items: [
                { title: "정확한 환자 확인 함께하기", text: "진료, 투약, 수혈, 검사, 처치·시술 전에 이름과 등록번호를 확인합니다." },
                { title: "정확한 수술부위 확인 함께하기", text: "좌우 구분이 있는 부위나 손가락·발가락·척추 수술은 수술 전에 정확한 부위에 표시가 되어 있는지 함께 확인합니다." },
                { title: "낙상예방 함께하기", text: "이동할 때 도움 받기, 발에 맞는 신발 신기, 잠자기 전 화장실 다녀오기, 호출벨로 도움 요청하기" },
                { title: "안전한 투약 함께하기", text: "복용 중인 약과 약 알레르기 등 이상 반응을 모두 알려 주세요." },
              ],
            },
          ],
        },
        {
          id: "myinfo",
          title: "정확한 나의 정보 알려주기",
          icon: "pill",
          blocks: [
            { type: "list", items: ["현재 주요 증상, 과거 질환, 알러지 반응 등 건강 정보를 의료진에게 말씀해 주세요."] },
          ],
        },
        {
          id: "medication",
          title: "안전한 투약을 위해 알려 주실 것",
          icon: "pill",
          blocks: [
            {
              type: "list",
              items: [
                "입원 전 복용 중인 약은 모두 알려 주세요.",
                "이전에 약을 복용했을 때 알레르기 등 이상 증상이 있었다면 꼭 말씀해 주세요.",
                "아스피린 등 항응고제·항혈소판제(피를 묽게 하거나 피가 엉기는 것을 막는 약)는 수술이나 시술 전 중단해야 할 수 있습니다.",
                "위고비·마운자로 등은 소화 시간이 지연되어 수술이나 검사 전 중단하거나 금식 시간이 바뀔 수 있습니다.",
                "매일 복용하지 않는 약(예: 류마티스 질환에 쓰는 MTX)은 복용 주기를 알려 주세요.",
              ],
            },
            { type: "paragraph", text: "약을 끊거나 바꿀지는 스스로 정하지 말고 의료진에게 확인하세요." },
            { type: "image", assetId: "safe-medication-01" },
          ],
        },
        {
          id: "detail",
          title: "항목별 자세한 안내",
          icon: "route",
          blocks: [
            { type: "paragraph", text: "아래 안내를 참고해 주세요. 관련 콘텐츠에서 항목별로 따로 볼 수 있습니다." },
            {
              type: "list",
              items: ["정확한 환자 확인 안내", "낙상예방 안내", "감염 예방 안내 · 손위생 · 기침 예절", "보호자 협조사항 안내", "치료 결정 과정에 참여하기", "궁금한 점 묻기·불편 사항 말하기"],
            },
            { type: "paragraph", text: "수술·시술 부위를 표시하는 방법은 ‘정확한 환자 확인 안내’의 ‘수술·시술 부위 확인’에서 볼 수 있습니다." },
          ],
        },
      ],
    },
    relatedContentIds: ["c77", "c29", "c33", "c80", "c87", "c88"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 5,
    createdAt: "2026-09-19",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c33",
    slug: "infection-control",
    title: "감염 예방 안내",
    category: "입원",
    subcategory: "감염 예방 안내",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary:
      "병원 안에서 감염을 막기 위해 환자와 보호자가 함께 지킬 수칙을 안내합니다. 손위생과 기침 예절은 각각 독립 안내로 자세히 볼 수 있습니다.",
    importantNotice: "발열, 기침 등 감염 의심 증상이 있으면 병실 이동 전 반드시 담당 의료진에게 먼저 알려주세요.",
    before:
      "기침이나 재채기가 나올 때는 휴지나 옷소매로 입과 코를 가려주세요. 사용한 휴지는 바로 휴지통에 버리고 손을 씻어주세요. 안내에 따라 마스크 착용이 필요한 경우 착용해주세요.",
    during:
      "병실 출입 전후, 식사 전, 화장실 사용 후에는 감염예방을 위하여 손세정제를 이용하여 손을 씻거나 손소독제로 손위생을 해주시기 바랍니다.",
    phaseLabelOverride: { before: "감염예방", during: "올바른 손씻기" },
    faq: [
      {
        question: "손 소독제는 어디에 있나요?",
        answer: "병실 입구와 병동 곳곳에 비치되어 있으며, 부족하면 담당 간호사에게 요청하세요.",
      },
    ],
    detail: {
      notice: "발열이나 기침 등 감염이 의심되는 증상이 있으면, 병실을 옮기기 전에 먼저 담당 의료진에게 알려 주세요.",
      sections: [
        {
          id: "why",
          title: "감염 예방이 왜 필요한가요?",
          icon: "shield",
          blocks: [
            {
              type: "paragraph",
              text: "병원에는 치료 중인 환자가 많이 모여 있어, 한 사람의 감염이 다른 환자에게 전해지지 않도록 모두가 함께 조심해야 합니다. 병원은 감염병 예방과 출입 통제에 협조를 요청하고 있습니다.",
            },
          ],
        },
        {
          id: "five",
          title: "호흡기감염병 5대 예방수칙",
          icon: "mask",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "기침예절 실천" },
                { title: "올바른 손씻기의 생활화" },
                { title: "씻지 않은 손으로 눈, 코, 입 만지지 않기" },
                { title: "실내에서는 자주 환기하기" },
                { title: "발열 및 호흡기 증상 시 의료기관 방문하여 적절한 진료 받기" },
              ],
            },
            { type: "paragraph", text: "(병원 공지사항 2024-07-30 기준)" },
          ],
        },
        {
          id: "hand",
          title: "손위생",
          icon: "hand",
          blocks: [
            {
              type: "list",
              items: ["병실 출입 전후", "식사 전", "화장실 사용 후"],
            },
            { type: "paragraph", text: "위 경우에는 손세정제로 손을 씻거나 손소독제로 손위생을 해 주세요. 자세한 방법은 ‘손위생 안내’에서 볼 수 있습니다." },
          ],
        },
        {
          id: "cough",
          title: "기침 예절",
          icon: "mask",
          blocks: [
            {
              type: "list",
              items: [
                "기침이나 재채기가 나올 때는 휴지나 옷소매로 입과 코를 가립니다.",
                "사용한 휴지는 바로 휴지통에 버리고 손을 씻습니다.",
                "안내에 따라 마스크 착용이 필요한 경우 착용합니다.",
              ],
            },
          ],
        },
        {
          id: "visit",
          title: "보호자·방문객 관련 안내",
          icon: "users",
          blocks: [
            {
              type: "list",
              items: [
                "병원 출입 전후에 손을 씻고 기침 예절을 지켜 주세요.",
                "감기 등 전염성 질환이 있는 분은 면회가 제한됩니다.",
              ],
            },
            { type: "paragraph", text: "면회 시간과 방문 제한은 병원 면회안내 기준이며, 정부 방역 지침에 따라 달라질 수 있습니다." },
          ],
        },
        {
          id: "symptom",
          title: "감염이 의심되는 증상이 있을 때",
          icon: "alert",
          blocks: [
            { type: "callout", tone: "warning", text: "발열, 기침 등이 있으면 병실을 이동하기 전에 담당 의료진에게 먼저 알려 주세요." },
          ],
        },
        {
          id: "isolation",
          title: "격리 병실 안내",
          icon: "shield",
          blocks: [
            {
              type: "paragraph",
              text: "전염될 수 있는 병에 걸렸거나 의심되면 다른 환자를 보호하기 위해 격리 병실을 씁니다. 격리 병실에는 격리 안내문이 붙어 있습니다.",
            },
            {
              type: "list",
              items: [
                "격리 병실에 들어가기 전에 간호사실에 먼저 알리고, 주의사항을 안내받아 주세요.",
                "병이 옮겨 가는 길에 따라 보호구가 다릅니다. 공기로 옮는 병은 N95 마스크, 침방울로 옮는 병은 외과용 마스크, 접촉으로 옮는 병은 장갑과 가운을 씁니다. 직원 안내에 따라 착용해 주세요.",
                "홍역이나 수두 환자 병실에는 면역이 없는 사람은 들어갈 수 없습니다.",
                "격리 중인 환자는 꼭 필요할 때만 병실 밖으로 이동합니다. 이동할 때는 마스크를 쓰고 기침 예절을 지킵니다.",
                "발열 등 감염 증상이 있는 방문객은 방문이 제한됩니다.",
              ],
            },
            { type: "paragraph", text: "격리가 필요한 환자와 보호자에게는 담당 의사·간호사가 출입·면회 제한과 감염 예방 수칙을 따로 설명합니다. (병원 내부 기준)" },
          ],
        },
        {
          id: "mask",
          title: "마스크를 써야 하는 경우",
          icon: "mask",
          blocks: [
            {
              type: "list",
              items: [
                "감염 주의(공기·침방울) 격리 환자가 병실 밖으로 이동할 때",
                "기침으로 다른 사람에게 침방울이 튈 수 있을 때",
                "면역이 많이 떨어진 환자(조혈모세포이식, 호중구 감소증 등)가 병실 밖으로 이동할 때",
              ],
            },
            { type: "paragraph", text: "마스크 쓰는 방법은 ‘기침 예절 안내’에서 볼 수 있습니다." },
          ],
        },
      ],
      faq: [
        {
          question: "손 소독제는 어디에 있나요?",
          answer: "병실 입구와 병동 곳곳에 비치되어 있으며, 부족하면 담당 간호사에게 요청하세요.",
        },
      ],
    },
    relatedContentIds: ["c78", "c79", "c80", "c30", "c81", "c97", "c101"],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: true,
    version: 4,
    createdAt: "2026-09-19",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c77",
    slug: "patient-identification",
    title: "정확한 환자 확인 안내",
    category: "입원",
    subcategory: "정확한 환자 확인",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary: "진료·투약·검사·시술 전에 이름과 등록번호를 확인하는 이유와, 환자·보호자가 협조할 방법을 안내합니다.",
    detail: {
      notice: "환자 확인은 환자 안전을 위해 반복해서 하는 절차입니다. 번거로워도 협조해 주세요.",
      sections: [
        {
          id: "overview",
          title: "정확한 환자 확인이란?",
          icon: "id",
          blocks: [
            { type: "paragraph", text: "진료, 투약, 수혈, 검사, 처치·시술 전에 환자 이름과 등록번호를 확인하는 절차입니다. 병원의 환자 안전 4단계 중 첫 번째입니다." },
            { type: "paragraph", text: "확인 기준은 ‘이름’과 ‘등록번호’ 두 가지입니다. 등록번호 확인이 어려우면 생년월일로 확인하기도 합니다. 병실 호수는 확인 기준으로 쓰지 않습니다." },
          ],
        },
        {
          id: "how",
          title: "이렇게 확인합니다",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "성함을 말씀해 주세요", text: "의료진이 “성함이 어떻게 되십니까?”라고 물으면 환자가 성함을 직접 말씀합니다." },
                { title: "인식표로 등록번호를 확인합니다", text: "직원이 “등록번호를 확인하겠습니다”라고 말하며 환자용 인식표에 적힌 등록번호를 확인합니다." },
              ],
            },
            { type: "paragraph", text: "직접 말씀하기 어려운 환자(의식이 없는 환자 등)는 보호자와 함께 확인하고, 보호자도 없으면 인식표로 확인합니다." },
            { type: "image", assetId: "patient-id-participation-01" },
          ],
        },
        {
          id: "when",
          title: "언제 확인하나요?",
          icon: "clipboard",
          blocks: [{ type: "list", items: ["진료", "투약", "수혈", "검사", "처치·시술 전"] }],
        },
        {
          id: "coop",
          title: "환자와 보호자가 할 일",
          icon: "users",
          blocks: [
            {
              type: "list",
              items: [
                "직원이 확인을 요청하면 성함을 직접 말씀해 주세요. 등록번호는 환자용 인식표로 확인합니다.",
                "현재 주요 증상, 과거 질환, 알러지 반응 등 건강 정보를 의료진에게 알려 주세요.",
                "환자가 직접 답하기 어려우면 보호자가 함께 확인해 주세요.",
              ],
            },
          ],
        },
        {
          id: "band",
          title: "환자용 인식표",
          icon: "id",
          blocks: [
            {
              type: "list",
              items: [
                "입원 환자, 응급실 환자, 당일 수술 환자는 이름·등록번호·생년월일이 적힌 환자 팔찌를 착용합니다.",
                "외래 환자는 진료카드(등록번호 바코드), 진료 예약증, 진료순서표가 인식표입니다.",
                "팔찌는 보통 손목에 합니다. 손목에 하기 어려우면 발목 등 다른 곳에 합니다.",
                "팔찌를 착용하지 않으면 안전한 치료가 어려울 수 있어 착용을 권합니다.",
                "이름이 같은 환자가 있으면 표시해 두고 더 주의해서 확인합니다.",
              ],
            },
          ],
        },
        {
          id: "surgery",
          title: "수술·시술 부위 확인",
          icon: "target",
          blocks: [
            {
              type: "paragraph",
              text: "좌우 구분이 있는 부위, 손가락·발가락, 척추처럼 헷갈리기 쉬운 수술은 수술 전에 정확한 부위에 표시를 합니다. 수술뿐 아니라 심혈관촬영실·소화기내시경실·인터벤션실의 일부 시술에도 적용됩니다.",
            },
            {
              type: "steps",
              items: [
                { title: "부위 표시", text: "보통 수술동의서를 쓸 때 담당 의사가 환자와 함께 수술 부위를 확인하고 표시합니다. 머리 수술은 수술실에서 머리카락을 민 뒤, 외래에서 하는 수술은 수술 당일 수술대기실에서 의사와 마지막 면담을 한 뒤에 표시합니다." },
                { title: "단계마다 다시 확인", text: "병동(또는 외래)에서 수술실로 갈 때까지 간호사가 단계마다 환자 이름, 수술 이름, 수술 부위, 표시를 확인합니다." },
                { title: "마취 시작 전 확인", text: "마취를 시작하기 전에 환자도 직접 이름, 수술 이름, 수술 부위를 말하며 함께 확인합니다." },
                { title: "수술 직전 확인", text: "절개 직전에 수술팀이 한 번 더 소리 내어 확인합니다." },
              ],
            },
            {
              type: "list",
              items: [
                "표시는 지워지지 않는 펜으로 동그라미를 그리거나 의사가 서명하며, 수술 직전까지 보이도록 합니다. 척추는 수술할 높이까지 표시합니다.",
                "표시가 보이지 않거나 다르다고 느끼면 바로 의료진에게 말씀해 주세요.",
                "표시를 원하지 않으면 의료진에게 말씀해 주세요. 이때는 환자 팔찌에 수술 부위를 적어 확인합니다.",
                "어린이나 의사 표현이 어려운 환자는 보호자에게 설명한 뒤 표시합니다.",
              ],
            },
            {
              type: "callout",
              tone: "info",
              text: "몸 가운데에 있는 부위(예: 편도, 치질, 요도)나 장기가 하나뿐인 수술, 신생아·미숙아는 몸에 표시하지 않을 수 있습니다. 치아는 몸에 표시하지 않고 문서나 방사선 사진으로 표시합니다.",
            },
            { type: "paragraph", text: "(병원 내부 기준)" },
          ],
        },
      ],
    },
    relatedContentIds: ["c30", "c29", "c80", "c87", "c88"],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: true,
    version: 4,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c78",
    slug: "hand-hygiene",
    title: "손위생 안내",
    category: "입원",
    subcategory: "손위생",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary: "병원에서 손을 씻거나 소독해야 하는 때와, 손소독제·물과 비누로 손을 깨끗이 하는 방법을 안내합니다.",
    detail: {
      notice: "손위생은 병원 감염 예방의 기본입니다. 환자와 보호자 모두 지켜 주세요.",
      sections: [
        {
          id: "overview",
          title: "손위생이란?",
          icon: "hand",
          blocks: [
            { type: "paragraph", text: "손세정제(비누)로 손을 씻거나 손소독제로 손을 소독해 감염을 막는 방법입니다." },
          ],
        },
        {
          id: "when",
          title: "언제 하나요?",
          icon: "clipboard",
          blocks: [
            { type: "list", items: ["병실에 들어가기 전과 나온 후", "식사 전", "화장실 사용 후", "기침이나 재채기로 입과 코를 가린 뒤"] },
            { type: "paragraph", text: "병원 출입 전후에도 손을 씻어 주세요(병원 면회안내 기준). 격리 병실에 들어가기 전과 나올 때도 손위생을 합니다(병원 내부 기준)." },
            { type: "paragraph", text: "외출하거나 병원 밖에서 손을 씻기 어려울 때는 손 소독제를 사용하세요(항암화학요법 환자 일상생활 안내 기준)." },
          ],
        },
        {
          id: "where",
          title: "손소독제는 어디에 있나요?",
          icon: "info",
          blocks: [{ type: "paragraph", text: "병실 입구와 병동 곳곳에 비치되어 있으며, 부족하면 담당 간호사에게 요청하세요." }],
        },
        {
          id: "steps",
          title: "올바른 손씻기 방법",
          icon: "route",
          blocks: [
            {
              type: "paragraph",
              text: "눈에 보이는 더러움이 없으면 알코올 손소독제로 손을 소독하고, 눈에 보이는 더러움이 있으면 물과 비누로 씻습니다.",
            },
            {
              type: "steps",
              items: [
                { title: "손소독제 사용 (20~30초)", text: "손소독제를 손바닥에 덜어 손 전체에 바르고, 아래 6곳을 문지릅니다. 20~30초 동안, 또는 손소독제가 마를 때까지 문지릅니다." },
                { title: "물과 비누로 씻기 (40~60초)", text: "손을 물에 적시고 비누를 충분히 묻혀 아래 6곳을 문지릅니다. 흐르는 물에 헹구고 일회용 종이타월로 말린 뒤, 쓴 종이타월로 수도꼭지를 감싸 잠급니다." },
              ],
            },
            {
              type: "list",
              items: [
                "① 손바닥과 손바닥을 마주 대고 문지릅니다.",
                "② 손바닥으로 반대쪽 손등을 문지릅니다.",
                "③ 손바닥을 마주 대고 손가락 사이를 문지릅니다.",
                "④ 손가락을 마주 잡고 문지릅니다.",
                "⑤ 한 손으로 엄지손가락을 감싸 쥐고 돌리며 문지릅니다.",
                "⑥ 손가락 끝을 반대쪽 손바닥에 대고 문지릅니다.",
              ],
            },
            {
              type: "callout",
              tone: "warning",
              text: "다음에는 손소독제가 아니라 꼭 물과 비누로 씻어 주세요: 눈에 보이는 더러움이 있을 때, 피나 체액이 묻었을 때, 설사 환자를 만진 뒤, 화장실을 사용한 뒤.",
            },
            { type: "paragraph", text: "(병원 내부 기준)" },
          ],
        },
        {
          id: "touch",
          title: "함께 지킬 습관",
          icon: "shield",
          blocks: [{ type: "list", items: ["씻지 않은 손으로 눈, 코, 입을 만지지 않습니다."] }],
        },
      ],
    },
    relatedContentIds: ["c33", "c79", "c80"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 3,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c79",
    slug: "cough-etiquette",
    title: "기침 예절 안내",
    category: "입원",
    subcategory: "기침 예절",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary: "기침이나 재채기를 할 때 주변 사람에게 병이 옮지 않도록 지키는 방법을 안내합니다.",
    detail: {
      notice: "발열이나 기침 등이 있으면 병실을 이동하기 전에 담당 의료진에게 먼저 알려 주세요.",
      sections: [
        {
          id: "overview",
          title: "기침 예절이란?",
          icon: "mask",
          blocks: [{ type: "paragraph", text: "기침이나 재채기를 할 때 입과 코를 가려 주변으로 퍼지는 것을 막는 생활 수칙입니다. 호흡기감염병 5대 예방수칙 중 하나입니다." }],
        },
        {
          id: "how",
          title: "이렇게 하세요",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "입과 코 가리기", text: "기침이나 재채기가 나올 때는 휴지나 옷소매로 입과 코를 가립니다." },
                { title: "휴지 버리기", text: "사용한 휴지는 바로 휴지통에 버립니다." },
                { title: "손 씻기", text: "손을 씻습니다." },
              ],
            },
            { type: "paragraph", text: "안내에 따라 마스크 착용이 필요한 경우에는 착용해 주세요." },
          ],
        },
        {
          id: "symptom",
          title: "증상이 있을 때",
          icon: "alert",
          blocks: [
            { type: "callout", tone: "warning", text: "발열이나 호흡기 증상이 있으면 의료기관을 방문해 적절한 진료를 받으세요. 입원 중이라면 병실을 이동하기 전에 담당 의료진에게 먼저 알려 주세요." },
          ],
        },
        {
          id: "mask",
          title: "마스크를 써야 할 때와 쓰는 방법",
          icon: "mask",
          blocks: [
            {
              type: "list",
              items: [
                "감염 주의(공기·침방울) 격리 환자가 병실 밖으로 이동할 때",
                "기침으로 다른 사람에게 침방울이 튈 수 있을 때",
                "면역이 많이 떨어진 환자(조혈모세포이식, 호중구 감소증 등)가 병실 밖으로 이동할 때",
              ],
            },
            {
              type: "steps",
              items: [
                { title: "입과 코를 완전히 가리기", text: "코 부분이 뜨지 않도록 모양을 잡아 줍니다." },
                { title: "한 번 쓰고 버리기", text: "마스크는 한 번만 쓰고, 벗은 뒤에는 다시 쓰지 않습니다." },
                { title: "끈을 잡고 벗기", text: "벗을 때는 마스크 앞면을 만지지 않고 끈을 잡고 벗습니다. 벗은 뒤에는 손을 씻습니다." },
              ],
            },
            { type: "paragraph", text: "(병원 내부 기준)" },
          ],
        },
        {
          id: "air",
          title: "함께 지킬 습관",
          icon: "shield",
          blocks: [{ type: "list", items: ["실내에서는 자주 환기합니다.", "씻지 않은 손으로 눈, 코, 입을 만지지 않습니다."] }],
        },
      ],
    },
    relatedContentIds: ["c33", "c78", "c80"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c80",
    slug: "guardian-cooperation",
    title: "보호자 협조사항 안내",
    category: "입원",
    subcategory: "보호자 협조사항",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary: "환자 안전과 감염 예방을 위해 보호자가 도와주실 일을 한곳에 모아 안내합니다.",
    detail: {
      notice: "보호자의 협조는 환자 안전에 큰 도움이 됩니다. 궁금한 점은 병동 간호사실에 문의해 주세요.",
      sections: [
        {
          id: "id",
          title: "환자 확인",
          icon: "id",
          blocks: [{ type: "list", items: ["환자가 직접 답하기 어려우면 보호자가 함께 이름과 등록번호를 확인합니다."] }],
        },
        {
          id: "move",
          title: "이동할 때",
          icon: "walk",
          blocks: [
            { type: "list", items: ["거동이 불편한 환자가 이동할 때는 보호자가 도와 주세요.", "보행이 불편한 환자가 이동할 때는 환자 옆에서 팔을 잡아 주세요."] },
          ],
        },
        {
          id: "info",
          title: "건강정보 알려주기",
          icon: "pill",
          blocks: [
            { type: "list", items: ["환자의 복용 약, 알레르기, 과거 질환을 의료진에게 알려 주세요."] },
          ],
        },
        {
          id: "infection",
          title: "감염 예방",
          icon: "hand",
          blocks: [
            {
              type: "list",
              items: [
                "병원 출입 전후에 손을 씻고 기침 예절을 지켜 주세요.",
                "감기 등 전염성 질환이 있는 분의 면회는 제한됩니다.",
              ],
            },
          ],
        },
        {
          id: "visit",
          title: "면회 안내(병원 면회안내 기준, 2024-05-22)",
          icon: "users",
          blocks: [
            {
              type: "list",
              items: [
                "출입증을 가진 보호자 1인만 병동에 출입할 수 있고, 일반 병실은 면회가 전면 금지됩니다.",
                "중환자실은 1일 1회 20~30분 면회하며, 병동별 시간이 다릅니다.",
                "만 12세 이하 어린이, 감기 등 전염성 질환이 있는 분, 3인 이상 단체 방문은 제한됩니다.",
                "꽃, 화분, 애완동물, 외부 음식물은 가져올 수 없습니다.",
              ],
            },
            { type: "paragraph", text: "정부 방역 지침에 따라 달라질 수 있으니 자세한 내용은 각 병동에 문의해 주세요." },
            {
              type: "list",
              items: [
                "상주 보호자·간병인은 병상에 놓인 ‘병문안객 기록지’에 날짜와 이름을 직접 적어 주세요. 이 기록은 감염병이 퍼질 때 감염 경로를 확인하는 데만 쓰이며, 퇴원 30일 뒤 폐기됩니다.",
                "격리 병실에 들어갈 때는 간호사실에 먼저 알리고 안내를 받아 주세요.",
              ],
            },
            { type: "review-needed", topic: "상주 보호자의 일상적인 마스크 착용 기준(격리 병실 외)" },
          ],
        },
        {
          id: "call",
          title: "도움이 필요할 때",
          icon: "bell",
          blocks: [{ type: "list", items: ["환자에게 도움이 필요하면 침대 옆 호출벨로 직원을 불러 주세요."] }],
        },
      ],
    },
    relatedContentIds: ["c30", "c29", "c33", "c77", "c81", "c96", "c97"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-06",
    lastUpdated: "2026-11-12",
  },
  {
    contentId: "c34",
    slug: "integrated-nursing-care",
    title: "간호간병통합서비스 이용 안내",
    category: "입원",
    subcategory: "간호간병통합서비스 이용 안내",
    departments: ["전과공통"],
    patientStages: ["admitted"],
    summary: "보호자 상주 없이 전담 인력이 간호·간병을 제공하는 서비스를 안내합니다.",
    before:
      "• 간병 서비스를 받을 수 있는 병동입니다\n• 일반병실에 자리가 없으면 간호간병통합병동으로 배정될 수 있습니다\n• 입원 후 병실 이동을 원하면 재원 중인 병동에 문의하세요 (순차적으로 안내)",
    during:
      "• 보호자 상주가 제한됩니다\n• 면회는 일체 금지되며, 출입증을 가진 보호자 1인만 병동에 출입할 수 있습니다\n• 도움이 필요하면 호출벨로 담당 간호사에게 알려주세요",
    location: "본관 20층 내과병실(간호·간병 통합서비스 병실)",
    contact: "원무팀 입원계 02-2290-9072~4",
    relatedContentIds: ["c26", "c71", "c81", "c95"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c71",
    slug: "admission-procedure",
    title: "입원 절차 안내",
    category: "입원",
    subcategory: "입원 결정·수속·입실",
    departments: ["원무팀", "전과공통"],
    patientStages: ["before-surgery", "admitted"],
    summary: "입원 결정부터 입원약정서 작성, 수속 시간, 병실 입실, 중간 진료비 납부까지 순서대로 안내합니다.",
    importantNotice:
      "입원 수속은 오후 1시~5시 30분에 본관 3층 원무팀 입원 창구에서, 5시 30분 이후에는 응급실 원무 창구에서 합니다. 병실 입실은 오후 1시부터 가능합니다.",
    before:
      "① 외래·응급진료 후 담당 의사가 입원을 결정합니다\n② 본관 3층 원무팀 입원 수속 창구에서 입원약정서를 작성합니다 (보호자 — 세대주 또는 직장인 1인이 서명·날인)\n③ 수술·검사 일정이 정해진 분은 입원 예정일을 확인받고 귀가합니다\n   • 입원 예정일 오전에 원무팀이 전화 또는 문자로 병실 배정을 알려드립니다\n\n※ 자동차보험·산재보험이 적용되면 입원 전에 원내 담당자와 상담하세요",
    during:
      "① 병실 배정 연락을 받으면 본관 3층 원무팀 입원 창구에 입원약정서를 제출합니다\n② 입원안내문과 환자식별용 팔찌를 받습니다\n③ 배정받은 병동의 간호사에게 입원안내문과 팔찌를 제출합니다\n\n• 수속 시간: 13:00~17:30 본관 3층 원무팀 / 17:30 이후 응급실 원무 창구\n• 병실은 입원 당일 오전에 정해지며, 퇴원 환자 상황에 따라 희망한 병실과 다를 수 있습니다\n• 간호간병통합병동으로 배정되면 보호자 상주가 제한됩니다",
    after:
      "• 진료비 중간계산서는 매주 수요일 발행됩니다 (본관 3층 원무팀)\n• 중간 수납: 카드 결제(원무팀 방문 또는 중간정산 안내 알림톡 링크) · 계좌이체(입금자명은 환자이름+생년월일로 기재)\n• 입원확인서·진단서 등은 퇴원 하루 전까지 담당 간호사에게 신청하세요\n• 진료비 세부내역서는 원무팀 퇴원 수납에서 별도로 신청합니다",
    phaseLabelOverride: { before: "입원 결정 · 입원약정서", during: "입원 당일 · 수속", after: "입원 중 진료비 · 서류" },
    location: "본관 3층 원무팀 입원 수속 창구 (17:30 이후 응급실 원무 창구)",
    contact: "원무팀 입원계 02-2290-9072~4",
    relatedContentIds: ["c26", "c34", "c35", "c81", "c93", "c95"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },

  // ───────────────────── 퇴원 (1) ─────────────────────
  {
    contentId: "c35",
    slug: "discharge-guide",
    title: "퇴원 안내",
    category: "퇴원",
    subcategory: "퇴원 준비·수속·정산부터 퇴원 후 생활까지",
    departments: ["전과공통", "원무팀", "외과", "정형외과"],
    patientStages: ["before-discharge", "after-discharge"],
    summary:
      "퇴원 수속과 비용 정산, 퇴원약 수령부터 퇴원 후 복약·상처 관리·외래 재진 예약·응급실 내원 기준까지 퇴원 전후 전 과정을 한 번에 안내합니다.",
    importantNotice:
      "퇴원 후 발열, 평소와 다른 증상이 있거나 고열·심한 통증·호흡곤란·심한 출혈이 있으면 외래 방문 전이라도 지체 없이 병원(응급실)에 문의·방문하세요. 처방약은 임의로 중단하거나 용량을 조절하지 마세요.",
    before:
      "• 정규 퇴원은 퇴원 하루 전날 담당 의사가 결정합니다\n• 환자·보호자가 퇴원을 원하면 담당 의사와 먼저 상의하세요\n• 개인 소지품을 미리 정리해두세요\n• 지방으로 가시거나 구급차(앰뷸런스) 이용이 필요하면 미리 말씀해 주세요\n• 입원확인서·진단서 등이 필요하면 퇴원 하루 전까지 담당 간호사에게 신청하세요",
    during:
      "① 퇴원일 오전에 진료비 최종 심사가 끝나면 등록된 휴대전화 번호로 문자(SMS)가 발송됩니다\n② 본관 3층 원무팀 퇴원수속 창구에서 진료비를 수납하고, 필요하면 제증명 서류도 함께 발급받습니다\n③ 병동 간호사에게 퇴원약과 퇴원안내문을 받고 귀가합니다\n\n• 다음 입원 예약이 필요하면 주치의에게 입원장을 받아 원무팀 입원계에 예약하세요\n• 퇴원 후 외래 예약일을 바꾸려면 해당 외래 진료과로 직접 연락하세요",
    after:
      "• 무리한 활동은 피하고 컨디션에 맞춰 점진적으로 일상생활을 재개하세요\n• 회복 과정·약·치료가 궁금하면 입원하셨던 병동으로 연락하세요\n\n[복약]\n• 처방받은 시간에 맞춰 규칙적으로 복용하세요\n• 임의로 중단하거나 용량을 조절하지 마세요\n• 복용을 깜빡했다면 생각난 즉시 복용하되, 다음 복용 시간과 가까우면 한 번만 복용하세요\n\n[상처 관리]\n• 손을 깨끗이 씻은 후 처방받은 소독법에 따라 관리하세요\n• 진물·발적·열감이 심해지면 즉시 병원에 방문하세요\n\n[응급실 방문 기준]\n• 고열 · 심한 통증 · 호흡곤란 · 심한 출혈이 있으면 지체 없이 응급실을 방문하세요",
    faq: [{ question: "복용을 깜빡했어요.", answer: "생각난 즉시 복용하되, 다음 복용 시간과 가까우면 한 번만 복용하세요." }],
    location: "본관 3층 원무팀 퇴원수속 창구",
    contact: "원무팀 퇴원계 02-2290-9076~7 · 응급 상황 시 119",
    relatedContentIds: ["c71", "c72", "c93", "c95", "c107", "c106"],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-02",
  },

  // ───────────────────── 기타 (9) ─────────────────────
  {
    contentId: "c43",
    slug: "find-test-room",
    title: "검사실 찾아가기",
    category: "기타",
    subcategory: "검사실 찾아가기",
    departments: ["전과공통"],
    patientStages: [],
    summary: "본관·서관·동관·신관 층별 검사실 위치를 안내합니다. 검사 전에 수납을 먼저 하고 해당 검사실로 가세요.",
    importantNotice:
      "운영시간: 평일 08:30~17:30 · 토요일 08:30~12:30 (채혈실은 07:00부터, 응급센터 촬영실은 24시간)\n검사 예약·변경은 본관 3층 검사통합예약실에서 합니다.",
    before:
      "[5층]\n• 심혈관촬영실 · 하이브리드 수술실\n\n[3층]\n• 영상의학과 접수 — CT · MRI · 일반촬영 · 초음파 · 혈관조영실\n• 외래채혈실\n• 심장검사실\n• 검사통합예약실\n• 응급센터 CT · 일반촬영실 (24시간)\n\n[2층]\n• 영상의학과 — 유방촬영실 · 투시조영검사실 · 비뇨기계검사실\n• 핵의학과 — PET-CT · 감마카메라실 · 골다공증검사실\n• 비뇨의학과 — 체외충격파 쇄석실 · 초음파실\n• 산부인과 — 초음파실 · 태아건강진단실\n\n[1층]\n• 신경생리검사실 (근전도 · 뇌유발전위 · 뇌파)\n• 전정기능검사실 (이비인후과)",
    during:
      "[6층]\n• 소화기 내시경 검사실 · 췌담도 내시경실\n• 주사실\n\n[5층]\n• 심장초음파실\n\n[4층]\n• 뇌혈류검사실 · 인지기능검사실\n• 폐기능검사실 · 알레르기검사실 · 기관지내시경실",
    after:
      "[동관 · 류마티스병원]\n• 3층: 진단검사의학과\n• 1층: 류마티스 X-ray 촬영실 · 채혈실 · 초음파검사실\n• 5층: 재활의학과 근전도실 등 치료실\n\n[신관]\n• 3층: CT실 · MRI검사실 · 혈관조영실",
    phaseLabelOverride: { before: "본관", during: "서관", after: "동관 · 신관" },
    faq: [
      { question: "검사실을 찾기 어려우면 어떻게 하나요?", answer: "본관 1층·동관 1층 안내데스크나 각 층 접수·수납 창구에서 안내받을 수 있습니다." },
    ],
    location: "한양대학교병원 본관 · 서관 · 동관 · 신관",
    contact: "대표전화 02-2290-8114 (검사 예약·변경 02-2290-9738)",
    relatedContentIds: ["c44", "c45", "c100"],
    images: [{ assetId: "radiology-location-3f-01", placement: "notice" }],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-10",
  },
  {
    contentId: "c44",
    slug: "find-clinic-room",
    title: "진료실 찾아가기",
    category: "기타",
    subcategory: "진료실 찾아가기",
    departments: ["전과공통"],
    patientStages: [],
    summary: "본관·서관·동관·신관 층별 진료과 위치를 안내합니다.",
    importantNotice: "처음 오시는 분은 본관 1층 고객서비스센터 '처음 오신 분 창구'에서 안내받을 수 있습니다.",
    before:
      "[1층]\n• 소아청소년과 · 신경과 · 안과 · 이비인후과\n• 접수·수납 창구 · 고객서비스센터(처음 오신 분 창구) · 외래 약국\n\n[2층]\n• 비뇨의학과 · 산부인과 · 치과 · 핵의학과 · 영상의학과\n\n[3층]\n• 신경외과 · 정형외과 · 영상의학과\n• 접수·수납 창구 · 원무팀(입원·퇴원 수속)\n• 응급의료센터\n\n[5층]\n• 마취통증의학과",
    during:
      "[3층]\n• 국제진료센터(국제병원) · 종합검진센터 예약실\n\n[4층]\n• 심장내과 · 호흡기알레르기내과 · 혈액종양내과\n• 가정의학과 · 흉부외과 · 암병원 · 다학제통합진료실\n\n[5층]\n• 신장내과 · 내분비대사내과 · 감염내과\n• 피부과 · 성형외과\n• 접수·수납 창구\n\n[6층]\n• 외과 · 소아외과 · 소화기센터(소화기내과)\n• 유방암·갑상선 종양센터\n• 입원지원센터",
    after:
      "[동관 · 류마티스병원]\n• 1층: 류마티스내과 · 통증의학과 · 접수·수납 창구\n• 2층: 통증의학과 치료실\n• 4층: 인공신장센터 · 장기이식센터 · 사회복지팀\n• 5층: 재활의학과 · 관절재활의학과\n\n[신관]\n• 2층: 방사선종양학과\n• 7층: 병리과",
    phaseLabelOverride: { before: "본관", during: "서관", after: "동관 · 신관" },
    faq: [
      { question: "진료과를 못 찾겠어요.", answer: "본관 1층·동관 1층 안내데스크나 각 층 접수·수납 창구에서 안내받을 수 있습니다." },
    ],
    location: "한양대학교병원 본관 · 서관 · 동관 · 신관",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c43", "c45", "c85", "c86", "c100"],
    images: [{ assetId: "main-floor-guide-01", placement: "before" }],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c45",
    slug: "registration-payment",
    title: "원무팀 접수·수납 안내",
    category: "기타",
    subcategory: "원무팀 접수, 수납 안내",
    departments: ["원무팀"],
    patientStages: [],
    summary: "외래 진료 접수부터 진료, 수납, 투약·주사·검사까지 순서대로 안내합니다.",
    importantNotice:
      "처음 오신 분은 요양급여의뢰서와 건강보험증(신분증)을 꼭 가져오세요. 의뢰서가 없으면 진료는 가능하지만 건강보험이 적용되지 않아 진료비 전액을 부담합니다.",
    before:
      "① 본관 1층 고객서비스센터 '처음 오신 분 창구'로 갑니다\n② 진료신청서를 작성합니다 (예약하지 않았다면 진료 상담 후 진료 또는 예약을 도와드립니다)\n③ 요양급여의뢰서 · 건강보험증 · 신분증을 제출합니다 (의료급여 환자는 2차 병원 의료급여의뢰서)\n④ 안내에 따라 수납한 뒤 진료과로 이동합니다\n\n※ 보험 적용은 의뢰서를 제출한 시점부터이며, 이전 진료에는 소급 적용되지 않습니다",
    during:
      "① 수납창구에서 진료비를 수납합니다 (예약 없이 오셨다면 '당일진료'로 접수)\n② 예약된 진료과로 가서 간호사에게 진료카드(등록번호 바코드)를 제출합니다\n③ 이미 수납한 재진 환자는 바로 진료과로 가시면 됩니다\n④ 진료비계산서(영수증)에 적힌 일자·시간에 맞춰 순번대로 진료를 받습니다\n\n• 초진 환자는 요양급여의뢰서와 건강보험증(신분증)을 진료과에 제출합니다\n• 다른 병원 영상 CD는 무인 영상 CD 등록기에 등록하세요 (본관 1층·3층, 서관 4층, 동관 1층)",
    after:
      "① 진료과에서 검사 예약·약 처방 안내를 받고, 필요하면 다음 진료를 예약합니다\n② 수납기 또는 수납창구에서 진료카드로 진료비를 내고, 진료비계산서(영수증)와 처방전을 받습니다\n③ 영수증을 보고 다음 장소로 이동합니다\n   • 투약: 계산서의 투약번호를 확인하고, 외래 약국 전광판에 번호가 뜨면 약을 받습니다\n   • 주사: 해당 주사실에서 진료카드와 계산서를 보여줍니다\n   • 당일 검사: 해당 검사실에 진료카드와 계산서를 제출합니다\n   • 예약 검사: 본관 3층 검사통합예약실에서 날짜를 예약하고, 검사일에 수납한 뒤 검사실로 갑니다\n   • 입원 결정: 본관 3층 입원 수속 창구로 갑니다\n\n주소·전화번호가 바뀌었다면 수납창구에 꼭 알려주세요.",
    phaseLabelOverride: { before: "처음 오신 분", during: "재진 · 진료과 초진", after: "진료 후 수납 · 투약 · 검사" },
    faq: [
      { question: "수납창구는 어디에 있나요?", answer: "본관 1층·3층, 서관 5층, 동관 1층에 있습니다." },
      { question: "외래 약국은 어디인가요?", answer: "본관 1층에 있습니다." },
    ],
    location: "수납창구: 본관 1층·3층, 서관 5층, 동관 1층 · 처음 오신 분 창구: 본관 1층 고객서비스센터",
    contact: "대표전화 02-2290-8114 (진료예약 ARS)",
    relatedContentIds: ["c44", "c43", "c71", "c86", "c85", "c91", "c92", "c98", "c93", "c94"],
    images: [{ assetId: "main-floor1-map-01", placement: "before" }],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 4,
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c46",
    slug: "guardian-guide",
    title: "보호자 안내",
    category: "기타",
    subcategory: "보호자 안내",
    departments: ["전과공통"],
    patientStages: [],
    summary: "검사·수술·입원·응급실에서 보호자가 알아야 할 대기 장소와 면회 규칙을 안내합니다.",
    importantNotice:
      "검사·수술실 앞에는 보호자 대기공간이 따로 없습니다. 응급실 옆 휴게공간 또는 본관 3층 휴게공간을 이용해 주세요.",
    before:
      "• 응급실 옆 휴게공간\n• 본관 3층 휴게공간\n• 수술 중에는 입원하신 병실에서 기다리셔도 됩니다\n• 수술실 앞에는 대기공간이 없지만, 본관 5층 수술실 앞 ‘수술환자현황’ 화면(DID)으로 수술 진행 현황을 볼 수 있습니다\n• 수술 진행 상황은 입원 시 등록한 보호자 번호로 문자 안내되며, 수술이 끝나면 담당의가 결과를 설명합니다",
    during:
      "• 감염 예방을 위해 입원 중 면회는 일체 금지되며, 출입증을 가진 보호자 1인만 병동에 출입할 수 있습니다\n• 간호간병통합병동은 보호자 상주가 제한됩니다\n• 병문안 대신 SNS·문자·영상통화로 마음을 전해주세요\n• 꽃·화분·애완동물·외부 음식은 반입할 수 없습니다\n• 만 12세 이하 어린이, 감기 등 전염성 질환이 있는 분은 출입이 제한됩니다\n• 병원에 들어오기 전후에는 손을 씻고 기침 예절을 지켜주세요",
    after:
      "[중환자실 면회 — 하루 1회 20~30분]\n• 내과계·외과계 중환자실: 11:00~11:30\n• 응급중환자실1: 11:30~12:00 / 응급중환자실2: 10:30~11:00\n• 신생아중환자실: 13:00~13:30\n• 본관 18층 음압격리병동: 13:40~14:00\n(방역 지침에 따라 달라질 수 있으니 자세한 내용은 해당 중환자실에 문의하세요)\n\n[응급실]\n• 환자의 안정과 신속한 진료를 위해 보호자 1분만 함께 계실 수 있습니다\n• 다른 가족은 응급실 보호자 대기실에서 기다려주세요",
    phaseLabelOverride: { before: "검사 · 수술 중 대기 장소", during: "입원 중 보호자 · 면회", after: "중환자실 · 응급실 보호자" },
    location: "응급실 옆 휴게공간 · 본관 3층 휴게공간",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c16", "c26", "c72", "c81", "c82", "c96", "c97"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c47",
    slug: "medical-records",
    title: "의무기록 발급 및 제증명 서류 안내",
    category: "기타",
    subcategory: "의무기록 발급 및 제증명 서류 안내",
    departments: ["원무팀"],
    patientStages: [],
    summary: "진단서·소견서·확인서 등 제증명과 의무기록(진료기록·영상 CD) 사본의 발급 장소, 신청 순서, 준비 서류를 안내합니다.",
    importantNotice: "진단서는 환자 본인이 요청해야 하며 비용은 진료비와 별도입니다. 증명서 보존기간은 3년이며, 지난 서류는 재발행할 수 없습니다.",
    before:
      "[진단서 · 소견서 — 진료과 주치의 발급]\n• 진료 예약 후 의사 면담이 필요합니다\n• 일반진단서 · 소견서 · 병사용진단서 · 장애진단서 · 출생증명서\n• 병사용진단서는 사진(3.5×4.5cm 또는 여권용) 필요 부수 +1매를 가져오세요\n\n[입원·통원확인서 등 — 원무팀 발급]\n• 진료 예약 없이 발급됩니다\n• 입원확인서 · 통원확인서 · 진료비 상세내역서(외래) · 진료비 약제비 납입증명서(연말정산용)\n• 병원 방문 발급은 무료, 온라인 발급은 수수료가 있습니다\n\n[의무기록 사본 — 진료기록 · 검사결과 · 영상 CD]\n• 본관 3층 의무기록 사본발급 창구\n• 평일 08:30~17:30 / 토요일 08:30~12:30\n• 사본 1~5매는 1매당 1,000원(6매부터 100원), CD 1장 10,000원, DVD 1장 20,000원",
    during:
      "[제증명 — 외래]\n① 외래수납 창구에서 접수·신청\n② 진료과에서 의사 상담·처방\n③ 원무팀 창구에서 수납 후 수령\n\n[제증명 — 입원 중]\n① 퇴원 1~2일 전 병동 간호사에게 신청\n② 주치의 상담·작성\n③ 원무팀 퇴원 창구에서 수납 후 수령\n\n[재발행]\n• 원무팀 창구 또는 본관 3층 무인제증명발급기 (의사 상담 불필요)\n\n[의무기록 사본]\n① 본관 3층 사본발급 창구에서 접수\n② 신청서·구비서류 확인\n③ 수납 후 수령",
    after:
      "[환자 본인]\n• 신분증 (만 14세 이상 — 주민등록증·운전면허증·여권 등)\n• 만 13세 이하는 부모(법정대리인)가 신청합니다\n\n[가족(배우자·직계가족)이 대신 신청]\n• 신청자 신분증 사본 · 환자 신분증 사본\n• 가족관계증명서 (3개월 이내)\n• 환자가 자필 서명한 동의서와 위임장\n\n[그 외 대리인 (형제·자매·보험회사 직원 등)]\n• 신청자·환자 신분증 사본\n• 환자가 자필 서명한 동의서와 위임장\n\n※ 서명은 자필만 인정됩니다 (도장·지장 불가)\n※ 서류는 최근 3개월 이내 발급분만 유효합니다\n※ 진단서는 환자가 의사 결정이 가능하면 대리인 위임이 불가합니다\n※ 동의서·위임장 양식은 병원 홈페이지에서 출력할 수 있습니다",
    phaseLabelOverride: { before: "발급 종류와 장소", during: "신청 순서", after: "준비 서류" },
    location: "본관 3층 원무팀 · 본관 3층 의무기록 사본발급 창구 · 무인 제증명 발급기",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c49", "c71", "c94"],
    images: [
      { assetId: "cert-self-01", placement: "after" },
      { assetId: "cert-agent-01", placement: "after" },
      { assetId: "cert-relative-01", placement: "after" },
    ],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: false,
    version: 4,
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c48",
    slug: "parking-transit",
    title: "주차 및 대중교통 이용 안내",
    category: "기타",
    subcategory: "주차 및 대중교통 이용 안내",
    departments: ["전과공통"],
    patientStages: [],
    summary: "주차 요금과 무료 주차 기준, 지하철·버스·셔틀버스 이용 방법을 안내합니다.",
    importantNotice: "무료 주차는 당일 진료비계산서(영수증)를 무인 정산기에 인식해야 적용됩니다. 입원 기간 중에는 주차가 유료입니다.",
    before:
      "[요금]\n• 입차 후 10분 무료 → 30분까지 2,000원 → 30분 초과 10분당 500원\n• 선불 기간권: 1일(24시간) 20,000원 · 30일 120,000원 (출차 시 구매 불가, 선불 구매 없이 출차하면 일반요금으로 산정)\n• 선불 기간권은 할인이 적용된 상태라 복지카드 등과 중복 할인이 되지 않습니다\n• 선불 기간권 환불은 잔여기간을 1일 4,000원으로 적용해 송금이체합니다 (환불 신청 필요)\n• 무인 정산기: 본관 1층·3층, 동관 1층, 타워주차장 1층\n\n[무료 주차 기준 — 당일 진료비계산서·영수증 제시]\n• 외래 진료 · 각종 검사: 4시간\n• 응급실 · 장시간 검사 · 수술 · 당일 안과 수술 · 작업환경의학과 진료/검사 · 핵의학과 검사 · 주사실 · 정신건강의학과 진료/검사 · 인공신장실 투석: 8시간\n• 2개 진료과 중복 진료: 8시간\n• 수면다원검사: 12시간\n• 입원: 입원 당일 입차 기준 24시간 (1대, 1회 입출차)\n• 퇴원: 퇴원 당일 0시~24시 (1대, 1회 · 퇴원영수증 제시)\n• 진료 예약·서류 수정: 1시간 (주차확인서)\n• 입원 중 중간 진료비 정산: 1시간\n• VIP·1인실 입원: 입원 기간 중 1대 (병동 간호사실에 등록)",
    during:
      "[지하철]\n• 2호선 한양대역 1번 출구 → 한양대 정문까지 도보 5분(400m) 또는 셔틀 1호차\n• 왕십리역(2·5호선, 분당선, 경의중앙선) 6번·13번 출구 → 도보 15분(750m)\n• 왕십리역 6-1번 출구 → 셔틀 2·3·4호차\n\n[버스]\n• 병원 후문(사근파출소 앞): 지선 4211\n• 한양대부속고등학교: 지선 2013 · 간선 121\n• 한양대학교 정문: 간선 121\n• 마을버스 성동 03-2 (06:30~23:30)\n\n[주소]\n• 서울특별시 성동구 왕십리로 222-1",
    after:
      "[1호 — 한양대역 순환]\n• 평일 08:00~17:20 (12분 간격) · 토 08:30~12:10\n• 본관 3층 응급실 앞 → 정문 → 후문 → 본관 1층\n\n[2·3·4호 — 왕십리역 순환]\n• 평일 08:00~17:05 (8분 간격) · 토 08:30~12:05 (25분 간격)\n• 본관 3층 응급실 앞 → 후문 → 왕십리역 6-1번 출구 맞은편 → 노인복지회관 → 후문 → 본관 1층\n\n일요일·공휴일에는 셔틀버스가 운행하지 않으며, 도로 사정에 따라 지연될 수 있습니다.",
    phaseLabelOverride: { before: "주차 요금 · 무료 기준", during: "지하철 · 버스", after: "셔틀버스" },
    location: "서울특별시 성동구 왕십리로 222-1 · 주차 정산기: 본관 1·3층, 동관 1층, 타워주차장 1층",
    contact: "주차 요금 문의 02-2290-8557",
    images: [
      { assetId: "parking-fees-01", placement: "before" },
      { assetId: "parking-free-01", placement: "before" },
    ],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c49",
    slug: "non-covered-costs",
    title: "비급여 진료비용 및 실손보험 안내",
    category: "기타",
    subcategory: "비급여 진료비용 및 실손보험 안내",
    departments: ["원무팀"],
    patientStages: [],
    summary: "실손보험 청구에 필요한 서류와 발급 장소, 청구 방법, 비급여 비용 확인 방법을 안내합니다.",
    importantNotice: "진단서가 필요하면 진료과 주치의에게 발급받으며, 비용은 진료비와 별도입니다.",
    before:
      "• 진료비 영수증 (수납할 때 받은 영수증)\n• 진료비 세부내역서\n   - 외래: 원무팀 창구에서 발급\n   - 입원: 퇴원 수납 시 원무팀 퇴원 창구에서 별도로 신청\n• 진료비·약제비 납입증명서(연말정산용): 원무팀 발급\n• 입원확인서·통원확인서: 원무팀 발급 (병원 방문 발급은 무료)",
    during:
      "• 병원 안 '실손보험 청구 키오스크'를 이용할 수 있습니다 — 본관 1층, 본관 3층\n• 팩스 전송이 필요하면 본관 3층 오피스 센터를 이용하세요 (평일 08:30~17:30)\n• 보험사별 청구 방법은 가입하신 보험사 안내를 따르세요",
    after:
      "• 비급여 진료비는 병원 홈페이지 '이용안내 > 비급여 진료비'에서 항목별로 확인할 수 있습니다\n• 진료 전 비용이 궁금하면 접수·수납창구나 대표전화로 문의하세요",
    phaseLabelOverride: { before: "청구 서류", during: "청구 방법", after: "비급여 비용 확인" },
    location: "본관 3층 원무팀 · 실손보험 청구 키오스크(본관 1층·3층)",
    contact: "대표전화 02-2290-8114",
    relatedContentIds: ["c47", "c45", "c85", "c91", "c93", "c95"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 3,
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c50",
    slug: "referral-center",
    title: "진료협력센터(타 병원 의뢰) 안내",
    category: "기타",
    subcategory: "진료협력센터(타 병원 의뢰) 안내",
    departments: ["원무팀"],
    patientStages: [],
    summary: "처음 오시는 분과 다른 병원에서 의뢰받은 환자의 진료 접수 방법과 준비 서류를 안내합니다.",
    importantNotice:
      "처음 진료 시 요양급여의뢰서를 제출해야 건강보험이 적용됩니다. 없어도 진료는 가능하지만 진료비 전액을 부담하며, 제출한 시점부터 적용되고 이전 진료에는 소급되지 않습니다.",
    before:
      "• 요양급여의뢰서(진료의뢰서)\n• 건강보험증 또는 신분증\n• 의료급여 환자: 2차 병원에서 발급한 의료급여의뢰서\n• 다른 병원에서 찍은 영상 CD가 있으면 함께 가져오세요",
    during:
      "① 본관 1층 고객서비스센터 '처음 오신 분 창구'로 갑니다 (평일 08:30~17:30)\n② 진료신청서를 작성하고 서류를 제출합니다\n③ 예약이 없다면 진료 상담 후 진료 또는 예약을 안내받습니다\n④ 안내에 따라 수납한 뒤 진료과로 이동합니다",
    phaseLabelOverride: { before: "준비 서류", during: "방문 당일" },
    location: "진료협력센터: 본관 지하1층 사무실 · 본관 1층 창구 / 처음 오신 분 창구: 본관 1층 고객서비스센터",
    contact: "진료협력센터 02-2290-9717 (평일 08:30~17:30)",
    relatedContentIds: ["c45", "c44"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: false,
    version: 2,
    lastUpdated: "2026-11-02",
  },
  {
    contentId: "c72",
    slug: "emergency-guide",
    title: "응급진료 안내",
    category: "기타",
    subcategory: "응급의료센터 이용 안내",
    departments: ["전과공통"],
    patientStages: [],
    summary: "응급의료센터 위치와 접수부터 진료, 수납, 귀가·입원까지 순서를 안내합니다.",
    importantNotice:
      "응급 상황에서는 119로 연락하세요. 응급의료센터는 응급 증상 환자가 우선이며, 응급 증상에 해당하지 않는 경증 환자는 진료가 지연될 수 있고 건강보험 혜택이 제한될 수 있습니다.",
    before:
      "① 응급의료센터 수납창구에서 진료신청서를 작성해 제출합니다\n② 분류실(초진실)에서 예진을 받고, 중증도에 따라 응급실 병상을 배정받습니다\n③ 진료는 접수 순서가 아니라 응급·중증도 순서로 진행됩니다\n④ 응급의료센터 전담의사가 문진·진찰 후 응급처치와 필요한 혈액·방사선 검사를 하고, 필요하면 해당 진료과와 함께 진료합니다",
    during:
      "[귀가]\n• 귀가가 결정되면 간호사에게 퇴원 안내를 받고 응급 수납창구에서 진료비를 냅니다\n• 영수증을 간호사에게 보여주고 다음 진료와 주의사항을 상담합니다\n• 약 처방이 있으면 응급의료센터 안 약국에서 받습니다\n\n[입원]\n• 입원 치료가 필요하면 입원결정서를 받고, 응급 수납창구에서 입원 수속을 한 뒤 병실을 배정받습니다",
    after:
      "• 환자의 안정과 신속한 진료를 위해 보호자 1분이 함께 계셔야 합니다\n• 다른 가족은 응급실 보호자 대기실에서 기다려주세요\n• 응급센터에서는 응급한 검사만 가능합니다 (혈액·소변검사, X-ray, 필요 시 CT·초음파·MRI)\n• 응급센터 CT·일반촬영실은 24시간 운영됩니다\n• 응급 증상이 아닌 경우 요양급여의뢰서가 없으면 진료비 전액을 부담합니다",
    phaseLabelOverride: { before: "접수와 진료", during: "귀가 · 입원", after: "보호자와 이용 시 유의사항" },
    location: "본관 3층 응급의료센터",
    contact: "응급 상황 시 119 · 대표전화 02-2290-8114",
    relatedContentIds: ["c46", "c71", "c82", "c83"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: false,
    version: 1,
    lastUpdated: "2026-11-02",
  },

  // ── 병원이 제작한 안내자료(서비스전략팀 제공 이미지)를 바탕으로 새로 만든 콘텐츠 ──
  //    자료에 적힌 문구만 사용하고, 확인되지 않는 부분은 "review-needed"(관련 부서 검토 필요)로 남깁니다.
  //    승인 전까지는 공식 안내가 아닙니다.
  {
    contentId: "c81",
    slug: "ward-entry-visit",
    title: "병동 출입 및 면회 안내",
    category: "입원",
    subcategory: "병동 출입·면회",
    departments: ["원무팀", "전과공통"],
    patientStages: ["admitted"],
    summary:
      "입원병동에 들어갈 때 환자 확인용 팔찌와 보호자 출입증을 사용하는 방법, 병문안이 제한되는 경우, 보호자가 바뀔 때 출입증을 다시 받는 방법을 안내합니다.",
    detail: {
      notice: "입원병동은 출입증을 발급받은 보호자 1인 외에는 출입 및 면회가 불가합니다.",
      sections: [
        {
          id: "entry",
          title: "병동에 들어갈 때",
          icon: "id",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "환자가 출입할 때", text: "환자 확인용 팔찌의 바코드를 리더기에 인식시켜 주세요." },
                { title: "보호자가 출입할 때", text: "보호자 출입증의 바코드를 리더기에 인식시켜 주세요." },
              ],
            },
            { type: "paragraph", text: "환자용 팔찌 또는 보호자 출입증의 바코드를 바코드 리더기에 보여주시면 문이 열립니다." },
            { type: "image", assetId: "ward-entry-01" },
          ],
        },
        {
          id: "rules",
          title: "출입과 면회 규칙",
          icon: "shield",
          blocks: [
            {
              type: "list",
              items: [
                "입원병동은 출입증을 발급받은 보호자 1인 외에는 출입 및 면회가 불가합니다.",
                "입원병동 외 타 병동은 출입이 제한됩니다.",
              ],
            },
          ],
        },
        {
          id: "limited",
          title: "병문안이 제한되는 경우",
          icon: "alert",
          blocks: [
            { type: "paragraph", text: "다음에 해당하는 경우 병문안이 제한됩니다." },
            {
              type: "list",
              items: [
                "만 12세 이하 아동",
                "3인 이상 단체 방문",
                "꽃, 화분, 음식물 반입 및 반려동물 동반",
                "기침, 감기, 설사, 구토 등 감염성 질환이 있는 경우",
              ],
            },
            { type: "paragraph", text: "감염 예방을 위해 손씻기와 기침예절을 지켜주시기 바랍니다." },
          ],
        },
        {
          id: "change",
          title: "보호자가 바뀔 때",
          icon: "users",
          blocks: [
            {
              type: "paragraph",
              text: "보호자 교대 시 출입증을 재발급받으신 후 병동 출입이 가능합니다. 다음 장소에서 출입증을 발급받아 주시기 바랍니다.",
            },
            {
              type: "list",
              items: ["평일 08:00~22:00 — 본관 1층 안내데스크", "야간 및 주말·공휴일 — 본관 3층 응급실 원무과"],
            },
          ],
        },
      ],
    },
    relatedContentIds: ["c46", "c71", "c34", "c26", "c80", "c33", "c97"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 1,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-10",
  },
  {
    contentId: "c82",
    slug: "er-surgery-guardian",
    title: "응급실 수술환자 보호자 안내",
    category: "수술",
    subcategory: "응급실 수술환자 보호자",
    departments: ["응급의료센터"],
    patientStages: ["before-surgery"],
    summary:
      "응급실에서 수술이 결정된 환자의 보호자를 위해 수술 결정, 수술 대기, 수술 진행, 입원 치료의 4단계와 대기 장소, 수술 진행 상황을 받는 방법을 안내합니다.",
    detail: {
      notice: "대기 중 병원에서 연락을 드릴 수 있으니, 전화 연락이 오면 꼭 받아주시기 바랍니다.",
      sections: [
        {
          id: "flow",
          title: "한눈에 보는 4단계",
          icon: "route",
          blocks: [
            { type: "image", assetId: "er-surgery-guardian-01" },
            {
              type: "steps",
              items: [
                { title: "수술 결정", text: "응급실에 입실해 혈액·영상검사 등 검사 및 진료를 받고, 임상과와 협의 진료를 거쳐 수술·시술을 결정합니다. 검사결과는 검사종료에 따라 시간이 걸립니다." },
                { title: "수술 대기", text: "보호자 대기실에서 기다립니다. 대기 중 병원에서 연락을 드릴 수 있습니다." },
                { title: "수술 진행", text: "수술 진행 상황(수술 시작, 종료, 퇴실 위치)은 휴대폰 문자 메시지로 보호자에게 안내해 드립니다." },
                { title: "입원 치료", text: "수술 후 회복실에서 안정을 취한 뒤 상태에 따라 병실 또는 중환자실로 이동합니다. (의료진 안내에 따라 이동)" },
              ],
            },
          ],
        },
        {
          id: "wait",
          title: "수술 중 어디서 기다리나요?",
          icon: "users",
          blocks: [
            {
              type: "list",
              items: ["제왕절개 수술: 본관 5층 수술실 앞에서 대기", "그 외 수술: 본관 3층 보호자 대기실"],
            },
          ],
        },
        {
          id: "message",
          title: "수술 진행 문자 안내",
          icon: "bell",
          blocks: [
            { type: "paragraph", text: "수술 시작, 종료, 퇴실 위치를 휴대폰 문자 메시지로 알려 드립니다. 자료에 나온 문자 예시는 “OOO님이 수술실에 입실하였습니다.”입니다." },
            { type: "paragraph", text: "문자는 입원 수속 시 등록한 보호자 번호로 발송됩니다." },
          ],
        },
      ],
    },
    location: "본관 5층 수술실 앞 · 본관 3층 보호자 대기실",
    relatedContentIds: ["c46", "c72", "c16", "c83"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-10",
  },
  {
    contentId: "c83",
    slug: "er-ward-guide",
    title: "응급병동 이용 안내",
    category: "입원",
    subcategory: "응급병동 이용",
    departments: ["응급의료센터"],
    patientStages: ["admitted"],
    summary:
      "응급병동에 입실한 뒤 진료·검사, 치료, 전동·퇴원까지의 흐름과 병동 위치, 주요 시설, 식사 시간을 안내합니다.",
    detail: {
      notice: "검사 및 시술, 수술 예정 환자는 처방에 따라 금식이 시행될 수 있습니다.",
      sections: [
        {
          id: "journey",
          title: "환자 여정 4단계",
          icon: "route",
          blocks: [
            { type: "paragraph", text: "응급병동은 응급실에서 진료받은 뒤 입원하는 응급의료센터 소속 병동입니다." },
            { type: "image", assetId: "er-ward-journey-01" },
            {
              type: "steps",
              items: [
                { title: "입실", text: "환자 확인 및 병상 배정, 활력징후 측정, 증상 및 병력 확인, 초기 처치. 환자가 안심하고 치료받을 수 있도록 안내합니다." },
                { title: "진료 및 검사", text: "의료진 진찰, 혈액·소변검사, X-ray·CT·MRI·초음파, 검사 결과 확인. 환자가 알기 쉽게 충분히 설명합니다." },
                { title: "치료", text: "수액 및 약물치료, 산소·흡입치료, 상처 및 증상별 처치, 치료 경과 관찰. 환자의 상태를 살피며 안전을 최우선으로 치료합니다." },
                { title: "전동 및 퇴원", text: "최종 상태 확인, 퇴원 및 복약 안내, 외래 진료 예약, 전동·퇴원(전원). 퇴원 후 주의사항과 치료계획에 대한 정보를 안심할 수 있도록 안내합니다." },
              ],
            },
          ],
        },
        {
          id: "location",
          title: "병동 위치와 주요 시설",
          icon: "home",
          blocks: [
            { type: "image", assetId: "er-ward-map-01" },
            {
              type: "list",
              items: [
                "병실: 401호~408호, 간호사실",
                "주요 시설: 정수기, 샤워실, 세탁물 수집장소, 전자레인지, 오염물처리실, 엘리베이터",
                "엘리베이터: 본관 7층 연결, 동관 4층 연결",
              ],
            },
            { type: "paragraph", text: "응급병동은 동관 4층과 본관 7층을 잇는 연결통로 옆에 있습니다." },
          ],
        },
        {
          id: "meal",
          title: "식사 안내",
          icon: "clipboard",
          blocks: [
            { type: "paragraph", text: "응급병동 식사 시간: 아침 07:30 / 점심 12:00 / 저녁 17:30 (일반 병동은 시간이 다릅니다. ‘입원생활 안내’ 참고)" },
            {
              type: "list",
              items: [
                "검사 및 시술, 수술 예정 환자는 처방에 따라 금식이 시행될 수 있습니다.",
                "식사 변경이나 식이 상담이 필요하신 경우 담당 간호사에게 문의해 주시기 바랍니다.",
              ],
            },
          ],
        },
      ],
    },
    relatedContentIds: ["c72", "c82", "c46", "c26"],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: true,
    version: 4,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-10",
  },
  {
    contentId: "c84",
    slug: "picc-care",
    title: "말초삽입 중심정맥관(PICC) 관리 안내",
    category: "수술",
    subcategory: "시술 · 말초삽입 중심정맥관(PICC)",
    departments: ["영상의학과"],
    patientStages: ["admitted", "after-discharge"],
    summary:
      "말초삽입 중심정맥관(PICC)을 넣은 뒤 삽입 부위, 고정 테이프, 소독 부위, 관 주의사항을 안내합니다. 케모포트와는 다른 시술이므로 케모포트는 따로 확인해 주세요.",
    detail: {
      notice: "관이 잡아당겨지면 빠질 수 있으므로, 잡아당기거나 꺾이지 않도록 주의합니다.",
      sections: [
        {
          id: "overview",
          title: "이 안내는 무엇인가요?",
          icon: "info",
          blocks: [
            { type: "paragraph", text: "병원의 ‘말초중심정맥관 관련 안내’(환자 및 보호자를 위한 안내문)를 바탕으로 한 안내입니다." },
            { type: "paragraph", text: "케모포트의 관리 방법은 ‘중심정맥관·케모포트 삽입술 안내’에서 따로 확인해 주세요." },
          ],
        },
        {
          id: "site",
          title: "삽입 부위",
          icon: "care",
          blocks: [
            {
              type: "list",
              items: [
                "시술 과정으로 인한 멍, 뻐근함이 들 수 있습니다.",
                "통증·출혈 등이 있는 경우, 의료진에게 알립니다.",
                "관을 삽입한 쪽의 팔이나 어깨 통증이 있을 경우, 의료진에게 알립니다.",
                "삽입한 팔을 과도하게 움직이지 않도록 합니다.",
              ],
            },
          ],
        },
        {
          id: "tape",
          title: "고정 테이프",
          icon: "hand",
          blocks: [
            {
              type: "list",
              items: [
                "고정 테이프가 떨어지지 않도록 주의하시기 바랍니다.",
                "고정 테이프가 피부에서 떨어지면 관이 빠질 수 있으므로 주의하시기 바랍니다.",
              ],
            },
          ],
        },
        {
          id: "disinfect",
          title: "소독",
          icon: "shield",
          blocks: [
            { type: "list", items: ["소독 부위가 젖지 않도록 주의하고, 젖었을 경우 의료진에게 알립니다."] },
            { type: "review-needed", topic: "샤워·목욕 방법, 드레싱 교체 주기와 방법, 세척 방법, 운동 제한(이 안내자료에는 없음)" },
          ],
        },
        {
          id: "caution",
          title: "주의사항과 문의",
          icon: "alert",
          blocks: [
            { type: "list", items: ["관이 잡아당겨지면 빠질 수 있으므로, 잡아당기거나 꺾이지 않도록 주의합니다."] },
            { type: "paragraph", text: "말초중심정맥관 관련 추가 문의사항은 담당 간호사 및 진료과에 문의해 주시기 바랍니다." },
          ],
        },
      ],
    },
    relatedContentIds: ["c76", "c70", "c24"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 1,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-10",
  },
  {
    contentId: "c85",
    slug: "dental-scaling-fasttrack",
    title: "치과 스케일링 패스트트랙 안내",
    category: "기타",
    subcategory: "치과 · 스케일링 패스트트랙",
    departments: ["치과"],
    patientStages: [],
    summary:
      "검진을 받는 날 이어서 치과 스케일링까지 받을 수 있는 패스트트랙 서비스의 특징과 접수 방법, 동관 건강검진센터·서관 종합검진센터에서 치과로 가는 길을 안내합니다.",
    detail: {
      notice: "치과 외래 접수 시 ‘스케일링 패스트트랙 신청’ 여부를 말씀해 주세요.",
      sections: [
        {
          id: "about",
          title: "패스트트랙 서비스란?",
          icon: "info",
          blocks: [
            { type: "paragraph", text: "한양대학교병원만의 정밀 검진부터 전문의 진료까지 한 번에! 검진부터 진료까지 한 번에 해결하는 고효율 원스톱 서비스입니다." },
            {
              type: "list",
              items: [
                "최우선 시스템: 검진부터 진료까지 신속한 진료시스템으로 대기시간을 최소화하였습니다.",
                "간편한 진료 절차: 3차 의료 기관임에도 불구하고 진료의뢰서 없이 바로 진료를 받을 수 있습니다.",
                "원스톱: 검진에서 진료까지 기다림없는 원스톱 스케일링 케어를 이용할 수 있습니다.",
              ],
            },
            { type: "paragraph", text: "검진을 받는 날 이용하는 분뿐 아니라 일반 외래 환자도 이용할 수 있습니다." },
            { type: "paragraph", text: "이 서비스는 9월부터 시작했고, 우선 계속 진행할 예정입니다." },
          ],
        },
        {
          id: "content",
          title: "진료 내용 (예시)",
          icon: "clipboard",
          blocks: [
            { type: "paragraph", text: "건강보험 적용 일반환자 기준 예시: 파노라마 X-ray 촬영 + 치과 정밀검진 + 건강보험 스케일링" },
          ],
        },
        {
          id: "register",
          title: "접수 방법",
          icon: "id",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "본관 3층 수납 창구 방문", text: "신분증 지참이 필수입니다." },
                { title: "치과 외래에서 접수", text: "접수할 때 “스케일링 패스트트랙 신청” 여부를 말씀해 주세요." },
              ],
            },
          ],
        },
        {
          id: "route-health",
          title: "동관 건강검진센터에서 가는 길",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "동관 3층 건강검진센터 출발", text: "엘리베이터를 이용해 동관 1층으로 이동합니다." },
                { title: "동관 1층 → 본관 3층", text: "건물 밖으로 나와 본관 3층으로 이동합니다." },
                { title: "본관 3층 수납창구", text: "수납 후 에스컬레이터 또는 엘리베이터를 이용합니다." },
                { title: "본관 2층 치과 외래", text: "치과 외래로 이동합니다." },
              ],
            },
          ],
        },
        {
          id: "route-checkup",
          title: "서관 종합검진센터에서 가는 길",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "서관 3층 종합검진센터 출발", text: "엘리베이터를 이용해 서관 6층으로 이동합니다." },
                { title: "서관 6층 → 본관 3층", text: "연결통로를 통해 본관 3층으로 이동합니다." },
                { title: "본관 3층 수납창구", text: "수납 후 에스컬레이터 또는 엘리베이터를 이용합니다." },
                { title: "본관 2층 치과 외래", text: "치과 외래로 이동합니다." },
              ],
            },
          ],
        },
        {
          id: "notes",
          title: "안내 사항",
          icon: "alert",
          blocks: [
            {
              type: "list",
              items: [
                "건강보험 스케일링은 만 19세 이상, 연 1회 급여 기준 충족 시 적용됩니다.",
                "파노라마 X-ray는 진료상 필요성과 급여 기준에 따라 급여 또는 비급여로 적용될 수 있습니다.",
                "전신질환 또는 복용 중인 약물이 있는 경우, 의료진 판단에 따라 당일 시술이 어려울 수 있습니다.",
                "구강 상태에 따라 추가 검사나 치료가 필요할 수 있으며, 별도 비용이 발생할 수 있습니다.",
              ],
            },
          ],
        },
      ],
    },
    location: "본관 2층 치과",
    contact: "치과 02-2290-8671~2",
    relatedContentIds: ["c45", "c44", "c49"],
    estimatedReadMinutes: 3,
    status: "게시",
    needsClinicalReview: true,
    version: 3,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-13",
  },
  {
    contentId: "c86",
    slug: "obgyn-outpatient-reception",
    title: "산부인과 외래 접수 절차 안내",
    category: "기타",
    subcategory: "산부인과 외래 접수",
    departments: ["산부인과", "원무팀"],
    patientStages: [],
    summary: "산부인과 외래 진료를 받을 때 수납, 진료과 접수, 진료 대기, 진료, 진료 후 안내까지 5단계 순서를 안내합니다.",
    detail: {
      notice: "진료 접수 전에 원무팀 수납 창구에서 먼저 수납해 주세요.",
      sections: [
        {
          id: "flow",
          title: "접수부터 진료 후 안내까지",
          icon: "route",
          blocks: [
            { type: "image", assetId: "obgyn-reception-01" },
            {
              type: "steps",
              items: [
                { title: "수납 [본관 1, 3층 원무팀 수납]", text: "진료 접수 전 원무팀 수납 창구에서 수납해 주세요." },
                { title: "진료과 접수 [본관 2층 진료과 접수 창구]", text: "해당 진료과 접수 창구에서 접수를 해주세요." },
                { title: "진료 대기 [진료과 앞 대기실]", text: "접수 후 호출 시까지 대기실에서 대기해 주세요." },
                { title: "진료·검사 [진료실·초음파 검사실]", text: "호출 시 진료실로 입실하여 진료를 받습니다. 초음파 검사가 있으면 호출 시 초음파 검사실로 이동합니다." },
                { title: "진료 후 안내 [진료과 접수 창구]", text: "진료 후 예약/수납 등 안내를 받으세요." },
              ],
            },
            { type: "image", assetId: "obgyn-outpatient-guide-01" },
          ],
        },
      ],
    },
    location: "수납 본관 1층·3층 · 진료과 접수 본관 2층",
    relatedContentIds: ["c45", "c44", "c92", "c98"],
    estimatedReadMinutes: 1,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c87",
    slug: "treatment-decision-participation",
    title: "치료 결정 과정에 참여하기",
    category: "입원",
    subcategory: "치료 결정 참여",
    departments: ["전과공통"],
    patientStages: ["before-test", "before-surgery", "admitted"],
    summary: "한양대학교병원의 모든 치료 결정은 환자의 질문과 의견을 고려하여 시작합니다. 환자가 함께 참여하는 5가지 방법을 안내합니다.",
    detail: {
      notice: "통증은 참지 말고 의료진에게 통증 조절을 요청해 주세요.",
      sections: [
        {
          id: "intro",
          title: "치료 결정 과정은 ‘나’로부터 시작합니다",
          icon: "users",
          blocks: [
            { type: "paragraph", text: "환자의 참여는 안전하고 올바른 치료의 시작입니다. 한양대학교병원의 모든 치료 결정은 환자의 질문과 의견을 고려하여 시작합니다." },
            { type: "image", assetId: "treatment-decision-01" },
          ],
        },
        {
          id: "ways",
          title: "함께 참여하는 5가지 방법",
          icon: "clipboard",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "환자 본인의 정보를 항상 확인하기", text: "투약, 검사, 수술 등을 시행할 때 이름과 등록번호는 환자 본인 확인하는 방법입니다." },
                { title: "나의 건강 정보 알려주기", text: "현재 복용하고 있는 약물(지참약)과 약물 부작용 여부, 알레르기 등 환자 본인의 건강 정보를 의료진에게 미리 알려주세요." },
                { title: "나의 질문이나 의견 말하기", text: "치료 결정 과정에서 질문이나 의견을 의료진과 직원에게 항상 말해주세요." },
                { title: "검사 및 수술 결정 등 동의서 작성하기", text: "검사 및 수술 결정 등 치료 과정에서 의료진의 설명을 잘 듣고 환자 본인의 의사를 표현한 후 동의서를 작성해 주세요. 치료 결정에 참여하는 방법입니다." },
                { title: "통증 조절 요청하기", text: "통증은 참지 말고 의료진에게 통증 조절을 요청해 주세요." },
              ],
            },
          ],
        },
      ],
    },
    relatedContentIds: ["c30", "c77", "c22", "c19", "c88", "c89"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c88",
    slug: "ask-and-complain",
    title: "궁금한 점 묻기·불편 사항 말하기",
    category: "입원",
    subcategory: "환자 권리 보장(고객의 소리)",
    departments: ["전과공통", "원무팀"],
    patientStages: ["admitted"],
    summary: "입원 중 궁금하거나 설명이 부족한 내용은 언제든지 다시 문의할 수 있고, 불편 사항이나 불만은 방문·온라인·고객의 소리함으로 말씀하실 수 있습니다.",
    detail: {
      notice: "입원 기간 중 궁금하거나 설명이 부족한 내용은 언제든지 문의해 주세요.",
      sections: [
        {
          id: "ask",
          title: "다시 쉽게 물어보기",
          icon: "question",
          blocks: [
            { type: "paragraph", text: "입원 기간 중 궁금하거나 설명이 부족한 내용은 언제든지 문의해 주세요. “한 번 더 자세히 알려주실 수 있나요?”라고 물으시면, 궁금한 내용에 대해 다시 한번 설명해 드리고 필요한 정보를 제공하겠습니다." },
            { type: "image", assetId: "patient-rights-01" },
          ],
        },
        {
          id: "complain",
          title: "불만 쉽게 말하기",
          icon: "bell",
          blocks: [
            { type: "paragraph", text: "입원 기간 중 불편 사항이나 불만이 있으시면 말씀해 주세요." },
            {
              type: "list",
              items: [
                "병동에서: 담당 간호사에게 요청하기",
                "방문: 본관 1층 고객서비스센터, 본관 지하1층 고객상담실 (전화 02-2290-9597 · 팩스 02-2290-9737)",
                "온라인: 한양대학교병원 홈페이지 → 고객서비스 → 고객상담실 → 고객의 소리",
                "오프라인: 각 병동 승강기 옆 또는 외래 접수처 앞 ‘고객의 소리함’",
              ],
            },
          ],
        },
      ],
    },
    contact: "고객 상담 02-2290-9597 · 팩스 02-2290-9737",
    relatedContentIds: ["c26", "c46", "c87", "c77"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 2,
    createdAt: "2026-11-10",
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c89",
    slug: "pain-control-request",
    title: "통증 조절 요청하기",
    category: "입원",
    subcategory: "통증 조절 요청",
    departments: ["전과공통"],
    patientStages: ["before-surgery", "admitted"],
    summary:
      "통증은 참지 말고 의료진에게 알려 주세요. 통증 정도를 표현하는 방법과 스스로 해볼 수 있는 통증 조절 방법 3가지를 병원 안내자료에 따라 안내합니다.",
    detail: {
      notice: "통증은 참지 말고 의료진에게 말씀하세요. 의료진은 통증 정도를 확인하여 원인을 파악하고 적절한 진통제를 처방합니다.",
      sections: [
        {
          id: "intro",
          title: "아픈 만큼 표현해 주세요",
          icon: "info",
          blocks: [
            { type: "paragraph", text: "통증 조절을 요청하고, 스스로 할 수 있는 통증 조절 방법을 알아두세요." },
            { type: "image", assetId: "patient-safety-fall-pain-01" },
          ],
        },
        {
          id: "scale",
          title: "통증 정도를 말하는 방법",
          icon: "clipboard",
          blocks: [
            {
              type: "paragraph",
              text: "안내자료에는 통증 정도를 0부터 10까지 숫자로 나타내는 척도(NRS)와, 얼굴 표정 6단계로 나타내는 척도(FPRS)가 함께 실려 있습니다. 숫자는 0이 ‘아프지 않음’, 10이 ‘가장 심하게 아픔’에 해당합니다.",
            },
            { type: "review-needed", topic: "얼굴 표정 6단계 각각의 설명 문구(원본 그림의 해상도가 낮아 글자 확인이 어려움)" },
          ],
        },
        {
          id: "self",
          title: "스스로 해볼 수 있는 통증 조절 방법",
          icon: "care",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "마사지하고 심호흡하기", text: "아픈 부위를 마사지하거나 가볍게 두드린 후 심호흡합니다." },
                { title: "냉찜질 또는 온찜질", text: "15분 이내로 합니다." },
                { title: "편안한 자세 취하기", text: "베개와 부드러운 쿠션을 이용해 편안한 자세를 취합니다." },
              ],
            },
            {
              type: "review-needed",
              topic: "수술·시술 부위나 상태에 따라 마사지·냉온찜질을 해도 되는지, 어떤 경우에 냉찜질과 온찜질을 구분하는지, 피부 손상 주의 방법",
            },
          ],
        },
        {
          id: "staff",
          title: "의료진이 하는 일",
          icon: "users",
          blocks: [
            { type: "paragraph", text: "의료진은 통증 정도를 확인하여 원인을 파악하고 적절한 진통제를 처방합니다." },
            { type: "review-needed", topic: "진통제 종류·복용 방법·부작용, 자가 통증 조절 장치(PCA) 사용 대상(‘수술 후 회복 관리 안내’에 일부 안내됨)" },
          ],
        },
      ],
    },
    relatedContentIds: ["c87", "c19", "c29", "c30"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 1,
    createdAt: "2026-11-11",
    lastUpdated: "2026-11-11",
  },
  {
    contentId: "c90",
    slug: "robotic-surgery",
    title: "로봇수술 안내",
    category: "수술",
    subcategory: "로봇수술센터",
    departments: ["비뇨의학과", "산부인과", "이비인후과", "외과", "심장혈관흉부외과"],
    patientStages: ["before-surgery", "admitted"],
    summary:
      "로봇수술이란 무엇인지, 시행 분야, 수술 전 준비, 수술 당일 과정, 보호자 안내와 수술 후 주의사항, 자주 묻는 질문을 한양대학교병원 로봇수술센터 리플릿에 따라 안내합니다.",
    detail: {
      notice: "수술 종류에 따라 예외가 있을 수 있으니, 담당 의료진 안내를 꼭 확인해 주세요.",
      sections: [
        {
          id: "about",
          title: "로봇수술이란?",
          icon: "info",
          blocks: [
            { type: "paragraph", text: "한양대학교병원 로봇수술센터는 최첨단 로봇수술로 환자분의 빠른 회복과 안전을 최우선으로 합니다." },
            {
              type: "paragraph",
              text: "다빈치 로봇 수술은 고화질 3D 영상과 360° 자유로운 로봇 팔을 활용해 의료진의 손길처럼 정밀하고 안전한 수술을 가능하게 합니다. 리플릿 그림에는 ‘집도의 콘솔’과 ‘환자카트’가 소개되어 있습니다.",
            },
            { type: "image", assetId: "robot-surgery-leaflet-01" },
            { type: "review-needed", topic: "리플릿의 ‘로봇 수술 동영상’ QR 코드 2개(로봇 수술 과정 소개, 다빈치 로봇 소개)의 연결 주소" },
          ],
        },
        {
          id: "fields",
          title: "로봇수술을 시행하는 분야와 주요 질환",
          icon: "clipboard",
          blocks: [
            {
              type: "list",
              items: [
                "비뇨의학과: 전립선, 신장, 방광 질환, 요로결석",
                "산부인과: 양성부인과 질환(자궁근종, 난소 기형종, 자궁내막증 등), 악성부인과 질환(자궁내막암, 자궁경부암, 난소암 등)",
                "이비인후과: 두경부암(구강·편도·설근·후두·인두), 갑상선암, 침샘적출술, 두경부 양성종양, 경부종양",
                "외과: 탈장, 갑상선, 대장, 간, 췌장, 담도·담낭 질환, 부신, 유방질환, 충수염",
                "심장혈관흉부외과: 폐암, 종격동, 식도 종양",
              ],
            },
            { type: "review-needed", topic: "내 질환이 로봇수술 대상인지(담당 진료과 의료진이 판단)" },
          ],
        },
        {
          id: "benefit",
          title: "로봇수술의 장점",
          icon: "shield",
          blocks: [
            {
              type: "list",
              items: ["작은 절개(흉터 최소화)", "조직 손상 최소화(빠른 회복)", "정밀한 수술 가능", "다양한 진료과 적용"],
            },
          ],
        },
        {
          id: "prepare",
          title: "수술 전 준비",
          icon: "clipboard",
          blocks: [
            {
              type: "list",
              items: [
                "전일 자정 이후 금식(물·음식 금지): 세부 시간은 병동 안내를 따릅니다.",
                "화장·매니큐어 제거: 피부·혈액순환 상태를 확인하는 데 방해가 됩니다.",
                "의치·보청기·렌즈·안경·장신구 금지: 틀니는 기도로 넘어가 질식 위험이 있고, 금속 장신구는 전기 수술기구를 사용할 때 화상 위험이 있습니다.",
                "소지품·귀중품은 병동에 개인 보관",
                "속옷·양말 착용 금지: 응급상황 시 대처 및 감염 예방을 위해서입니다.",
                "수술 부위 표시: 담당 의사가 피부에 표시합니다(단일 장기 제외).",
                "수술실 이동 전 화장실 다녀오기",
              ],
            },
            {
              type: "review-needed",
              topic: "복용 중인 약 처리 방법(이 리플릿에는 없음)",
            },
          ],
        },
        {
          id: "day",
          title: "수술 당일 진행 과정",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "수술실 이동", text: "이송 직원이 동행합니다." },
                { title: "수술 전 대기실에서 간호사와 확인", text: "이름, 등록번호, 수술 부위, 금식 여부, 동의서, 귀중품 제거 여부 등을 확인합니다." },
                { title: "수술 진행", text: "의료진과 함께 수술실에 입실합니다." },
                { title: "수술 후 회복", text: "회복실로 이동하여 의식과 안정 상태를 확인합니다." },
              ],
            },
          ],
        },
        {
          id: "guardian",
          title: "보호자 안내",
          icon: "users",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "동행 범위", text: "감염 예방을 위해 수술실 입구까지만 가능합니다(소아 환자 제외)." },
                { title: "대기 장소", text: "수술 중 보호자는 병실에서 대기합니다. 본관 3층 응급실 보호자 대기실도 이용할 수 있습니다." },
                { title: "진행 안내", text: "입력된 보호자 전화번호로 수술 진행 상황을 문자로 보냅니다. (예: “OOO님이 수술실에 입실하였습니다.”)" },
              ],
            },
            {
              type: "paragraph",
              text: "수술실 앞에는 보호자 대기공간이 없지만, 본관 5층 수술실 앞 ‘수술환자현황’ 화면(DID)에서 수술 진행 현황을 볼 수 있습니다.",
            },
          ],
        },
        {
          id: "after",
          title: "수술 후 주의사항",
          icon: "care",
          blocks: [
            {
              type: "list",
              items: [
                "심호흡·기침 권장: 마취 회복 및 폐렴 예방을 위해서입니다.",
                "기도 삽관으로 인한 목 통증이 있을 수 있으며, 시간이 지나면 없어집니다.",
                "배액관은 필요한 경우 의료진 지시에 따라 관리합니다.",
              ],
            },
            { type: "paragraph", text: "수술 종류에 따라 예외가 있을 수 있으니, 담당 의료진 안내를 꼭 확인해 주시기 바랍니다." },
            { type: "review-needed", topic: "퇴원 후 일상생활·운동·식사·상처 관리(이 리플릿에는 없음), 수술 종류별 예외" },
          ],
        },
        {
          id: "time",
          title: "수술 시간은 얼마나 걸리나요?",
          icon: "question",
          blocks: [
            {
              type: "list",
              items: ["대기 시간: 약 30분 내외", "준비 시간: 약 1시간 내외", "수술 시간: 의료진이 설명 드린 시간", "회복 시간: 약 1시간 내외"],
            },
            { type: "paragraph", text: "※ 수술 준비 과정 및 진행 상황에 따라 달라질 수 있습니다." },
          ],
        },
        {
          id: "leaflet",
          title: "리플릿으로 보기",
          icon: "info",
          blocks: [
            { type: "image", assetId: "robot-surgery-leaflet-02" },
          ],
        },
      ],
      faq: [
        {
          question: "흉터는 어느 정도 남나요?",
          answer: "작은 절개 부위로 로봇 팔이 진입하므로 흉터가 거의 남지 않아 기존 수술 방법보다 미용적 만족도가 높다고 안내하고 있습니다.",
        },
        {
          question: "합병증 가능성은 없나요?",
          answer:
            "모든 수술에는 합병증 가능성이 있습니다. 하지만 로봇 수술은 최소한의 조직 손상으로 출혈·통증·감염 위험을 줄이고, 빠른 회복을 돕는 장점이 있다고 안내하고 있습니다.",
        },
      ],
    },
    location: "서울시 성동구 왕십리로 222-1 로봇 수술 센터",
    relatedContentIds: ["c16", "c22", "c19", "c89", "c77"],
    estimatedReadMinutes: 4,
    status: "게시",
    needsClinicalReview: true,
    version: 3,
    createdAt: "2026-11-11",
    lastUpdated: "2026-11-13",
  },
  {
    contentId: "c91",
    slug: "hipass-payment",
    title: "진료비 하이패스(후불결제) 안내",
    category: "기타",
    subcategory: "원무팀 · 진료비 하이패스",
    departments: ["원무팀"],
    patientStages: [],
    summary:
      "신용카드를 미리 등록해 두면 수납창구를 거치지 않고 진료·검사를 받고 귀가한 뒤, 진료비가 다음 날 결제되는 ‘진료비 하이패스’의 이용 절차와 신청 방법, 처방전이 필요한 경우를 안내합니다.",
    detail: {
      notice: "신청할 때 신청인 신분증과 신용카드를 꼭 지참해 주세요. 법인카드와 해외발급 카드는 신청할 수 없습니다.",
      sections: [
        {
          id: "about",
          title: "진료비 하이패스란?",
          icon: "info",
          blocks: [
            { type: "paragraph", text: "신용카드 등록 후 수납창구 방문 없이 검사와 진료를 할 수 있는 빠르고 편리한 제도입니다. 진료비 후불결제 서비스입니다." },
            { type: "image", assetId: "hipass-poster-01" },
          ],
        },
        {
          id: "flow",
          title: "이용 절차",
          icon: "route",
          blocks: [
            {
              type: "steps",
              items: [
                { title: "외래 진료", text: "수납창구를 거치지 않고 진료를 받습니다." },
                { title: "검사", text: "필요한 검사를 받습니다." },
                { title: "귀가", text: "수납 없이 귀가합니다." },
                { title: "익일 결제", text: "등록한 신용카드로 다음 날 진료비가 결제됩니다." },
                { title: "알림톡 발송", text: "영수증, 세부내역서, 실손보험청구 안내를 알림톡으로 받습니다." },
              ],
            },
            { type: "paragraph", text: "알림톡은 진료 접수 때 등록한 휴대전화 번호로 발송됩니다." },
          ],
        },
        {
          id: "apply",
          title: "신청 방법",
          icon: "id",
          blocks: [
            {
              type: "list",
              items: [
                "필수 지참: 신청인 신분증, 신용카드",
                "신청 장소: 본관 1층 처음 오신 분 창구(하이패스 전용 창구가 함께 있습니다) 및 원무팀 각 수납창구",
                "법인카드 및 해외발급 카드는 신청이 불가합니다.",
                "카드 개인정보는 수납 이외에 어떤 용도로도 사용되지 않습니다.",
              ],
            },
            { type: "review-needed", topic: "하이패스 창구의 운영시간, 해지 방법" },
          ],
        },
        {
          id: "rx",
          title: "처방전이 필요한 경우",
          icon: "pill",
          blocks: [
            {
              type: "list",
              items: [
                "원외처방: 무인 수납기에서 하이패스 결제 후 처방전을 받습니다.",
                "원내처방: 무인 수납기에서 하이패스 결제 후 병원 내 약국에서 약을 받습니다.",
              ],
            },
            { type: "paragraph", text: "무인 수납기는 본관 1층과 본관 3층의 접수·수납 창구 옆에 있습니다." },
            { type: "review-needed", topic: "하이패스로 결제가 안 될 때의 대처 방법" },
          ],
        },
      ],
    },
    location: "본관 1층 하이패스 전용 창구 · 원무팀 각 수납창구",
    contact: "하이패스 문의 02-2290-9026",
    relatedContentIds: ["c45", "c49", "c47", "c71"],
    estimatedReadMinutes: 2,
    status: "게시",
    needsClinicalReview: true,
    version: 4,
    createdAt: "2026-11-11",
    lastUpdated: "2026-11-13",
  },
  ...EXTRA_GUIDES,
];

/** 원본 콘텐츠에 2.0 분류(여정 단계·주제·키워드·출처·검토 표시)를 덧붙인 최종 목록 */
export const GUIDES: GuideContent[] = RAW_GUIDES.map(applyClassification);

export function findGuideBySlug(slug: string): GuideContent | undefined {
  return GUIDES.find((g) => slugEquals(g.slug, slug));
}
