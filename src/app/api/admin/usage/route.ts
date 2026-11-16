import { NextResponse } from "next/server";
import { jsonOk, requireAdmin } from "@/lib/server/api";
import { collectUsage } from "@/lib/server/usage-stats";
import { isDurable } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** 전체 활용 통계(관리자 전용, 집계 숫자만). */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const requested = Number(new URL(request.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  return jsonOk({ stats: await collectUsage(days), durable: isDurable() });
}
