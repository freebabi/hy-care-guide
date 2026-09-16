import { GUIDES } from "./guides-data";
import { readStorage, writeStorage } from "./storage";
import type { GuideContent } from "./types";

const STORAGE_KEY = "hycg.guides.v1";

/** CMS에서 추가/수정한 콘텐츠까지 반영된 최신 콘텐츠 목록을 반환합니다. */
export function loadGuides(): GuideContent[] {
  return readStorage<GuideContent[]>(STORAGE_KEY, GUIDES);
}

export function saveGuides(guides: GuideContent[]): void {
  writeStorage(STORAGE_KEY, guides);
}

export function upsertGuide(guide: GuideContent): GuideContent[] {
  const current = loadGuides();
  const index = current.findIndex((g) => g.contentId === guide.contentId);
  const next =
    index === -1
      ? [...current, guide]
      : current.map((g, i) => (i === index ? guide : g));
  saveGuides(next);
  return next;
}

export function toggleGuideStatus(contentId: string): GuideContent[] {
  const current = loadGuides();
  const next = current.map((g) =>
    g.contentId === contentId
      ? { ...g, status: (g.status === "게시" ? "비게시" : "게시") as GuideContent["status"] }
      : g,
  );
  saveGuides(next);
  return next;
}

export function nextContentId(guides: GuideContent[]): string {
  const numbers = guides
    .map((g) => Number(g.contentId.replace(/[^0-9]/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `g${String(max + 1).padStart(2, "0")}`;
}
