import "server-only";
import { listFiles, readJson } from "./store";
import type { ActivityItem, ActivityType } from "@/lib/care-guide/me-types";

/**
 * 관리자용 전체 활용 통계. 모든 직원의 이력을 합쳐 ‘숫자’로만 보여 주며,
 * 직원 이름·개인별 내역은 결과에 포함하지 않습니다.
 */
export interface UsageStats {
  days: number;
  totals: Record<ActivityType, number>;
  activeUsers: number;
  topContents: Array<{ contentId: string; title: string; views: number }>;
  daily: Array<{ day: string; count: number }>;
}

const KST_DAY = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });

export async function collectUsage(days: number): Promise<UsageStats> {
  const since = Date.now() - days * 86_400_000;
  const totals: Record<ActivityType, number> = { view: 0, download: 0, print: 0, compose: 0, provided: 0, "message-prep": 0 };
  const views = new Map<string, { title: string; views: number }>();
  const daily = new Map<string, number>();
  let activeUsers = 0;

  for (const name of await listFiles("users")) {
    if (!name.endsWith(".json")) continue;
    const doc = await readJson<{ activity?: ActivityItem[] }>(`users/${name}`, {});
    let any = false;
    for (const a of doc.activity ?? []) {
      if (new Date(a.at).getTime() < since) continue;
      any = true;
      totals[a.type] = (totals[a.type] ?? 0) + 1;
      const day = KST_DAY.format(new Date(a.at));
      daily.set(day, (daily.get(day) ?? 0) + 1);
      if (a.type === "view" && a.contentId) {
        const cur = views.get(a.contentId) ?? { title: a.title, views: 0 };
        cur.views += 1;
        views.set(a.contentId, cur);
      }
    }
    if (any) activeUsers += 1;
  }

  return {
    days,
    totals,
    activeUsers,
    topContents: Array.from(views, ([contentId, v]) => ({ contentId, ...v }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    daily: Array.from(daily, ([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day)),
  };
}
