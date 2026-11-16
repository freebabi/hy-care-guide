import type { GuideContent } from "./types";

/**
 * 코드에 들어 있는 기본 콘텐츠(시드)와 서버에 저장된 변경분을 합칩니다. 브라우저·서버가 같은 규칙을 씁니다.
 *
 * - 시드 콘텐츠(기존 88건)는 코드에 그대로 두고, 관리자가 수정한 것은 같은 contentId의 서버 기록이 시드를 대신합니다.
 * - 시드에 없는 contentId는 관리자가 새로 등록한 콘텐츠이며 시드 뒤에 덧붙입니다.
 * - hiddenIds: 환자에게 보이면 안 되는 시드 콘텐츠(서버가 비게시·검토 대기로 판단한 것)를 목록에서 뺍니다.
 */
export function mergeGuides(seed: GuideContent[], records: GuideContent[], hiddenIds: string[] = []): GuideContent[] {
  const byId = new Map(records.map((r) => [r.contentId, r]));
  const hidden = new Set(hiddenIds);
  const seedIds = new Set(seed.map((g) => g.contentId));
  const merged = seed.filter((g) => !hidden.has(g.contentId)).map((g) => byId.get(g.contentId) ?? g);
  for (const r of records) if (!seedIds.has(r.contentId) && !hidden.has(r.contentId)) merged.push(r);
  return merged;
}

/** 다음 콘텐츠 ID(c01, c02 … 중 가장 큰 번호 + 1). */
export function nextContentId(guides: Array<{ contentId: string }>): string {
  const numbers = guides
    .map((g) => Number(g.contentId.replace(/[^0-9]/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `c${String(max + 1).padStart(2, "0")}`;
}

/** 환자 화면에 보내기 전에 직원용 내부 정보를 뺀 사본(첨부 원본 파일·버전 이력·분류 검토 사유). */
export function scrubForPatient(guide: GuideContent): GuideContent {
  const copy: GuideContent = { ...guide };
  delete copy.sourceFiles;
  delete copy.versionHistory;
  delete copy.classificationReview;
  return copy;
}
