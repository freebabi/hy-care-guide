import type { GuideImageAsset } from "./types";

/**
 * 웹 상세 화면에 쓰는 안내 이미지 관리 목록입니다.
 *
 * - 원본은 프로젝트 루트의 `reference-materials/` 폴더에 그대로 보관합니다(수정·이동 금지).
 * - 이 목록에 있는 이미지만 `public/assets/guides/`에 웹용 복사본으로 둡니다(사용 승인이 확인된 서비스전략팀 제작 이미지).
 * - 파일명은 영문·숫자·하이픈만 씁니다: `{주제}-{세부}-{번호}.jpg`
 * - approval "approved" = 웹·공개 사용 승인이 확인된 이미지입니다(이미지 사용 승인이며, 이를 바탕으로 쓴 안내문의 의료 검토 승인과는 별개).
 *   "internal-use" = 내부 사용만 허용, "pending" = 승인 대기. 상태가 바뀌면 lastReviewedAt을 갱신하세요.
 */
export const IMAGE_ASSETS: GuideImageAsset[] = [
  {
    id: "fall-call-bell-01",
    src: "/assets/guides/fall-call-bell-01.jpg",
    width: 1742,
    height: 1234,
    contentIds: ["c29"],
    description: "낙상예방 포스터: 혼자 이동하면 넘어질 위험이 있으니 콜벨로 직원에게 요청",
    alt: "혼자 이동하시면 넘어지실 위험이 있습니다. 불편하시거나 이동이 필요하실 때는 부담없이 콜벨을 눌러 직원에게 요청해주시기 바랍니다. 저희가 신속하고 안전하게 바로 도와드리겠습니다.",
    sourceFile: "251114 낙상예방안내문 최종.jpg",
    sourceDate: "파일명 2025-11-14 · 파일 수정 2025-12-02",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "fall-shower-room-01",
    src: "/assets/guides/fall-shower-room-01.jpg",
    width: 1400,
    height: 1980,
    contentIds: ["c29"],
    description: "샤워실 낙상주의 포스터: 바닥 미끄러움, 안전바·의자 이용, 호출벨 당기기",
    alt: "샤워실 낙상주의. 물기로 인해 바닥이 미끄러우니 주의하세요. 안전을 위해 안전바와 의자를 이용하세요. 도움이 필요한 경우 호출벨을 당겨주세요.",
    sourceFile: "260826 샤워실 낙상주의_15층.jpg",
    sourceDate: "파일명 2026-08-26 · 파일 수정 2026-08-26",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "safe-medication-01",
    src: "/assets/guides/safe-medication-01.jpg",
    width: 1400,
    height: 1979,
    contentIds: ["c30"],
    description: "안전한 병원생활 포스터(복용약): 입원 전 복용 중인 약 알리기 4가지 (연두색 버전)",
    alt: "환자와 의료진이 함께하는 안전한 병원생활. 입원 전 복용 중인 약에 대해 모두 말씀해 주세요. 복용 중인 약 때문에 치료 방법이 바뀔 수 있어요. 질환과 관련이 없어 보여도 영향이 있을 수 있어요. 매일 복용하는 약이 아니라면 주기를 말씀해 주세요. 이전 복용 시 이상 증상이 있었다면 말씀해 주세요.",
    sourceFile: "251230 병동게시판 QI 안내문 (복용약) (1).jpg",
    sourceDate: "파일명 2025-12-30 · 파일 수정 2025-12-30",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "mri-process-01",
    src: "/assets/guides/mri-process-01.jpg",
    width: 2800,
    height: 1025,
    contentIds: ["c02"],
    description: "MRI 검사 과정 7단계 인포그래픽(접수·탈의·혈관 주사·대기·검사·지혈 및 귀가·결과)",
    alt: "MRI 검사 과정 7단계. 1 MRI 접수(예약 순서대로 진행), 2 탈의(검사복으로 환복), 3 혈관 주사(조영제를 이용한 검사 시 혈관주사 삽입), 4 검사 대기(MRI실 앞 대기공간에서 대기), 5 검사(소요시간 30분에서 1시간), 6 지혈·귀가(주사 제거부위 지혈, 환복 후 귀가), 7 검사 결과(입원 환자는 면담 시 설명, 외래 환자는 외래 진료 시 설명). 중증 환자의 경우 우선적으로 검사가 진행됩니다.",
    sourceFile: "3. MRI 검사 과정 (143.5x52.5).jpg",
    sourceDate: "파일 수정 2026-08-18(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "er-surgery-guardian-01",
    src: "/assets/guides/er-surgery-guardian-01.jpg",
    width: 1800,
    height: 1273,
    contentIds: ["c82"],
    description: "응급실 수술환자 전용 보호자 안내문: 수술 결정·대기·진행·입원 치료 4단계",
    alt: "응급실 수술환자 전용 보호자 안내문. 수술 결정: 응급실 입실, 검사 및 진료, 임상과와 협의 진료. 수술 대기: 제왕절개 수술은 본관 5층 수술실 앞 대기, 그 외 수술은 본관 3층 보호자 대기실, 대기 중 병원에서 전화 연락이 오면 꼭 받아주시기 바랍니다. 수술 진행: 수술 시작, 종료, 퇴실 위치를 휴대폰 문자 메시지로 안내합니다. 입원 치료: 회복실에서 안정을 취한 뒤 병실 또는 중환자실로 이동합니다.",
    sourceFile: "260304 최종 응급실 수술환자 전용 보호자 안내문 최종.jpg",
    sourceDate: "파일명 2026-03-04 · 파일 수정 2026-03-04",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "er-ward-journey-01",
    src: "/assets/guides/er-ward-journey-01.jpg",
    width: 2000,
    height: 1000,
    contentIds: ["c83"],
    description: "응급병동 환자여정지도: 입실·진료 및 검사·치료·전동 및 퇴원 4단계",
    alt: "응급병동 환자여정지도. 입실: 환자 확인 및 병상 배정, 활력징후 측정, 증상 및 병력 확인, 초기 처치. 진료 및 검사: 의료진 진찰, 혈액·소변검사, X-ray·CT·MRI·초음파, 검사 결과 확인. 치료: 수액 및 약물치료, 산소·흡입치료, 상처 및 증상별 처치, 치료 경과 관찰. 전동 및 퇴원: 최종 상태 확인, 퇴원 및 복약 안내, 외래 진료 예약, 전동·퇴원(전원).",
    sourceFile: "첨부1. 응급병동 환자여정지도 200x100.jpg",
    sourceDate: "파일 수정 2026-10-15(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "er-ward-map-01",
    src: "/assets/guides/er-ward-map-01.jpg",
    width: 1800,
    height: 1238,
    contentIds: ["c83"],
    description: "응급병동 위치 안내: 401~408호 평면도, 주요 시설, 식사 시간",
    alt: "응급병동 위치 안내. 401호부터 408호, 간호사실, 정수기, 오염물처리실, 세탁물 수집장소, 전자레인지, 샤워실의 위치와 본관 7층 연결, 동관 4층 연결 엘리베이터. 식사 시간은 아침 7시 30분, 점심 12시, 저녁 5시 30분입니다. 검사 및 시술, 수술 예정 환자는 처방에 따라 금식이 시행될 수 있습니다.",
    sourceFile: "첨부3. 응급병동 위치 안내 81x55.jpg",
    sourceDate: "파일 수정 2026-10-15(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "ward-entry-01",
    src: "/assets/guides/ward-entry-01.jpg",
    width: 1800,
    height: 1273,
    contentIds: ["c81"],
    description: "병동 출입 안내: 환자 확인용 팔찌·보호자 출입증의 바코드를 리더기에 인식",
    alt: "병동 출입 안내. 환자 출입 시 환자 확인용 팔찌의 바코드를 리더기에 인식시켜 주세요. 보호자 출입 시 보호자 출입증의 바코드를 리더기에 인식시켜 주세요.",
    caption: "※ 그림 속 이름·번호는 예시이며 실제 환자 정보가 아닙니다.",
    sourceFile: "T관 출입문 (2).jpg",
    sourceDate: "파일 수정 2025-06-12(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "hospital-life-01",
    src: "/assets/guides/hospital-life-01.jpg",
    width: 1400,
    height: 1983,
    contentIds: ["c26"],
    description: "병원 생활 안내: 배려문화(소음·취침)와 귀중품·환의·침상 이동·회진·식사 7항목",
    alt: "병원 생활 안내. 환자의 빠른 회복과 쾌유를 위해 모두 함께 지켜 주세요. 배려문화: 소음 제로(휴대전화 진동, 통화 작은소리, 이어폰 사용), 취침시간 배려(밤 9시 소등, 대화 자제, TV시청 자제). 병원생활: 귀중품 관리, 환의 및 시트, 침상 간 이동 금지, 회진 및 의사 면담 안내, 식사 안내(보호자 식사는 전액 본인부담, 아침 07:40~08:10, 점심 12:30~13:00, 저녁 18:00~18:30).",
    sourceFile: "첨부1. 병원생활안내 (A4).png",
    sourceDate: "파일 수정 2025-06-16(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "treatment-decision-01",
    src: "/assets/guides/treatment-decision-01.jpg",
    width: 1400,
    height: 1980,
    contentIds: ["c87"],
    description: "치료 결정과정 참여 5가지 포스터",
    alt: "치료 결정과정 참여. 환자의 참여는 안전하고 올바른 치료의 시작입니다. 환자 본인의 정보를 항상 확인하기, 나의 건강 정보 알려주기, 나의 질문이나 의견 말하기, 검사 및 수술 결정 등 동의서 작성하기, 통증 조절 요청하기.",
    sourceFile: "첨부2. 치료 결정 과정 참여 (A4).png",
    sourceDate: "파일 수정 2025-06-16(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "patient-rights-01",
    src: "/assets/guides/patient-rights-01.jpg",
    width: 1400,
    height: 1988,
    contentIds: ["c88"],
    description: "환자 권리 보장 노력 포스터: 다시 쉽게 물어보기, 불만 쉽게 말하기(방문·온라인·오프라인)",
    alt: "궁금한 내용 물어보기가 항상 쉬웠습니다. 입원 기간 중 궁금하거나 설명이 부족한 내용은 언제든지 문의해 주세요. 불편 사항이나 불만은 방문(본관 1층 고객서비스센터, 본관 지하1층 고객상담실, 전화 02-2290-9597, 팩스 02-2290-9737), 온라인(한양대학교병원 홈페이지 고객서비스 고객상담실 고객의 소리), 오프라인(각 병동 승강기 옆 또는 외래 접수처 앞 고객의 소리함)으로 말씀해 주세요.",
    sourceFile: "첨부3. 환자 권리 보장 노력 (A4).png",
    sourceDate: "파일 수정 2025-06-16(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "obgyn-reception-01",
    src: "/assets/guides/obgyn-reception-01.jpg",
    width: 2000,
    height: 1100,
    contentIds: ["c86"],
    description: "산부인과 외래 접수 절차 5단계 인포그래픽",
    alt: "산부인과 외래 접수 절차 안내. 1 수납: 본관 1층, 3층 원무팀 수납 창구에서 진료 접수 전 수납. 2 진료과 접수: 본관 2층 진료과 접수 창구에서 접수. 3 진료 대기: 접수 후 호출 시까지 진료과 앞 대기실에서 대기. 4 진료: 호출 시 진료실로 입실하여 진료. 5 진료 후 안내: 진료과 접수 창구에서 예약, 수납 등 안내.",
    sourceFile: "첨부4. 산부인과 외래 접수 절차 안내 포맥스 포스터.jpg",
    sourceDate: "파일 수정 2026-07-02(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "radiology-location-3f-01",
    src: "/assets/guides/radiology-location-3f-01.jpg",
    width: 2000,
    height: 1000,
    contentIds: ["c43"],
    description: "영상의학과 검사실 위치 안내(본관 3층): 접수 키오스크와 검사실까지 거리",
    alt: "영상의학과 검사실 위치 안내, 본관 3층. 검사 전 원무팀에서 수납 여부를 확인하신 후 영상의학과 접수 키오스크에서 번호표를 뽑고 안내를 받으시기 바랍니다. 현위치에서 영상의학과 접수 5미터, 일반촬영실 3·4번과 초음파실 20미터, CT실 60미터, MRI실 65미터, 인터벤션실 70미터.",
    sourceFile: "250731 영상의학과 벽부착 사이니지 최종본.png",
    sourceDate: "파일명 2025-07-31 · 파일 수정 2025-07-31",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "dental-route-health-center-01",
    src: "/assets/guides/dental-route-health-center-01.jpg",
    width: 1400,
    height: 1986,
    contentIds: ["c85"],
    description: "치과 스케일링 패스트트랙 뒷면: 동관 건강검진센터에서 치과 외래 가는 길, 접수 방법, 안내 사항",
    alt: "찾아오시는 길. 동관 3층 건강검진센터에서 엘리베이터로 동관 1층으로 이동한 뒤 건물 밖으로 나와 본관 3층 수납창구로 이동하고, 수납 후 에스컬레이터 또는 엘리베이터로 본관 2층 치과 외래로 이동합니다. 접수 방법: 본관 3층 수납 창구 방문(신분증 지참 필수), 치과 외래 접수 시 스케일링 패스트트랙 신청 여부를 말씀해 주세요.",
    sourceFile: "260629 치과 패스트트랙 건강검진센터 (2).jpg",
    sourceDate: "파일명 2026-06-29 · 파일 수정 2026-06-30",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "dental-route-checkup-center-01",
    src: "/assets/guides/dental-route-checkup-center-01.jpg",
    width: 1400,
    height: 1986,
    contentIds: ["c85"],
    description: "치과 스케일링 패스트트랙 뒷면: 서관 종합검진센터에서 치과 외래 가는 길, 접수 방법, 안내 사항",
    alt: "찾아오시는 길. 서관 3층 종합검진센터에서 엘리베이터로 서관 6층으로 이동한 뒤 연결통로로 본관 3층 수납창구로 이동하고, 수납 후 에스컬레이터 또는 엘리베이터로 본관 2층 치과 외래로 이동합니다. 접수 방법: 본관 3층 수납 창구 방문(신분증 지참 필수), 치과 외래 접수 시 스케일링 패스트트랙 신청 여부를 말씀해 주세요.",
    sourceFile: "260629 치과 패스트트랙 종합검진센터 (2).jpg",
    sourceDate: "파일명 2026-06-29 · 파일 수정 2026-06-30",
    approval: "approved",
    lastReviewedAt: "2026-11-10",
  },
  {
    id: "patient-safety-fall-pain-01",
    src: "/assets/guides/patient-safety-fall-pain-01.jpg",
    width: 600,
    height: 849,
    contentIds: ["c29", "c89"],
    description: "환자 안전 안내 포스터: 낙상 예방활동 참여 6가지와 통증 조절 요청 방법",
    alt: "환자 안전 안내. 환자의 안전한 치료 환경을 위해 모두 함께 지켜 주세요. 낙상 예방활동 참여: 침대에서 떨어질 위험이 있으니 난간은 항상 올려두세요. 화장실에서 미끄러지지 않도록 일어설 때 손잡이를 잡으세요. 난간을 넘지 말고 반드시 내린 후 침대에서 내려오세요. 휠체어 사용 전후 반드시 바퀴를 고정하세요. 수액걸이를 밀면서 이동할 때 넘어지지 않도록 조심하세요. 갑자기 일어나면 어지러울 수 있으니 도움을 요청하세요. 낙상이 발생한 경우 즉시 간호사실에 알려주세요. 통증 조절 요청: 아픈 만큼 표현해 주세요. 통증 조절을 요청하고 스스로 할 수 있는 통증 조절 방법을 알아두세요. 1 아픈 부위를 마사지하거나 가볍게 두드린 후 심호흡하기, 2 냉찜질 또는 온찜질을 15분 이내로 하기, 3 베개와 부드러운 쿠션을 이용해 편안한 자세 취하기. 통증은 참지 말고 의료진에게 말씀하세요. 의료진은 통증 정도를 확인하여 원인을 파악하고 적절한 진통제를 처방합니다.",
    caption: "※ 원본 해상도가 낮아 작은 글자가 흐릿할 수 있습니다. 크게 보기를 누르면 확대해서 볼 수 있습니다.",
    sourceFile: "환자 안전 안내_낙상예방, 통증조절.JPG",
    sourceDate: "파일 수정 2026-11-11(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "patient-id-participation-01",
    src: "/assets/guides/patient-id-participation-01.jpg",
    width: 1606,
    height: 580,
    contentIds: ["c77"],
    description: "환자 참여 3가지 배너: 정확한 환자확인, 치료 결정과정 참여, 불만 쉽게 말하기",
    alt: "정확한 환자확인: 환자분의 이름과 등록번호를 알려주세요. 의료진은 정확한 환자 확인을 위해 개방형 질문으로 환자 이름과 환자용 인식표의 등록번호를 확인합니다. 환자용 인식표 예시 이미지. 치료 결정과정 참여: 환자분은 치료 결정과정에 참여하고 계십니다. 1 나의 이름 말하고 건강 정보 알려주기, 2 궁금한 점 질문하기, 3 검사 및 수술 결정 등 동의서 작성하기, 4 통증 조절 요청하기. 불만 쉽게 말하기: 환자분은 불만을 쉽게 말씀하실 수 있습니다. 1 담당 간호사에게 요청하기, 2 고객의 소리함 이용하기, 3 고객상담실 고객서비스센터 이용하기. 고객상담실은 본관 지하1층, 고객서비스센터는 본관 1층. 더 좋은 환자 중심 문화를 함께 만들기 위해 항상 그랬다 하는 한양대학교병원이 되겠습니다.",
    caption: "※ 그림 속 환자용 인식표의 이름·번호·정보는 예시이며 실제 환자 정보가 아닙니다.",
    sourceFile: "정확한 환자확인, 치료과정참여, 불만쉽게말하기.JPG",
    sourceDate: "파일 수정 2026-11-11(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "robot-surgery-leaflet-01",
    src: "/assets/guides/robot-surgery-leaflet-01.jpg",
    width: 1117,
    height: 791,
    contentIds: ["c90"],
    description: "로봇수술 안내 리플릿 안쪽면: 시행 분야, 로봇수술이란, 장점, 수술 전 준비, 수술 당일 진행 과정",
    alt: "로봇수술 안내 리플릿. 한양대학교병원 로봇수술센터는 최첨단 로봇수술로 환자분의 빠른 회복과 안전을 최우선으로 합니다. 로봇수술 시행 분야 및 주요 질환: 비뇨의학과, 산부인과, 이비인후과, 외과, 심장혈관흉부외과. 로봇 수술이란: 다빈치 로봇 수술은 고화질 3D 영상과 360도 자유로운 로봇 팔을 활용해 의료진의 손길처럼 정밀하고 안전한 수술을 가능하게 합니다. 장점: 작은 절개, 조직 손상 최소화, 정밀한 수술, 다양한 진료과 적용. 수술 전 준비: 전일 자정 이후 금식, 화장 매니큐어 제거, 의치 보청기 렌즈 안경 장신구 금지, 소지품 귀중품은 병동에 개인 보관, 속옷 양말 착용 금지, 수술 부위 표시, 수술실 이동 전 화장실 다녀오기. 수술 당일 진행 과정: 1 수술실 이동, 2 수술 전 대기실에서 간호사와 확인, 3 수술 진행, 4 수술 후 회복.",
    sourceFile: "로봇수술 안내 리플릿 (1).JPG",
    sourceDate: "파일 수정 2026-11-11(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "robot-surgery-leaflet-02",
    src: "/assets/guides/robot-surgery-leaflet-02.jpg",
    width: 1120,
    height: 790,
    contentIds: ["c90"],
    description: "로봇수술 안내 리플릿 바깥쪽면: 보호자 안내사항, 수술 후 주의사항, FAQ, 센터 주소와 문의 채널",
    alt: "환자를 위한 안전한 로봇 수술 안내서. 안심하고 받을 수 있는 로봇수술센터. 보호자 안내사항: 1 동행 범위는 감염 예방을 위해 수술실 입구까지만 가능하며 소아 환자는 제외, 2 대기 장소는 수술 중 보호자는 병실에서 대기, 3 진행 안내는 입력된 보호자 전화번호로 문자로 수술 진행 상황 전송. 수술 후 주의사항: 심호흡 기침 권장, 기도 삽관으로 인한 목 통증은 시간이 지나면 소실, 배액관 관리. FAQ: 수술 시간, 흉터, 합병증 가능성. 주소 서울시 성동구 왕십리로 222-1 로봇 수술 센터.",
    sourceFile: "로봇수술 안내 리플릿 (2).JPG",
    sourceDate: "파일 수정 2026-11-11(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "or-guardian-did-01",
    src: "/assets/guides/or-guardian-did-01.jpg",
    width: 1577,
    height: 888,
    contentIds: ["c16"],
    description: "수술실 보호자 전용 DID 화면 예시: 수술환자현황(대기·수술중·회복중·완료·응급)",
    alt: "수술환자현황 화면. 등록번호(일부 가림), 환자명(일부 가림), 집도과별로 대기, 수술중, 회복중, 완료, 응급 상태를 표시합니다. 화면 아래에 ‘대기시간이 길어지고 있습니다. 수술실 상황에 따라 수술 순서가 변경될 수도 있으니 양해바랍니다’ 안내 문구가 표시됩니다.",
    caption: "※ 화면 예시입니다. 그림 속 등록번호·환자명은 실제 환자 정보가 아닙니다.",
    sourceFile: "260513 수술실 보호자 전용 DID UI 변경.png",
    sourceDate: "파일명 2026-05-13 · 파일 수정 2026-05-13",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "hipass-poster-01",
    src: "/assets/guides/hipass-poster-01.jpg",
    width: 1400,
    height: 1979,
    contentIds: ["c91"],
    description: "진료비 하이패스(후불결제) 안내 포스터: 이용절차, 처방전이 필요한 경우, 신청방법",
    alt: "진료비 후불결제 진료비 하이패스. 진료비 하이패스란: 신용카드 등록 후 수납창구 방문 없이 검사와 진료를 할 수 있는 빠르고 편리한 제도. 하이패스 이용절차: 외래 진료, 검사, 귀가, 익일 결제, 알림톡 발송(영수증, 세부내역서, 실손보험청구). 처방전이 필요한 경우: 원외처방은 무인 수납기에서 하이패스 결제 후 처방전 수령, 원내처방은 무인 수납기에서 하이패스 결제 후 병원 내 약국에서 수령. 신청방법: 신청인 신분증과 신용카드를 지참하여 본관 1층 하이패스 전용 창구 및 원무팀 각 수납창구에서 등록. 법인카드 및 해외발급 카드는 신청이 불가합니다. 카드 개인정보는 수납 이외에 어떤 용도로도 사용되지 않습니다. 문의 02-2290-9026.",
    sourceFile: "260415 하이패스 포스터 최종.jpg",
    sourceDate: "파일명 2026-04-15 · 파일 수정 2026-04-15",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "parking-fees-01",
    src: "/assets/guides/parking-fees-01.jpg",
    width: 1200,
    height: 2073,
    contentIds: ["c48"],
    description: "주차 이용 안내(요금): 주차요금, 선불 기간권, 주의사항",
    alt: "주차 이용 안내. 주차요금: 10분 이내 무료, 30분까지 2,000원, 30분 초과 10분당 500원. 선불 기간권: 1일(24시간) 20,000원, 30일(한 달) 120,000원. 주의사항: 필요한 기간권을 미리 구매하는 방식으로 출차시 구매 불가, 선불 구매 없이 출차 시 일반요금으로 산정, 선불 기간권은 할인이 적용된 상태이므로 복지카드 등과 중복할인 불가, 환불은 잔여기간을 1일 4,000원으로 적용하여 송금이체(환불 신청 필요), 무인 주차요금 정산기 이용 안내. 문의 02-2290-8557 (주)아마노코리아.",
    sourceFile: "원무팀 주차 이용 안내문.jpg",
    sourceDate: "파일 수정 2026-07-22(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "parking-free-01",
    src: "/assets/guides/parking-free-01.jpg",
    width: 1200,
    height: 2073,
    contentIds: ["c48"],
    description: "주차 이용 안내(무료주차): 구분별 무료시간과 기준",
    alt: "주차 이용 안내, 무료주차. 외래(초진·재진) 진료 4시간(당일 진료비계산서 또는 영수증 제시). 입원 24시간(입원 당일 입차 기준 24시간, 1대만 1번 이용 가능, 입원기간 중 주차는 유료). 퇴원 당일 24시간까지(퇴원 당일 0시부터 24시까지, 1대만 1번 이용 가능, 퇴원 영수증 제시). 각종 검사 4시간. 수면 다원 검사 12시간. 응급실, 장시간 검사 또는 수술, 당일 안과 수술, 작업환경의학과 진료 또는 검사, 핵의학과 검사, 주사실, 정신건강의학과 진료 또는 검사, 인공신장실 투석 8시간. 진료 예약 및 서류 수정 1시간(주차확인서 발급 받아서 출차시 제시). 2개과 중복 진료 8시간(당일 각 진료과 진료비계산서 또는 영수증 제시). VIP 및 1인용 병실 입원은 입원기간(환자 및 보호자 차량 중 1대, 입원 병동 간호사실 등록 후 사용). 입원 중 중간진료비 정산 1시간(중간 정산 진료비계산서 또는 영수증 제시).",
    sourceFile: "원무팀 주차이용안내.jpg",
    sourceDate: "파일 수정 2026-07-22(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "main-floor-guide-01",
    src: "/assets/guides/main-floor-guide-01.jpg",
    width: 1200,
    height: 2264,
    contentIds: ["c44"],
    description: "본관 층별안내: 1층 평면도와 3층~지하3층 부서 목록, 외부 연결통로",
    alt: "층별안내 Floor Information, 본관 1층 평면도. 안과, 이비인후과(갑상선·두경부 종양센터), 청력·평형기능검사실, 신경생리검사실, 외래접수/수납, 고객서비스센터, 원내약국, 음성언어클리닉, 비강생리검사실, 카페(할리스), 신경과, 소아청소년과, 본관입구, 마을/셔틀버스. 3층: 신경외과, 정형외과, 영상의학과(통합접수, 초음파, X-ray, CT, MRI실, 인터벤션실), 외래채혈실, 통원치료센터, 외래 주사실, 오피스센터, 의무기록발급창구, 안내, 원무팀, 외래 접수·수납, 응급 접수·수납, 검사통합예약실, 강당, 셔틀버스 승차장. 2층: 비뇨의학과, 산부인과, 치과, 영상의학과(유방검사실, 의료영상관리실), 방사선종양학과, 투시조영검사실, 핵의학과, PET-CT센터, 골다공증 검사실, 환자 대기실. 1층: 로비, 고객서비스센터(처음 오신 분), 셔틀버스 승차장, 안내, 카페, 안과, 이비인후과, 갑상선·두경부 종양센터, 신경생리검사실, 신경과, 소아청소년과, 음성언어클리닉, 비강생리검사실. 지하1층: 감염관리실, 고객지원팀(고객상담실), 진료협력팀, 직원식당, 영양팀, 임상 약국, 보건관리상담실, 방송·통신실. 지하2층: 의무기록팀, 의학연구원 행정실, 임상약리학과, 통합관제실. 지하3층: 시설팀.",
    sourceFile: "250922 본관 층별안내 (1).png",
    sourceDate: "파일명 2025-09-22 · 파일 수정 2025-06-04",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    id: "main-floor1-map-01",
    src: "/assets/guides/main-floor1-map-01.jpg",
    width: 1600,
    height: 1132,
    contentIds: ["c45"],
    description: "본관 1층 위치안내도: 외래접수/수납, 고객서비스센터, 원내약국, 진료과, 본관입구, 셔틀버스",
    alt: "본관 1층 위치안내도. 안과, 이비인후과(갑상선·두경부 종양센터), 청력·평형기능검사실, 신경생리검사실, 외래접수/수납, 고객서비스센터, 원내약국(약국 출입구 외래, 병실·야간), 음성언어클리닉, 비강생리검사실, 카페(할리스), 신경과, 소아청소년과, 화장실, 엘리베이터, 계단, 에스컬레이터, 본관입구, 마을/셔틀버스.",
    caption: "※ 이 그림에는 하이패스 전용 창구가 표시되어 있지 않습니다.",
    sourceFile: "본관1층 위치안내도 (1).jpg",
    sourceDate: "파일 수정 2025-05-30(파일명 날짜 없음)",
    approval: "approved",
    lastReviewedAt: "2026-11-11",
  },
  {
    "id": "urology-outpatient-01",
    "src": "/assets/guides/urology-outpatient-01.jpg",
    "width": 1000,
    "height": 1127,
    "contentIds": [
      "c92"
    ],
    "description": "비뇨의학과 외래 안내 4단계(수납·접수·대기·진료)",
    "alt": "비뇨의학과 외래 안내. 1 수납: 본관 1층, 3층 원무팀 수납창구. 2 접수: 접수대에서 접수. 3 대기: 전광판 순서 확인. 4 진료: 호명 시 진료실 입실.",
    "sourceFile": "260707 비뇨의학과 외래 안내.jpg",
    "sourceDate": "파일명 2026-07-07 · 파일 수정 2026-07-07",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "obgyn-outpatient-guide-01",
    "src": "/assets/guides/obgyn-outpatient-guide-01.jpg",
    "width": 1000,
    "height": 1000,
    "contentIds": [
      "c86"
    ],
    "description": "산부인과 외래 안내 5단계(수납·접수·대기·진료 검사·진료 후 안내)",
    "alt": "산부인과 외래 안내. 1 수납: 본관 1층, 3층 원무팀 수납창구. 2 접수: 진료과 접수창구. 3 대기: 진료과 앞 대기실. 4 진료·검사: 호출 시 진료실 입실, 호출 시 초음파 검사실. 5 진료 후 안내: 진료과 접수창구.",
    "sourceFile": "산부인과 외래 안내.jpg",
    "sourceDate": "파일 수정 2026-07-29(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "fee-reduction-01",
    "src": "/assets/guides/fee-reduction-01.jpg",
    "width": 1000,
    "height": 1728,
    "contentIds": [
      "c93"
    ],
    "description": "진료비 감면 안내: 진료할인의뢰서, 감면기간·소급기간, 대상·내용·제한 범위, 등록 방법",
    "alt": "진료비 감면 안내. 진료할인의뢰서: 매년(1년마다) 소속 기관에서 발급받아 원무팀 수납창구에 제출. 감면기간: 제출일로부터 1년. 소급기간: 제출일 기준 최대 7일 이내 소급 적용 가능, 입원환자는 퇴원 수납 완료 시 소급 적용이 불가하므로 반드시 퇴원 전에 진료할인의뢰서 제출. 감면 대상: 본인, 배우자, 본인 및 배우자의 부모, 조부모, 직계존비속(본인 사망 시 감면 대상자의 혜택은 중단). 감면 내용: 종합검진 본인 20%, 직계가족 10%, 진료비(보험) 외래·입원 본인부담금 10%, 장례식장 대실료 30%. 감면 제한 범위: 주사약, 위생재료대, 치과 비보험 일부 항목, 약품비 등, VIP실 및 1인실 병실료, 식대. 감면 등록 방법: 협력기관은 진료협력팀(본관 지하1층), 한양대 동문은 동문회관에서 동문카드 발급(동문카드 내 본인 및 감면 대상자 등록), 그 외 기관은 홈페이지 및 기관 내 행정부서.",
    "sourceFile": "260727 원무팀 진료비 감면 안내.jpg",
    "sourceDate": "파일명 2026-07-27 · 파일 수정 2026-07-27",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "privacy-consent-01",
    "src": "/assets/guides/privacy-consent-01.jpg",
    "width": 1000,
    "height": 1728,
    "contentIds": [
      "c94"
    ],
    "description": "개인정보 수집 및 이용동의서 안내(목적·항목·보유기간·파기·제공·위탁)",
    "alt": "개인정보 수집 및 이용동의서 안내. 한양대학교병원은 개인정보 보호법 및 의료법 등 관련 법령에 따라 개인정보 수집·이용 동의를 받고 있으며 세부 내용은 홈페이지를 참고하시기 바랍니다. 1 개인정보 수집·이용 목적, 2 수집하는 개인정보 항목, 3 개인정보 보유 이용기간, 4 개인정보 파기절차 및 방법, 5 개인정보 제공, 6 수집한 개인정보 위탁.",
    "sourceFile": "원무팀 개인정보이용동의 안내.jpg",
    "sourceDate": "파일 수정 2026-07-22(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "room-fee-table-01",
    "src": "/assets/guides/room-fee-table-01.jpg",
    "width": 1400,
    "height": 2418,
    "contentIds": [
      "c95"
    ],
    "description": "병실 요금 및 진찰료 현황표(2026년 1월 1일 기준): 병실등급별 기준·본인부담금, 간호간병, 신생아실·격리실·중환자실·조혈모세포, 진찰료, 식대",
    "alt": "병실 요금 및 진찰료 현황. 2026년 1월 1일 기준. 일반병실 등급별(VIP실, 1인실, 임종실, 2인실~6인실) 기준병실료와 본인부담금, 간호간병병실, 신생아실, 일반격리실, 음압격리실, 중환자실, 조혈모세포 병실, 진찰료(초진료·재진료), 식대 표. 하단 유의사항 5개.",
    "caption": "※ 요금은 변경될 수 있어 표의 기준일(2026년 1월 1일)을 꼭 확인해 주세요.",
    "sourceFile": "최종_원무팀 DID 병실요금진찰료현황.jpg",
    "sourceDate": "파일 수정 2026-07-22(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "stroke-icu-notice-01",
    "src": "/assets/guides/stroke-icu-notice-01.jpg",
    "width": 1000,
    "height": 1400,
    "contentIds": [
      "c96"
    ],
    "description": "뇌졸중집중치료실 안내: 벽면 인터폰, 보호자 1인 상주, 면회객 방문 제한",
    "alt": "안내. 1 뇌졸중 전문치료실은 환자의 안정과 집중 치료가 필요한 공간입니다. 용무가 있으신 경우 벽면 인터폰을 이용해 주십시오. 2 환자의 집중치료 및 회복을 위해 보호자 1인 상주가 필요합니다. 3 보호자 1인 외 면회객의 방문이 제한됩니다. 원활한 치료 환경 조성을 위해 협조 부탁드립니다.",
    "sourceFile": "본관16층 뇌졸중집중치료실 안내문.jpg",
    "sourceDate": "파일 수정 2026-05-12(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "neg-pressure-ppe-01",
    "src": "/assets/guides/neg-pressure-ppe-01.jpg",
    "width": 1200,
    "height": 902,
    "contentIds": [
      "c97"
    ],
    "description": "음압병동 보호구 착용 안내",
    "alt": "보호구 착용 안내. 면회 시 직원 안내에 따라 보호구를 착용해 주시기 바랍니다. 착용 보호구는 마스크, 가운, 장갑, 페이스쉴드이며 페이스쉴드는 필요 시 착용을 안내해 드립니다. 보호구 착용 후에는 얼굴을 손으로 만지지 마시고, 면회 전·후에는 손 소독을 꼭 시행해 주시기 바랍니다.",
    "sourceFile": "음압병동 보호구 착용 안내.png",
    "sourceDate": "파일 수정 2025-08-07(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "neg-pressure-entry-01",
    "src": "/assets/guides/neg-pressure-entry-01.jpg",
    "width": 1200,
    "height": 902,
    "contentIds": [
      "c97"
    ],
    "description": "음압병동 출입 제한 안내",
    "alt": "출입 제한 안내. 환자의 안정과 감염 예방을 위해 출입이 제한됩니다. 용무가 있으신 경우, 인터폰으로 방문 목적을 말씀해 주세요. 담당 간호사가 확인 후 출입을 도와드리겠습니다.",
    "sourceFile": "음압병동 출입 제한 안내.png",
    "sourceDate": "파일 수정 2025-08-07(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "precheck-kakao-01",
    "src": "/assets/guides/precheck-kakao-01.jpg",
    "width": 1100,
    "height": 1555,
    "contentIds": [
      "c98"
    ],
    "description": "외래환자 사전문진 카카오톡 안내 포스터: 알림톡 발송, 사전문진 작성",
    "alt": "외래환자 사전문진, 카카오톡으로 간편하게. 진료 전 사전문진 완료 시 대기 시간이 단축됩니다. 1 알림톡 발송: 진료 예약일 하루 전 또는 당일 발송. 2 사전문진 작성: ‘사전문진 작성하기’를 눌러 바로 작성. 휴대전화 화면 예시 2개.",
    "caption": "※ 그림 속 이름·등록번호·예약 정보는 예시입니다.",
    "sourceFile": "최종 251031_카카오톡 사전문진 포스터 최종.jpg",
    "sourceDate": "파일 수정 2025-10-31(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "rounds-notice-01",
    "src": "/assets/guides/rounds-notice-01.jpg",
    "width": 751,
    "height": 1625,
    "contentIds": [
      "c99"
    ],
    "description": "카카오톡 알림톡 ‘병동 회진 안내’ 메시지 예시",
    "alt": "병동 회진 안내. OOO교수님 회진이 오전 OO시 OO분부터 시작됩니다. 병동별로 순차적으로 진행되어 병실 도착까지 다소 시간이 소요될 수 있는 점 양해 부탁드립니다. 회진은 의사와 만나 이야기할 기회이며 의료진과의 의사소통은 치료결정과정 참여입니다. 궁금한 사항에 대해서는 언제든지 의료진에게 질문해 주시기 바랍니다.",
    "caption": "※ 교수님 이름과 시간(OOO, OO)은 예시 표기입니다.",
    "sourceFile": "카카오 알림톡 병동 회진 안내.png",
    "sourceDate": "파일 수정 2026-04-14(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "rounds-change-01",
    "src": "/assets/guides/rounds-change-01.jpg",
    "width": 751,
    "height": 1625,
    "contentIds": [
      "c99"
    ],
    "description": "카카오톡 알림톡 ‘병동 회진 변경 안내’ 메시지 예시",
    "alt": "병동 회진 변경 안내. OOO교수님의 응급환자 발생으로 오후 OO시 OO분에 회진 예정입니다. 병동별로 순차적으로 진행되어 병실 도착까지 다소 시간이 소요될 수 있는 점 양해 부탁드립니다. 회진은 의사와 만나 이야기할 기회이며 의료진과의 의사소통은 치료결정과정 참여입니다.",
    "sourceFile": "카카오 알림톡 병동 회진 변경 안내.png",
    "sourceDate": "파일 수정 2026-04-14(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "no-recording-exam-01",
    "src": "/assets/guides/no-recording-exam-01.jpg",
    "width": 1400,
    "height": 503,
    "contentIds": [
      "c100"
    ],
    "description": "검사실 영상 촬영·녹음 금지 및 출입 제한 안내",
    "alt": "검사실 내 영상 촬영 및 녹음은 불가하며, 원활한 진료를 위해 출입을 제한하고 있으니 양해해 주시기 바랍니다. 휴대전화, 카메라, 영상 촬영, 출입 금지 그림.",
    "sourceFile": "검사실 촬영, 녹음 금지 안내.jpg",
    "sourceDate": "파일 수정 2026-10-29(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "no-recording-clinic-01",
    "src": "/assets/guides/no-recording-clinic-01.jpg",
    "width": 1400,
    "height": 347,
    "contentIds": [
      "c100"
    ],
    "description": "진료실 영상 촬영·녹음 금지 및 출입 제한 안내",
    "alt": "진료실 내 영상 촬영 및 녹음은 불가하며, 원활한 진료를 위해 출입을 제한하고 있으니 양해해 주시기 바랍니다. 휴대전화, 카메라, 영상 촬영, 출입 금지 그림.",
    "sourceFile": "진료실 촬영, 녹음 금지 안내.jpg",
    "sourceDate": "파일 수정 2026-10-29(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "elevator-etiquette-01",
    "src": "/assets/guides/elevator-etiquette-01.jpg",
    "width": 2000,
    "height": 658,
    "contentIds": [
      "c101"
    ],
    "description": "엘리베이터 이용 에티켓 4가지 그림(내린 후 탑승, 환자 우선 탑승, 통화·대화 자제, 손위생·마스크)",
    "alt": "엘리베이터 이용 에티켓. 내린 후 탑승: 탑승 기본 매너. 환자 우선 탑승: 휠체어·침대 우선 배려. 통화·대화 자제: 개인정보 보호, 신뢰의 시작. 손위생 필수·마스크 착용: 환자안전과 감염예방을 위한 실천.",
    "sourceFile": "신축 엘리베이터 랩핑 디자인 (1).png",
    "sourceDate": "파일 수정 2025-12-04(파일명 날짜 없음)",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "smoking-booth-01",
    "src": "/assets/guides/smoking-booth-01.jpg",
    "width": 1400,
    "height": 987,
    "contentIds": [
      "c102"
    ],
    "description": "흡연부스 밖 금연 안내: 모든 구역 금연, 지정 흡연부스에서만 흡연, 과태료",
    "alt": "흡연부스 밖 금연 안내. 한양대학교병원 모든 구역은 금연 구역입니다. 흡연은 반드시 지정된 흡연부스에서만 허용됩니다. 보건소의 불시 점검이 예정되어 있으며, 흡연부스 밖 장소에서의 흡연 시 최대 10만 원의 과태료가 부과됩니다. 모든 교직원께서는 흡연부스 밖 흡연 행위에 대한 자발적인 감시 및 제보에 적극 동참해 주시기 바랍니다. 제보처는 동관 1층 수위실.",
    "caption": "※ 이 안내문에는 직원 대상 문구(감시·제보 요청, 제보처)도 함께 적혀 있습니다.",
    "sourceFile": "250512_흡연부스 밖 금연 안내.png",
    "sourceDate": "파일명 2025-05-12 · 파일 수정 2025-05-12",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "cert-self-01",
    "src": "/assets/guides/cert-self-01.jpg",
    "width": 1200,
    "height": 675,
    "contentIds": [
      "c47"
    ],
    "description": "제증명 발급 시 필요한 서류: 본인 신청",
    "alt": "제증명 발급. 본인 신청: 신분증, 주민등록증, 운전면허증, 여권 등.",
    "sourceFile": "251202 윤고딕 (1).jpg",
    "sourceDate": "파일명 2025-12-02 · 파일 수정 2025-12-02",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "cert-agent-01",
    "src": "/assets/guides/cert-agent-01.jpg",
    "width": 1200,
    "height": 675,
    "contentIds": [
      "c47"
    ],
    "description": "제증명 발급 시 필요한 서류: 대리인 신청",
    "alt": "제증명 발급. 대리인 신청: 1 신청인 신분증, 2 대리인 신분증, 3 환자 자필서명 동의서, 위임장.",
    "sourceFile": "251202 윤고딕 (2).jpg",
    "sourceDate": "파일명 2025-12-02 · 파일 수정 2025-12-02",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
  {
    "id": "cert-relative-01",
    "src": "/assets/guides/cert-relative-01.jpg",
    "width": 1200,
    "height": 675,
    "contentIds": [
      "c47"
    ],
    "description": "제증명 발급 시 필요한 서류: 친족 신청",
    "alt": "제증명 발급. 친족 신청: 1 신청인 신분증, 2 대리인 신분증, 3 환자 자필서명 동의서, 위임장.",
    "caption": "※ 친족(가족) 신청에는 이 그림의 서류 외에 가족관계증명서(3개월 이내)도 필요합니다.",
    "sourceFile": "251202 윤고딕 (3).jpg",
    "sourceDate": "파일명 2025-12-02 · 파일 수정 2025-12-02",
    "approval": "approved",
    "lastReviewedAt": "2026-11-11"
  },
];

const BY_ID = new Map(IMAGE_ASSETS.map((a) => [a.id, a]));

export function getImageAsset(id: string): GuideImageAsset | undefined {
  return BY_ID.get(id);
}

export const IMAGE_APPROVAL_LABEL = {
  approved: "승인 완료",
  "internal-use": "내부 사용 · 부서 승인 전",
  pending: "승인 대기",
} as const;

/** 한 콘텐츠에 쓰인 이미지들(상세 구성의 image 블록 + 기존 형식의 images 지정) */
export function imagesOfContent(guide: {
  images?: Array<{ assetId: string }>;
  faq?: Array<{ assetId?: string }>;
  detail?: {
    sections: Array<{ blocks: Array<{ type: string; assetId?: string }> }>;
    faq?: Array<{ assetId?: string }>;
  };
}): GuideImageAsset[] {
  const ids = new Set<string>();
  (guide.images ?? []).forEach((i) => ids.add(i.assetId));
  [...(guide.faq ?? []), ...(guide.detail?.faq ?? [])].forEach((f) => {
    if (f.assetId) ids.add(f.assetId);
  });
  guide.detail?.sections.forEach((s) =>
    s.blocks.forEach((b) => {
      if (b.type === "image" && b.assetId) ids.add(b.assetId);
    }),
  );
  return [...ids].map((id) => BY_ID.get(id)).filter((a): a is GuideImageAsset => Boolean(a));
}
