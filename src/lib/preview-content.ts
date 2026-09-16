import type { EduMaterial } from "./care-guide-data";

/* ------------------------------- 카드뉴스 ------------------------------- */

export interface CardNewsSlide {
  heading: string;
  body: string;
}

export function getCardNewsSlides(material: EduMaterial): CardNewsSlide[] {
  if (material.id === "m01") {
    return [
      { heading: "고혈압, 제대로 알고 관리하기", body: "원인과 증상을 먼저 이해하면 관리가 한결 쉬워져요." },
      { heading: "올바른 혈압 측정법", body: "아침·저녁 각 1분, 같은 시간에 측정하는 습관을 들여보세요." },
      { heading: "저염식 식단 팁", body: "고혈압 환자를 위한 나트륨 줄이는 식단 구성 방법을 안내합니다." },
      { heading: "위험 증상과 병원 방문 타이밍", body: "이런 증상이 나타나면 지체하지 말고 병원에 방문하세요." },
    ];
  }

  return [
    { heading: material.title, body: material.summary },
    {
      heading: `${material.category} 핵심 포인트`,
      body: `관련 키워드: ${material.tags.join(" ")}`,
    },
    {
      heading: "꼭 기억하세요",
      body: "정확한 진단과 치료는 반드시 담당 의료진과 상담하시기 바랍니다.",
    },
  ];
}

/* ---------------------------- 주의사항 리플렛 ---------------------------- */

export type LeafletCalloutType = "info" | "warning" | "tip";

export interface LeafletCallout {
  type: LeafletCalloutType;
  text: string;
}

export interface LeafletTab {
  id: string;
  label: string;
  callouts: LeafletCallout[];
}

export function getLeafletTabs(material: EduMaterial): LeafletTab[] {
  if (material.id === "m02") {
    return [
      {
        id: "time",
        label: "1. 복용 시간",
        callouts: [
          { type: "info", text: "매일 같은 시간에 복용하는 것이 혈압 관리에 가장 중요합니다. 아침 식후 복용을 권장합니다." },
          { type: "tip", text: "복용을 잊었다면 생각난 즉시 복용하되, 다음 복용 시간과 가까우면 한 번만 복용하세요." },
        ],
      },
      {
        id: "drug",
        label: "2. 주의 약물",
        callouts: [
          { type: "warning", text: "일부 감기약, 소염진통제와 함께 복용하면 혈압 조절에 영향을 줄 수 있어 복용 전 의료진과 상담이 필요합니다." },
        ],
      },
      {
        id: "side-effect",
        label: "3. 부작용 대처법",
        callouts: [
          { type: "warning", text: "어지러움, 마른기침 등이 나타날 수 있습니다." },
          { type: "tip", text: "증상이 지속되면 임의로 중단하지 말고 담당 의료진에게 알려주세요." },
        ],
      },
    ];
  }

  return [
    {
      id: "info",
      label: "1. 핵심 안내",
      callouts: [{ type: "info", text: material.summary }],
    },
    {
      id: "caution",
      label: "2. 주의사항",
      callouts: [
        {
          type: "warning",
          text: `${material.category} 관련 안내이므로, 세부 진행 방법은 담당 의료진의 지시를 우선 따르세요.`,
        },
      ],
    },
    {
      id: "action",
      label: "3. 대처 방법",
      callouts: [
        { type: "tip", text: "이상 증상이 느껴지면 자가 판단하지 말고 병원(또는 담당 부서)으로 바로 연락하세요." },
      ],
    },
  ];
}

/* ------------------------------ 동영상 가이드 ------------------------------ */

export interface VideoChapter {
  label: string;
  timeSeconds: number;
}

export interface VideoMeta {
  durationSeconds: number;
  chapters: VideoChapter[];
}

export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getVideoMeta(material: EduMaterial): VideoMeta {
  if (material.id === "m03") {
    return {
      durationSeconds: 3 * 60 + 45,
      chapters: [
        { label: "인트로", timeSeconds: 0 },
        { label: "운동 수칙", timeSeconds: 30 },
        { label: "식단 관리", timeSeconds: 105 },
      ],
    };
  }

  const chapterLabels: string[] = [];
  if (material.noteTypes.includes("운동 치료")) chapterLabels.push("운동 방법");
  if (material.noteTypes.includes("퇴원 후 식이요법")) chapterLabels.push("식이 관리");
  if (material.noteTypes.includes("복약 가이드")) chapterLabels.push("복약 안내");
  if (chapterLabels.length === 0) chapterLabels.push("핵심 내용");

  const durationSeconds = 150 + chapterLabels.length * 45;
  const step = Math.floor(durationSeconds / (chapterLabels.length + 1));

  return {
    durationSeconds,
    chapters: [
      { label: "인트로", timeSeconds: 0 },
      ...chapterLabels.map((label, index) => ({
        label,
        timeSeconds: step * (index + 1),
      })),
    ],
  };
}
