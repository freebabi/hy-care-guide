import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, isAdminPasswordConfigured, isAuthConfigured, toPublicUser, verifySessionToken } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/** 지금 로그인한 사용자를 돌려줍니다. 서명이 맞지 않거나 만료된 쿠키는 로그인하지 않은 것으로 봅니다. */
export async function GET() {
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  const user = session ? toPublicUser(session) : null; // 사번은 브라우저로 내려보내지 않습니다.
  return NextResponse.json(
    { user, authConfigured: isAuthConfigured(), adminLoginAvailable: isAuthConfigured() && isAdminPasswordConfigured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
