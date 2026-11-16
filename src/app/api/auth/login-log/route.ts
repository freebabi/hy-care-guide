import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/server";
import { isLogDurable, readLoginLog } from "@/lib/auth/login-log";

export const dynamic = "force-dynamic";

/** 직원 로그인 기록 조회 — 서버가 확인한 관리자(ADMIN) 세션만 볼 수 있습니다. */
export async function GET() {
  const user = verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  const headers = { "Cache-Control": "no-store" };
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401, headers });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "관리자만 볼 수 있습니다." }, { status: 403, headers });
  const entries = await readLoginLog();
  return NextResponse.json({ entries, durable: isLogDurable() }, { headers });
}
