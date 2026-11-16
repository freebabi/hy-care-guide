import type { GuideContent } from "./types";

/**
 * 2026-11-11 추가 반영분(c92~c107): reference-materials 폴더에 새로 들어온 안내자료를 확인해 만든 콘텐츠입니다.
 * 분류(여정 단계·주제·키워드·출처)를 각 콘텐츠에 직접 지정했습니다. 모두 부서 승인 전(작성 중) 자료입니다.
 */
export const EXTRA_GUIDES: GuideContent[] = [
  {
    "category": "기타",
    "departments": [
      "비뇨의학과",
      "원무팀"
    ],
    "patientStages": [],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c92",
    "slug": "urology-outpatient-reception",
    "title": "비뇨의학과 외래 접수 안내",
    "subcategory": "비뇨의학과 외래 접수",
    "summary": "비뇨의학과 외래 진료를 받을 때 수납, 접수, 대기, 진료 4단계 순서를 안내합니다.",
    "detail": {
      "notice": "대기 중에는 전광판에서 내 순서를 확인해 주세요.",
      "sections": [
        {
          "id": "flow",
          "title": "수납부터 진료까지",
          "icon": "route",
          "blocks": [
            {
              "type": "image",
              "assetId": "urology-outpatient-01"
            },
            {
              "type": "steps",
              "items": [
                {
                  "title": "수납 [본관 1층, 3층 원무팀 수납창구]"
                },
                {
                  "title": "접수 [접수대]",
                  "text": "접수대에서 접수합니다."
                },
                {
                  "title": "대기",
                  "text": "전광판에서 순서를 확인합니다."
                },
                {
                  "title": "진료",
                  "text": "호명 시 진료실에 입실합니다."
                }
              ]
            },
            {
              "type": "paragraph",
              "text": "접수대는 본관 2층 비뇨의학과 외래에 있습니다."
            }
          ]
        }
      ]
    },
    "location": "수납 본관 1층·3층 원무팀 수납창구",
    "relatedContentIds": [
      "c86",
      "c45",
      "c44",
      "c98"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "arrival-registration",
      "outpatient"
    ],
    "topicCategories": [
      "outpatient-registration"
    ],
    "keywords": [
      "비뇨의학과",
      "외래 접수",
      "수납",
      "접수대",
      "전광판",
      "호명"
    ],
    "reviewerDepartment": "비뇨의학과"
  },
  {
    "category": "기타",
    "departments": [
      "원무팀"
    ],
    "patientStages": [],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c93",
    "slug": "medical-fee-reduction",
    "title": "진료비 감면 안내",
    "subcategory": "원무팀 · 진료비 감면",
    "summary": "진료할인의뢰서 제출 방법, 감면 기간·소급 기간, 감면 대상과 내용, 감면되지 않는 항목, 등록 방법을 안내합니다.",
    "detail": {
      "notice": "입원환자는 퇴원 수납을 마치면 소급 적용이 되지 않으니, 반드시 퇴원 전에 진료할인의뢰서를 제출해 주세요.",
      "sections": [
        {
          "id": "how",
          "title": "진료할인의뢰서 제출",
          "icon": "clipboard",
          "blocks": [
            {
              "type": "paragraph",
              "text": "매년(1년마다) 소속 기관에서 진료할인의뢰서를 발급받아 원무팀 수납창구에 제출해 주시기 바랍니다."
            },
            {
              "type": "image",
              "assetId": "fee-reduction-01"
            }
          ]
        },
        {
          "id": "period",
          "title": "감면 기간과 소급 기간",
          "icon": "info",
          "blocks": [
            {
              "type": "list",
              "items": [
                "감면기간: 제출일로부터 1년",
                "소급기간: 제출일 기준 최대 7일 이내 소급 적용 가능"
              ]
            },
            {
              "type": "callout",
              "tone": "warning",
              "text": "입원환자는 퇴원 수납 완료 시 소급 적용이 불가합니다. 반드시 퇴원 전에 진료할인의뢰서를 제출하시기 바랍니다."
            }
          ]
        },
        {
          "id": "who",
          "title": "감면 대상",
          "icon": "users",
          "blocks": [
            {
              "type": "list",
              "items": [
                "본인, 배우자, 본인 및 배우자의 부모, 조부모, 직계존비속"
              ]
            },
            {
              "type": "paragraph",
              "text": "※ 본인 사망 시 감면 대상자의 혜택은 중단됩니다."
            }
          ]
        },
        {
          "id": "what",
          "title": "감면 내용",
          "icon": "clipboard",
          "blocks": [
            {
              "type": "list",
              "items": [
                "종합검진: 본인 20%, 직계가족 10%",
                "진료비(보험): 외래, 입원 본인부담금 10%",
                "장례식장: 대실료 30%"
              ]
            }
          ]
        },
        {
          "id": "limit",
          "title": "감면 제한 범위",
          "icon": "alert",
          "blocks": [
            {
              "type": "list",
              "items": [
                "주사약, 위생재료대, 치과 비보험 일부 항목, 약품비 등",
                "VIP실 및 1인실 병실료, 식대"
              ]
            }
          ]
        },
        {
          "id": "register",
          "title": "감면 등록 방법",
          "icon": "id",
          "blocks": [
            {
              "type": "list",
              "items": [
                "협력기관: 진료협력팀(본관 지하1층)",
                "한양대 동문: 동문회관에서 동문카드 발급(동문카드 내 본인 및 감면 대상자 등록)",
                "그 외 기관: 홈페이지 및 기관 내 행정부서"
              ]
            },
            {
              "type": "paragraph",
              "text": "감면 적용을 위해서는 반드시 사전에 감면 대상 확인 및 등록이 필요합니다. 입원 중이라면 반드시 퇴원 전에 진료할인의뢰서를 제출하시기 바랍니다."
            },
            {
              "type": "review-needed",
              "topic": "소속 기관별 발급 방법과 감면율 적용 세부 기준"
            }
          ]
        }
      ]
    },
    "location": "원무팀 수납창구 · 진료협력팀(본관 지하1층)",
    "relatedContentIds": [
      "c45",
      "c49",
      "c71",
      "c35"
    ],
    "estimatedReadMinutes": 2,
    "journeyStages": [
      "outpatient",
      "inpatient",
      "discharge"
    ],
    "topicCategories": [
      "cost-insurance"
    ],
    "keywords": [
      "진료비 감면",
      "진료할인의뢰서",
      "감면",
      "소급",
      "동문카드",
      "협력기관",
      "장례식장",
      "종합검진 할인"
    ],
    "ownerDepartment": "원무팀",
    "reviewerDepartment": "원무팀"
  },
  {
    "category": "기타",
    "departments": [
      "원무팀"
    ],
    "patientStages": [],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c94",
    "slug": "privacy-consent",
    "title": "개인정보 수집·이용 동의 안내",
    "subcategory": "개인정보 수집 및 이용동의서",
    "summary": "진료 접수 때 받는 개인정보 수집·이용 동의의 목적, 수집 항목, 보유 기간, 파기 방법, 제공·위탁 기준을 안내합니다.",
    "detail": {
      "notice": "한양대학교병원은 「개인정보 보호법」 및 의료법 등 관련 법령에 따라 개인정보 수집·이용 동의를 받고 있습니다.",
      "sections": [
        {
          "id": "intro",
          "title": "안내문",
          "icon": "info",
          "blocks": [
            {
              "type": "paragraph",
              "text": "세부 내용은 홈페이지(www.hyumc.com)를 참고하시기 바랍니다."
            },
            {
              "type": "image",
              "assetId": "privacy-consent-01"
            }
          ]
        },
        {
          "id": "purpose",
          "title": "1. 개인정보 수집·이용 목적",
          "icon": "clipboard",
          "blocks": [
            {
              "type": "list",
              "items": [
                "진료 접수, 예약, 예약 조회, 진료 회신, 건강정보 발송 등에 따른 본인 확인 절차에 사용",
                "고지사항 전달, 불만처리 등을 위한 원활한 의사소통 경로의 확보, 새로운 서비스 및 행사정보 안내",
                "진료 입원 예정 및 검사 일정 안내(Mobile)",
                "진료비 계산서 내역서, 제증명서 발급, 건강검진 관련 서류 발송",
                "진단 및 치료를 위한 진료서비스와 진료비 청구, 수납, 환급 등의 원무 서비스 제공",
                "교육·연구 및 진료서비스 활용",
                "온라인 수탁검사 및 임상시험심사 기초자료 활용"
              ]
            }
          ]
        },
        {
          "id": "items",
          "title": "2. 수집하는 개인정보 항목",
          "icon": "id",
          "blocks": [
            {
              "type": "paragraph",
              "text": "진료신청서 기재 정보(이름, 주민등록번호, 진찰권 번호, 주소, 연락처, 이메일 주소)"
            }
          ]
        },
        {
          "id": "period",
          "title": "3. 보유 이용기간",
          "icon": "clipboard",
          "blocks": [
            {
              "type": "paragraph",
              "text": "수집된 정보는 관련법령에 준하여 보유합니다."
            }
          ]
        },
        {
          "id": "destroy",
          "title": "4. 파기 절차와 방법",
          "icon": "shield",
          "blocks": [
            {
              "type": "paragraph",
              "text": "개인정보 수집·이용 목적이 달성된 후에는 관련 법령 및 내부 방침에 따라 안전하게 파기합니다."
            },
            {
              "type": "list",
              "items": [
                "파기 절차: 이용 목적이 달성된 개인정보는 별도 DB(종이 문서의 경우 별도 보관소)로 이동하여 일정 기간 보관 후 파기합니다. 보관된 개인정보는 법령에 따른 경우를 제외하고 다른 목적으로 이용하지 않습니다.",
                "파기 방법: 전자 파일 형태의 개인정보는 복구할 수 없는 방법으로 삭제하고, 종이 문서는 분쇄 또는 용해하여 폐기합니다."
              ]
            }
          ]
        },
        {
          "id": "provide",
          "title": "5. 개인정보 제공",
          "icon": "users",
          "blocks": [
            {
              "type": "paragraph",
              "text": "고객님의 개인정보는 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외적으로 제공될 수 있습니다."
            },
            {
              "type": "list",
              "items": [
                "고객이 사전에 동의한 경우(관련 서류 제출 필요, 자세한 내용은 한양대학교병원 홈페이지 참고)",
                "법령에 따른 절차에 따라 수사기관 등의 요청이 있는 경우"
              ]
            }
          ]
        },
        {
          "id": "outsource",
          "title": "6. 수집한 개인정보 위탁",
          "icon": "shield",
          "blocks": [
            {
              "type": "paragraph",
              "text": "고객님의 개인정보는 동의 없이 외부 업체에 위탁하지 않습니다. 향후 개인정보 위탁이 필요한 경우, 위탁 대상 및 업무 내용을 안내하고 필요한 경우 사전 동의를 받겠습니다."
            }
          ]
        }
      ]
    },
    "location": "접수·수납 창구",
    "relatedContentIds": [
      "c45",
      "c47"
    ],
    "estimatedReadMinutes": 3,
    "journeyStages": [
      "arrival-registration",
      "outpatient"
    ],
    "topicCategories": [
      "etc"
    ],
    "keywords": [
      "개인정보",
      "개인정보 동의",
      "이용동의서",
      "수집 항목",
      "파기",
      "위탁",
      "진료신청서"
    ],
    "ownerDepartment": "원무팀",
    "reviewerDepartment": "원무팀"
  },
  {
    "category": "기타",
    "departments": [
      "원무팀"
    ],
    "patientStages": [
      "admitted"
    ],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c95",
    "slug": "room-fee-and-consultation-fee",
    "title": "병실 요금 및 진찰료 안내",
    "subcategory": "병실 요금 · 진찰료 · 식대",
    "summary": "병실 등급별 병실료와 본인부담금, 진찰료, 식대를 정리한 현황표(2026년 1월 1일 기준)와 유의사항을 안내합니다.",
    "detail": {
      "notice": "요금은 보험자격, 나이, 질환 및 입원일수, 분기별 인력수준, 고시 변경에 따라 변동될 수 있습니다.",
      "sections": [
        {
          "id": "table",
          "title": "현황표 (2026년 1월 1일 기준)",
          "icon": "clipboard",
          "blocks": [
            {
              "type": "paragraph",
              "text": "병실 등급별 병실료·본인부담금, 간호간병병실, 신생아실, 격리실, 중환자실, 조혈모세포 병실, 진찰료, 식대가 한 표에 정리되어 있습니다. 숫자가 많아 표 그림 그대로 보여 드립니다."
            },
            {
              "type": "image",
              "assetId": "room-fee-table-01"
            }
          ]
        },
        {
          "id": "notes",
          "title": "유의사항",
          "icon": "alert",
          "blocks": [
            {
              "type": "list",
              "items": [
                "입원료는 보험자격, 나이(소아과 연령에 따른 가산), 질환 및 입원일수, 분기별 인력수준, 고시 변경에 따라 변동 가능성 있음.",
                "간호인력확보수준에 따른 일반병실 입원료와 중환자실 입원료는 환자수에 따라 분기별 변동 가능성 있음.",
                "간호간병병실 및 간병료 분기별 배치인력에 따라 변동 가능성 있음.",
                "중환자실 전문전담의 및 입원환자 전담의료 별도 산정.",
                "의료질평가지원금, 감염예방관리료, 입원환자 안전관리료, 야간간호료 등 별도 산정."
              ]
            }
          ]
        }
      ]
    },
    "location": "원무팀(입원 수속·퇴원 수속 창구)",
    "relatedContentIds": [
      "c71",
      "c49",
      "c34",
      "c93"
    ],
    "estimatedReadMinutes": 2,
    "journeyStages": [
      "inpatient"
    ],
    "topicCategories": [
      "cost-insurance"
    ],
    "keywords": [
      "병실료",
      "병실 요금",
      "진찰료",
      "초진료",
      "재진료",
      "식대",
      "본인부담금",
      "1인실",
      "2인실",
      "중환자실",
      "간호간병"
    ],
    "ownerDepartment": "원무팀",
    "reviewerDepartment": "원무팀"
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [
      "admitted"
    ],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "guardian",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c96",
    "slug": "stroke-intensive-care-unit",
    "title": "뇌졸중집중치료실 이용 안내",
    "subcategory": "본관 16층 뇌졸중집중치료실",
    "summary": "뇌졸중집중치료실에서 용무가 있을 때 이용하는 인터폰, 보호자 1인 상주, 면회 제한을 안내합니다.",
    "detail": {
      "notice": "용무가 있으신 경우 벽면 인터폰을 이용해 주십시오.",
      "sections": [
        {
          "id": "guide",
          "title": "안내사항",
          "icon": "info",
          "blocks": [
            {
              "type": "image",
              "assetId": "stroke-icu-notice-01"
            },
            {
              "type": "steps",
              "items": [
                {
                  "title": "벽면 인터폰 이용",
                  "text": "뇌졸중 전문치료실은 환자의 안정과 집중 치료가 필요한 공간입니다. 용무가 있으신 경우 벽면 인터폰을 이용해 주십시오."
                },
                {
                  "title": "보호자 1인 상주",
                  "text": "환자의 집중치료 및 회복을 위해 보호자 1인 상주가 필요합니다."
                },
                {
                  "title": "면회 제한",
                  "text": "보호자 1인 외 면회객의 방문이 제한됩니다(별도 면회 시간은 없습니다). 원활한 치료 환경 조성을 위해 협조 부탁드립니다."
                }
              ]
            }
          ]
        }
      ]
    },
    "location": "본관 16층",
    "relatedContentIds": [
      "c46",
      "c80",
      "c26",
      "c81"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "inpatient"
    ],
    "topicCategories": [
      "inpatient-life",
      "guardian"
    ],
    "keywords": [
      "뇌졸중",
      "뇌졸중집중치료실",
      "집중치료실",
      "보호자 상주",
      "면회 제한",
      "인터폰",
      "16층"
    ],
    "reviewerDepartment": "간호국"
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [
      "admitted"
    ],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 2,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-12",
    "audience": "guardian",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      },
      {
        "title": "환자 안내 관련 병원 내부 기준 (격리·마스크)",
        "kind": "department-material",
        "note": "병원 내부 기준을 환자용으로 쉽게 줄여 쓴 것입니다. 문서 번호와 내부 명칭은 공개하지 않으며, 관련 부서 검토 기준에 따릅니다. 웹 안내문은 부서 승인 전입니다."
      }
    ],
    "contentId": "c97",
    "slug": "negative-pressure-ward-entry",
    "title": "음압병동 출입·보호구 착용 안내",
    "subcategory": "음압병동 출입 · 면회",
    "summary": "본관 18층 음압격리병동의 출입 제한과 인터폰 이용 방법, 면회 시 착용하는 보호구와 손 소독, 보호구를 입고 벗는 순서를 안내합니다. 면회 시간은 ‘보호자 안내’를 확인해 주세요.",
    "detail": {
      "notice": "본관 18층 음압격리병동에 적용되는 안내입니다. 환자의 안정과 감염 예방을 위해 출입이 제한되며, 용무가 있으시면 인터폰으로 방문 목적을 말씀해 주세요.",
      "sections": [
        {
          "id": "entry",
          "title": "출입 제한 안내",
          "icon": "shield",
          "blocks": [
            {
              "type": "image",
              "assetId": "neg-pressure-entry-01"
            },
            {
              "type": "list",
              "items": [
                "환자의 안정과 감염 예방을 위해 출입이 제한됩니다.",
                "용무가 있으신 경우, 인터폰으로 방문 목적을 말씀해 주세요.",
                "담당 간호사가 확인 후 출입을 도와드리겠습니다."
              ]
            }
          ]
        },
        {
          "id": "ppe",
          "title": "보호구 착용 안내",
          "icon": "mask",
          "blocks": [
            {
              "type": "image",
              "assetId": "neg-pressure-ppe-01"
            },
            {
              "type": "list",
              "items": [
                "면회 시 직원 안내에 따라 보호구를 착용해 주시기 바랍니다.",
                "착용 보호구: 마스크, 가운, 장갑, (페이스쉴드) — 페이스쉴드는 필요 시 착용을 안내해 드립니다.",
                "보호구 착용 후에는 얼굴을 손으로 만지지 마시고, 면회 전·후에는 손 소독을 꼭 시행해 주시기 바랍니다."
              ]
            },
            {
              "type": "paragraph",
              "text": "격리 종류에 따라 보호구가 달라질 수 있어, 직원이 알려 주는 순서를 먼저 따라 주세요. 아래는 병원 내부 기준의 순서입니다."
            }
          ]
        },
        {
          "id": "order",
          "title": "보호구 착용·벗는 순서",
          "icon": "route",
          "blocks": [
            {
              "type": "steps",
              "items": [
                { "title": "손 소독", "text": "병실에 들어가기 전에 손을 소독합니다." },
                { "title": "마스크", "text": "공기로 옮는 병은 N95 마스크를 씁니다." },
                { "title": "가운", "text": "마스크 다음에 가운을 입습니다." },
                { "title": "장갑", "text": "가운 다음에 장갑을 낍니다. 그 뒤 병실에 들어갑니다." }
              ]
            },
            {
              "type": "steps",
              "items": [
                { "title": "장갑 벗기", "text": "장갑 겉면을 만지지 않도록, 한 손으로 반대쪽 장갑을 집어 벗겨 손에 쥡니다. 장갑을 벗은 손으로 남은 장갑의 안쪽을 잡아 벗기면서 함께 말아 버립니다." },
                { "title": "가운 벗기", "text": "목 끈을 먼저 풀고 허리 끈을 푼 다음, 가운의 안쪽이 겉으로 오게 뒤집으며 벗습니다." },
                { "title": "손 소독", "text": "가운을 벗은 뒤 손을 소독하고 병실에서 나옵니다." },
                { "title": "마스크 벗기", "text": "병실 밖에서 마스크 앞면을 만지지 않고 끈을 잡고 벗어 버립니다." },
                { "title": "손 소독", "text": "마지막으로 한 번 더 손을 소독합니다." }
              ]
            }
          ]
        }
      ]
    },
    "relatedContentIds": [
      "c81",
      "c80",
      "c33",
      "c78",
      "c46"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "inpatient"
    ],
    "topicCategories": [
      "infection-prevention",
      "guardian"
    ],
    "keywords": [
      "음압병동",
      "음압격리",
      "보호구",
      "마스크",
      "가운",
      "장갑",
      "페이스쉴드",
      "출입 제한",
      "손 소독",
      "면회"
    ],
    "reviewerDepartment": "감염관리실"
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 2,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-13",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c98",
    "slug": "kakao-pre-consultation",
    "title": "외래 사전문진 안내(카카오톡)",
    "subcategory": "외래 사전문진",
    "summary": "진료 전에 카카오톡 알림톡으로 사전문진을 작성하면 대기 시간이 줄어듭니다. 알림톡 발송 시점과 작성 방법을 안내합니다.",
    "detail": {
      "notice": "진료 전 사전문진을 완료하면 대기 시간이 단축됩니다.",
      "sections": [
        {
          "id": "flow",
          "title": "사전문진 작성 방법",
          "icon": "route",
          "blocks": [
            {
              "type": "image",
              "assetId": "precheck-kakao-01"
            },
            {
              "type": "steps",
              "items": [
                {
                  "title": "알림톡 발송",
                  "text": "진료 예약일 하루 전 또는 당일에 카카오톡 알림톡이 발송됩니다."
                },
                {
                  "title": "사전문진 작성",
                  "text": "‘사전문진 작성하기’를 눌러 바로 작성합니다."
                }
              ]
            },
            {
              "type": "paragraph",
              "text": "알림톡에는 ‘한양대학교병원 사전문진 서비스 안내’ 문구와 함께 “정확한 상태를 확인하기 위한 설문으로 진료 전까지 작성을 완료하여 주시기 바랍니다.”라는 안내와 ‘진료 전 문진’ 버튼이 있습니다."
            },
            {
              "type": "paragraph",
              "text": "사전문진은 외래 예약 환자에게 알림톡이 발송됩니다. 알림톡은 진료 접수 때 등록한 휴대전화 번호로 받습니다."
            },
            {
              "type": "paragraph",
              "text": "작성하지 못했어도 진료는 그대로 받을 수 있으며, 진료실에서 직접 문진합니다."
            },
            {
              "type": "paragraph",
              "text": "사전문진은 거의 모든 진료과에서 시행합니다."
            }
          ]
        }
      ]
    },
    "contact": "대표전화 02-2290-8114",
    "relatedContentIds": [
      "c45",
      "c86",
      "c92",
      "c99"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "pre-visit",
      "arrival-registration",
      "outpatient"
    ],
    "topicCategories": [
      "outpatient-registration"
    ],
    "keywords": [
      "사전문진",
      "카카오톡",
      "알림톡",
      "문진",
      "대기 시간",
      "진료 전 문진"
    ],
    "reviewerDepartment": "원무팀"
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [
      "admitted"
    ],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c99",
    "slug": "ward-rounds-notice",
    "title": "병동 회진 안내(카카오톡 알림)",
    "subcategory": "병동 회진 안내",
    "summary": "병동 회진 시작과 변경을 카카오톡 알림으로 안내하는 내용, 그리고 회진이 ‘의사와 만나 이야기할 기회’라는 점을 안내합니다.",
    "detail": {
      "notice": "회진은 ‘의사와 만나 이야기할 기회’입니다. 궁금한 사항은 언제든지 의료진에게 질문해 주세요.",
      "sections": [
        {
          "id": "start",
          "title": "회진 안내 알림",
          "icon": "bell",
          "blocks": [
            {
              "type": "paragraph",
              "text": "회진 시작 시간을 카카오톡 알림톡으로 안내하는 메시지입니다. 병동별로 순차적으로 진행되어 병실 도착까지 다소 시간이 소요될 수 있습니다."
            },
            {
              "type": "image",
              "assetId": "rounds-notice-01"
            },
            {
              "type": "list",
              "items": [
                "OOO교수님 회진이 오전 OO시 OO분부터 시작됩니다.",
                "병동별로 순차적으로 진행되어 병실 도착까지 다소 시간이 소요될 수 있는 점 양해 부탁드립니다."
              ]
            }
          ]
        },
        {
          "id": "change",
          "title": "회진 변경 안내 알림",
          "icon": "alert",
          "blocks": [
            {
              "type": "paragraph",
              "text": "응급환자가 생기는 등 회진 시간이 바뀔 때에도 알림톡으로 안내합니다."
            },
            {
              "type": "image",
              "assetId": "rounds-change-01"
            },
            {
              "type": "list",
              "items": [
                "OOO교수님의 응급환자 발생으로 오후 OO시 OO분에 회진 예정입니다."
              ]
            }
          ]
        },
        {
          "id": "meaning",
          "title": "회진의 의미",
          "icon": "question",
          "blocks": [
            {
              "type": "list",
              "items": [
                "회진은 ‘의사와 만나 이야기할 기회’이며 의료진과의 의사소통은 ‘치료결정과정 참여’입니다.",
                "궁금한 사항에 대해서는 언제든지 의료진에게 질문해 주시기 바랍니다."
              ]
            },
            {
              "type": "paragraph",
              "text": "알림톡은 입원 시 등록한 환자 본인의 휴대전화 번호로, 회진 시작 전에 발송됩니다."
            }
          ]
        }
      ]
    },
    "contact": "대표전화 02-2290-8114",
    "relatedContentIds": [
      "c26",
      "c87",
      "c88",
      "c98"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "inpatient"
    ],
    "topicCategories": [
      "inpatient-life"
    ],
    "keywords": [
      "회진",
      "병동 회진",
      "회진 변경",
      "알림톡",
      "교수님 회진",
      "의사 면담",
      "응급환자"
    ],
    "reviewerDepartment": "간호국"
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c100",
    "slug": "no-recording-in-exam-and-clinic",
    "title": "검사실·진료실 촬영·녹음 금지 안내",
    "subcategory": "촬영·녹음 금지",
    "summary": "검사실과 진료실에서는 영상 촬영과 녹음을 할 수 없고, 원활한 진료를 위해 출입을 제한하고 있다는 안내입니다.",
    "detail": {
      "notice": "검사실·진료실 안에서는 영상 촬영 및 녹음이 불가합니다.",
      "sections": [
        {
          "id": "exam",
          "title": "검사실",
          "icon": "alert",
          "blocks": [
            {
              "type": "image",
              "assetId": "no-recording-exam-01"
            },
            {
              "type": "paragraph",
              "text": "검사실 내 영상 촬영 및 녹음은 불가하며, 원활한 진료를 위해 출입을 제한하고 있으니 양해해 주시기 바랍니다."
            }
          ]
        },
        {
          "id": "clinic",
          "title": "진료실",
          "icon": "alert",
          "blocks": [
            {
              "type": "image",
              "assetId": "no-recording-clinic-01"
            },
            {
              "type": "paragraph",
              "text": "진료실 내 영상 촬영 및 녹음은 불가하며, 원활한 진료를 위해 출입을 제한하고 있으니 양해해 주시기 바랍니다."
            }
          ]
        }
      ]
    },
    "relatedContentIds": [
      "c43",
      "c44",
      "c45",
      "c46"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "examination",
      "outpatient"
    ],
    "topicCategories": [
      "etc"
    ],
    "keywords": [
      "촬영 금지",
      "녹음 금지",
      "영상 촬영",
      "검사실",
      "진료실",
      "출입 제한",
      "휴대전화"
    ]
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c101",
    "slug": "elevator-etiquette",
    "title": "엘리베이터 이용 에티켓",
    "subcategory": "엘리베이터 이용",
    "summary": "병원 엘리베이터에서 지켜야 할 4가지 — 내린 후 탑승, 환자 우선 탑승, 통화·대화 자제, 손위생·마스크 착용을 안내합니다.",
    "detail": {
      "notice": "휠체어와 침대를 이용하는 환자가 먼저 탈 수 있도록 배려해 주세요.",
      "sections": [
        {
          "id": "four",
          "title": "엘리베이터에서 지켜 주세요",
          "icon": "users",
          "blocks": [
            {
              "type": "image",
              "assetId": "elevator-etiquette-01"
            },
            {
              "type": "steps",
              "items": [
                {
                  "title": "내린 후 탑승",
                  "text": "탑승 기본 매너입니다."
                },
                {
                  "title": "환자 우선 탑승",
                  "text": "휠체어·침대를 우선 배려해 주세요."
                },
                {
                  "title": "통화·대화 자제",
                  "text": "개인정보 보호, 신뢰의 시작입니다."
                },
                {
                  "title": "손위생 필수·마스크 착용",
                  "text": "환자안전과 감염예방을 위한 실천입니다."
                }
              ]
            }
          ]
        }
      ]
    },
    "relatedContentIds": [
      "c33",
      "c78",
      "c79",
      "c27"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "hospital-facilities"
    ],
    "topicCategories": [
      "facilities-location",
      "infection-prevention"
    ],
    "keywords": [
      "엘리베이터",
      "에티켓",
      "내린 후 탑승",
      "환자 우선",
      "휠체어",
      "침대",
      "통화 자제",
      "마스크",
      "손위생"
    ]
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 1,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-11",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "병원 제작 안내자료 (서비스전략팀 제공 이미지)",
        "kind": "department-material",
        "note": "승인·배포 기록이 없어 부서 확인 전까지 공식 안내가 아닙니다. 자료별 원본 파일명은 ‘안내 이미지 관리’ 목록에 있습니다."
      }
    ],
    "contentId": "c102",
    "slug": "no-smoking-outside-booth",
    "title": "금연 구역 안내(흡연부스 밖 금연)",
    "subcategory": "금연 구역",
    "summary": "병원 모든 구역이 금연 구역이며, 흡연은 지정된 흡연부스에서만 가능하다는 안내와 과태료 기준입니다.",
    "detail": {
      "notice": "한양대학교병원 모든 구역은 금연 구역입니다.",
      "sections": [
        {
          "id": "rule",
          "title": "금연 안내",
          "icon": "alert",
          "blocks": [
            {
              "type": "image",
              "assetId": "smoking-booth-01"
            },
            {
              "type": "list",
              "items": [
                "한양대학교병원 모든 구역은 금연 구역입니다.",
                "흡연은 반드시 지정된 흡연부스에서만 허용됩니다.",
                "보건소의 불시 점검이 예정되어 있으며, 흡연부스 밖 장소에서의 흡연 시 최대 10만 원의 과태료가 부과됩니다."
              ]
            }
          ]
        }
      ]
    },
    "relatedContentIds": [
      "c26",
      "c27",
      "c81"
    ],
    "estimatedReadMinutes": 1,
    "journeyStages": [
      "hospital-facilities"
    ],
    "topicCategories": [
      "facilities-location"
    ],
    "keywords": [
      "금연",
      "흡연",
      "흡연부스",
      "과태료",
      "금연 구역",
      "담배"
    ]
  },
  {
    "category": "기타",
    "departments": [
      "전과공통"
    ],
    "patientStages": [
      "after-discharge"
    ],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 2,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-13",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "맞춤형 비만치료센터 ‘비만 바로 알기’ 리플릿을 바탕으로 쉬운 말로 다시 쓴 안내",
        "kind": "department-material",
        "note": "리플릿에 적힌 출처: 임상영양관리지침서 제4판(대한영양사협회), 외식영양성분자료집·식품영양성분자료집(식품의약품안전처). 리플릿 문장을 그대로 옮기지 않고 같은 사실을 쉬운 말로 다시 정리했습니다. 승인·배포 기록 없음."
      }
    ],
    "contentId": "c106",
    "slug": "obesity-basics",
    "title": "비만 바로 알기(맞춤형 비만치료센터)",
    "subcategory": "비만 · 체중 관리",
    "summary": "체질량지수(BMI) 구하는 법, 목표 체중과 섭취 열량 정하기, 식사·간식·외식·생활습관·운동 요령을 맞춤형 비만치료센터 리플릿을 바탕으로 쉬운 말로 다시 정리했습니다.",
    "detail": {
      "notice": "궁금하신 내용은 맞춤형 비만치료센터로 문의하세요. 개인의 상태에 따라 다를 수 있으니 의료진과 상담해 주세요.",
      "sections": [
        {
          "id": "bmi",
          "title": "내 몸무게는 지금 어떤가요?",
          "icon": "clipboard",
          "blocks": [
            {
              "type": "paragraph",
              "text": "체질량지수(BMI)는 몸무게와 키로 비만 정도를 알아보는 값입니다. 몸무게(kg)를 키(m)의 제곱으로 나누어 구합니다."
            },
            {
              "type": "list",
              "items": [
                "과체중: 23.0 이상 25.0 미만",
                "1단계 비만: 25.0 이상 30.0 미만",
                "2단계 비만: 30.0 이상 35.0 미만",
                "3단계 비만: 35.0 이상"
              ]
            },
            {
              "type": "paragraph",
              "text": "계산 예: 키 160cm, 몸무게 80kg이면 80 ÷ (1.6 × 1.6) = 31.25로 2단계 비만입니다."
            }
          ]
        },
        {
          "id": "goal",
          "title": "목표는 어떻게 정하나요?",
          "icon": "target",
          "blocks": [
            {
              "type": "list",
              "items": [
                "과체중 이상이면 목표 몸무게를 정상 체중으로 잡습니다.",
                "정상 체중 구하는 법: 남자는 키(m) × 키(m) × 22, 여자는 키(m) × 키(m) × 21입니다. 이 값의 90~110%도 정상 체중으로 봅니다.",
                "정상 체중과 차이가 크면 중간 목표를 세우세요. 현재 몸무게의 5~10%만 줄여도 혈당, 혈압, 콜레스테롤이 좋아집니다.",
                "하루 500~1,000kcal를 줄이면 1주에 0.5~1.0kg씩 천천히 뺄 수 있습니다."
              ]
            },
            {
              "type": "paragraph",
              "text": "너무 많이 줄이면 근육이 빠지고, 몸무게가 금방 되돌아오는 ‘요요현상’이 생기기 쉽습니다."
            }
          ]
        },
        {
          "id": "meal",
          "title": "식사와 간식은 어떻게 하나요?",
          "icon": "pill",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "매끼 밥을 1/3공기 덜 먹기",
                  "text": "밥 1/3공기가 약 100kcal라서, 하루 세 끼면 300kcal를 줄일 수 있습니다."
                },
                {
                  "title": "채소는 충분히",
                  "text": "채소는 열량이 낮고 배가 부릅니다. 한 끼에 2접시 이상 드세요. 김치와 일부 드레싱은 짜니 조심하세요."
                },
                {
                  "title": "단백질은 기름기 적게",
                  "text": "좋은 예: 생선, 두부, 콩, 달걀, 저지방 유제품, 무가당 두유, 닭가슴살, 살코기. 줄일 것: 갈비, 삼겹살, 햄, 소시지, 베이컨, 튀긴 치킨."
                },
                {
                  "title": "간식은 과일·채소·저지방 유제품",
                  "text": "과자, 빵, 떡, 아이스크림 대신 과일, 저지방 우유, 채소 스틱을 드세요."
                }
              ]
            }
          ]
        },
        {
          "id": "eatout",
          "title": "외식할 때는 어떻게 하나요?",
          "icon": "route",
          "blocks": [
            {
              "type": "list",
              "items": [
                "외식 횟수를 줄이고, 기름지지 않은 음식을 고릅니다.",
                "세트메뉴보다 단품을 고르고, 덤으로 나온 음식은 많이 먹지 않습니다.",
                "뷔페는 먹을 양을 미리 정하고, 한 번에 많이 담지 않습니다.",
                "외식 전에 일부러 굶지 않습니다.",
                "양이 많으면 미리 덜어 두고, 채소부터 천천히 먹습니다.",
                "후식은 먹지 않고 주요리 위주로 먹습니다."
              ]
            }
          ]
        },
        {
          "id": "habit",
          "title": "생활습관은 어떻게 바꾸나요?",
          "icon": "home",
          "blocks": [
            {
              "type": "list",
              "items": [
                "장은 식사 후에 보고, 살 목록을 미리 적어 갑니다.",
                "라면, 과자, 아이스크림 같은 간편식품은 사지 않습니다.",
                "식탁, TV 앞, 책상 위처럼 눈에 띄는 곳에 음식을 두지 않습니다.",
                "권하는 음식은 정중히 거절하고, 아깝다고 남은 음식을 먹지 않습니다.",
                "불안하거나 우울할 때는 먹는 것으로 풀지 않습니다.",
                "책, TV, 휴대전화를 보며 먹지 않고, 먹을 만큼만 덜어 먹습니다."
              ]
            }
          ]
        },
        {
          "id": "exercise",
          "title": "운동은 어떻게 하나요?",
          "icon": "walk",
          "blocks": [
            {
              "type": "paragraph",
              "text": "운동은 체지방을 줄이고 근육을 늘려 체중 감량을 도와줍니다. 식사 조절만 할 때보다 효과적입니다."
            },
            {
              "type": "list",
              "items": [
                "유산소 운동(걷기, 달리기, 자전거, 수영, 등산 등): 중간 강도로 하루 30~60분, 주 5회 이상 합니다. 중간 강도는 노래는 못 부르지만 옆 사람과 대화는 할 수 있을 정도입니다.",
                "한 번에 하기 어려우면 하루 20분씩 2~3번, 또는 10분씩 여러 번 나누어 해도 좋습니다.",
                "근력 운동(스쿼트, 아령 등): 한 번에 8~12회씩 2~4세트, 주 2~3회 합니다."
              ]
            }
          ]
        }
      ]
    },
    "contact": "대표전화 02-2290-8114 (맞춤형 비만치료센터 문의)",
    "relatedContentIds": [
      "c107"
    ],
    "estimatedReadMinutes": 5,
    "journeyStages": [
      "outpatient",
      "post-discharge"
    ],
    "topicCategories": [
      "etc"
    ],
    "keywords": [
      "비만",
      "체질량지수",
      "BMI",
      "다이어트",
      "체중 감량",
      "목표 체중",
      "칼로리",
      "식단",
      "외식",
      "운동",
      "요요",
      "맞춤형 비만치료센터"
    ],
    "reviewerDepartment": "맞춤형 비만치료센터"
  },
  {
    "category": "기타",
    "departments": [
      "심장혈관흉부외과"
    ],
    "patientStages": [
      "after-discharge"
    ],
    "status": "게시",
    "needsClinicalReview": true,
    "version": 2,
    "createdAt": "2026-11-11",
    "lastUpdated": "2026-11-13",
    "audience": "both",
    "sourceDocuments": [
      {
        "title": "심장혈관흉부외과 ‘내 혈압 바로 알기’ 리플릿(2025-07-24)을 바탕으로 쉬운 말로 다시 쓴 안내",
        "kind": "department-material",
        "note": "리플릿에 적힌 출처: 대한고혈압학회, 2024. 리플릿 문장을 그대로 옮기지 않고 같은 사실을 쉬운 말로 다시 정리했습니다. 승인·배포 기록 없음."
      }
    ],
    "contentId": "c107",
    "slug": "blood-pressure-basics",
    "title": "내 혈압 바로 알기(고혈압 관리)",
    "subcategory": "고혈압 · 가정혈압 측정",
    "summary": "고혈압 기준과 혈압 분류, 혈압 측정이 중요한 이유, 건강 생활 수칙, 가정에서 혈압을 재고 기록하는 방법을 심장혈관흉부외과 리플릿을 바탕으로 쉬운 말로 다시 정리했습니다.",
    "detail": {
      "notice": "궁금하신 내용은 심장혈관흉부외과로 문의하세요. 가정혈압 기록은 의사와 상담할 때 중요한 자료가 됩니다.",
      "sections": [
        {
          "id": "what",
          "title": "고혈압이란?",
          "icon": "heart",
          "blocks": [
            {
              "type": "list",
              "items": [
                "집에서 잰 혈압(가정혈압)의 고혈압 진단 기준: 135/85mmHg",
                "병원(진료실)에서 잰 혈압의 고혈압 진단 기준: 140/90mmHg (대한고혈압학회 2024 기준)"
              ]
            },
            {
              "type": "paragraph",
              "text": "혈압이 높은 상태가 이어지면 이런 곳이 위험해집니다."
            },
            {
              "type": "list",
              "items": [
                "뇌: 뇌졸중(뇌출혈·뇌경색), 혈관성 치매 위험이 커집니다.",
                "심장: 심근경색, 협심증, 심부전이 생길 가능성이 커집니다.",
                "콩팥: 콩팥 기능이 떨어질 수 있습니다(고혈압성 신증).",
                "눈: 망막이 상해 시력이 떨어질 수 있습니다(고혈압성 망막병증)."
              ]
            }
          ]
        },
        {
          "id": "class",
          "title": "혈압은 어떻게 나누나요?",
          "icon": "clipboard",
          "blocks": [
            {
              "type": "list",
              "items": [
                "정상혈압: 120/80mmHg 이하. 꾸준한 건강관리로 유지합니다.",
                "고혈압 전단계: 130~139/80~89mmHg. 건강한 생활 수칙으로 예방합니다.",
                "고혈압 1기: 140~159/90~99mmHg. 생활 수칙을 지키고, 약을 처방받았다면 복용합니다.",
                "고혈압 2기: 160/100mmHg 이상. 생활 수칙을 지키고 고혈압 약을 복용합니다."
              ]
            }
          ]
        },
        {
          "id": "why",
          "title": "혈압을 왜 재야 하나요?",
          "icon": "target",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "합병증 예방",
                  "text": "정확하게 재면 심장·뇌혈관 질환을 미리 막고 대비하는 데 도움이 됩니다."
                },
                {
                  "title": "치료 효과 확인",
                  "text": "약을 먹는 치료가 잘 듣는지 확인할 수 있고, 치료에 직접 참여하는 데 도움이 됩니다."
                },
                {
                  "title": "스스로 관리",
                  "text": "집에서 직접 재면서 생활습관을 바꾼 효과도 확인할 수 있습니다."
                }
              ]
            }
          ]
        },
        {
          "id": "life",
          "title": "혈압 관리를 위한 생활 수칙",
          "icon": "care",
          "blocks": [
            {
              "type": "list",
              "items": [
                "정상 체중을 유지합니다.",
                "기름과 소금은 줄이고 섬유질이 많은 음식을 먹습니다.",
                "스트레스를 줄이고 마음을 편안하게 합니다.",
                "매일 30분 이상 유산소 운동을 합니다.",
                "담배는 끊고 술은 줄입니다.",
                "집에서 혈압을 재고 정기적으로 진료받습니다."
              ]
            }
          ]
        },
        {
          "id": "measure",
          "title": "집에서 혈압 재는 방법",
          "icon": "route",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "편안한 곳에서 준비하기",
                  "text": "아침에는 약 먹기 전, 식사 전에 한 번, 저녁에는 잠자리에 들기 전에 한 번 잽니다. 화장실을 다녀온 뒤 5분 쉬고 재세요. 재기 전 30분 안에는 운동, 흡연, 카페인을 피하고, 샤워나 목욕 전에 잽니다."
                },
                {
                  "title": "바른 자세로 재기",
                  "text": "등을 기대지 않거나 다리를 꼬고 앉으면 혈압이 2~10mmHg 더 높게 나올 수 있습니다. 재는 동안 움직이거나 말하면 10~15mmHg 더 높게 나오거나 기계에 오류가 생길 수 있으니 가만히 계세요."
                },
                {
                  "title": "기록하기",
                  "text": "한 번 재고 1분 쉰 뒤 한 번 더 재어 기록합니다. 혈압 수첩에 날짜, 시간, 수축기(최고)혈압, 이완기(최저)혈압, 맥박수를 적습니다."
                },
                {
                  "title": "의사와 상담하기",
                  "text": "병원에 올 때 혈압 수첩을 가져와 의사와 상담하세요. 치료 효과와 혈압 조절 상태를 확인하고 치료 목표를 정하는 데 중요한 자료가 됩니다."
                }
              ]
            }
          ]
        }
      ]
    },
    "contact": "대표전화 02-2290-8114 (심장혈관흉부외과 문의)",
    "relatedContentIds": [
      "c106",
      "c11"
    ],
    "estimatedReadMinutes": 4,
    "journeyStages": [
      "outpatient",
      "post-discharge"
    ],
    "topicCategories": [
      "etc"
    ],
    "keywords": [
      "고혈압",
      "혈압",
      "가정혈압",
      "혈압 측정",
      "혈압 수첩",
      "혈압 분류",
      "생활 수칙",
      "저염식"
    ],
    "reviewerDepartment": "심장혈관흉부외과"
  }
];
