import { imagesOfContent } from "./image-assets";
import { journeyLabel, normalizeJourneyId, topicLabel } from "./taxonomy";
import type { DetailBlock, GuideCategory, GuideContent, JourneyStageId, TopicId } from "./types";

export interface GuideFilters {
  query: string;
  journeys: JourneyStageId[];
  topics: TopicId[];
  category: GuideCategory | "전체";
  department: string;
}

export const EMPTY_FILTERS: GuideFilters = {
  query: "",
  journeys: [],
  topics: [],
  category: "전체",
  department: "전체",
};

function norm(s: string): string {
  return s.normalize("NFC").toLowerCase();
}

function compact(s: string): string {
  return norm(s).replace(/\s+/g, "");
}

function blockText(block: DetailBlock): string[] {
  switch (block.type) {
    case "paragraph":
    case "callout":
      return [block.text];
    case "list":
      return block.items;
    case "steps":
      return block.items.flatMap((s) => [s.title, s.text ?? ""]);
    case "image":
      return [];
    case "review-needed":
      return [block.topic];
  }
}

/** 환자 화면에 표시되는 본문 전체(섹션·FAQ·위치·문의)를 하나의 검색용 문자열로 합칩니다. */
export function guideBodyText(g: GuideContent): string {
  const detail = g.detail;
  // 상세 구성이 있으면 화면에 보이는 상세 내용만 검색합니다. (보존만 하고 숨긴 기존 원문은 검색하지 않음)
  const legacy = detail
    ? []
    : [
        g.importantNotice,
        g.before,
        g.during,
        g.after,
        ...(g.faq ?? []).flatMap((f) => [f.question, f.answer]),
      ];
  return [
    ...legacy,
    detail?.notice,
    ...(detail?.sections ?? []).flatMap((s) => [s.title, ...s.blocks.flatMap(blockText)]),
    ...(detail?.faq ?? []).flatMap((f) => [f.question, f.answer]),
    g.location,
    g.contact,
    ...imagesOfContent(g).flatMap((img) => [img.description, img.alt]),
  ]
    .filter(Boolean)
    .join("\n");
}

export function guideJourneyIds(g: GuideContent): JourneyStageId[] {
  return (g.journeyStages ?? [])
    .map((id) => normalizeJourneyId(id))
    .filter((id): id is JourneyStageId => Boolean(id));
}

export function guideTopicIds(g: GuideContent): TopicId[] {
  return g.topicCategories ?? [];
}

type FieldKey = "title" | "keywords" | "sub" | "summary" | "meta" | "body";
/** n: 소문자 정규화, c: 공백 제거본 (매 입력마다 다시 계산하지 않도록 캐시) */
type SearchFields = Record<FieldKey, { n: string; c: string }>;

const fieldCache = new WeakMap<GuideContent, SearchFields>();

function fieldsOf(g: GuideContent): SearchFields {
  const cached = fieldCache.get(g);
  if (cached) return cached;
  const raw: Record<FieldKey, string> = {
    title: g.title,
    keywords: (g.keywords ?? []).join(" "),
    sub: `${g.subcategory} ${g.categoryLabelOverride ?? ""}`,
    summary: g.summary,
    meta: [
      g.category,
      ...g.departments,
      ...guideJourneyIds(g).map(journeyLabel),
      ...guideTopicIds(g).map(topicLabel),
    ].join(" "),
    body: guideBodyText(g),
  };
  const fields = Object.fromEntries(
    (Object.keys(raw) as FieldKey[]).map((k) => [k, { n: norm(raw[k]), c: compact(raw[k]) }]),
  ) as SearchFields;
  fieldCache.set(g, fields);
  return fields;
}

const WEIGHTS: Array<[FieldKey, number]> = [
  ["title", 10],
  ["keywords", 8],
  ["sub", 5],
  ["summary", 4],
  ["meta", 3],
  ["body", 1],
];

function tokenize(query: string): string[] {
  return norm(query).split(/\s+/).filter(Boolean);
}

/**
 * 검색어의 모든 단어(공백 구분)가 제목·키워드·소분류·요약·분류명·본문 중 어딘가에 있어야 일치합니다.
 * "본관3층"처럼 띄어쓰기가 달라도 찾을 수 있도록 공백을 뺀 비교도 함께 합니다.
 * 일치하면 필드별 가중치 합(관련도)을, 일치하지 않으면 0을 반환합니다.
 */
export function searchScore(g: GuideContent, query: string): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 1;
  const f = fieldsOf(g);
  let total = 0;
  for (const token of tokens) {
    const tokenCompact = token.replace(/\s+/g, "");
    let best = 0;
    for (const [key, weight] of WEIGHTS) {
      const hay = f[key];
      if (hay.n.includes(token) || hay.c.includes(tokenCompact)) {
        best = Math.max(best, weight);
      }
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

export function filterGuides(guides: GuideContent[], filters: GuideFilters): GuideContent[] {
  const hasQuery = filters.query.trim() !== "";
  const matched = guides
    .filter((g) => g.status === "게시")
    .filter((g) => filters.category === "전체" || g.category === filters.category)
    .filter((g) => filters.department === "전체" || (g.departments as string[]).includes(filters.department))
    .filter((g) => filters.journeys.length === 0 || guideJourneyIds(g).some((id) => filters.journeys.includes(id)))
    .filter((g) => filters.topics.length === 0 || guideTopicIds(g).some((id) => filters.topics.includes(id)))
    .map((g) => ({ g, score: hasQuery ? searchScore(g, filters.query) : 1 }))
    .filter((x) => x.score > 0);

  if (hasQuery) {
    // 관련도 높은 순, 같으면 원래 순서 유지
    return matched
      .map((x, i) => ({ ...x, i }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((x) => x.g);
  }
  return matched.map((x) => x.g);
}

/** 단계·주제 카드에 표시할 "연결된 게시 콘텐츠 수" (다른 필터와 무관한 전체 기준) */
export function countByJourney(guides: GuideContent[]): Map<JourneyStageId, number> {
  const counts = new Map<JourneyStageId, number>();
  for (const g of guides) {
    if (g.status !== "게시") continue;
    for (const id of new Set(guideJourneyIds(g))) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export function countByTopic(guides: GuideContent[]): Map<TopicId, number> {
  const counts = new Map<TopicId, number>();
  for (const g of guides) {
    if (g.status !== "게시") continue;
    for (const id of new Set(guideTopicIds(g))) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}
