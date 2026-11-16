import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, userIdOf, verifySessionToken, type SessionUser } from "@/lib/auth/server";
import { ApiFail } from "./errors";
import { StoreCorruptError } from "./store";
import { claimLegacyAdminData } from "./user-data";

export const NO_STORE = { "Cache-Control": "no-store" } as const;

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: NO_STORE });
}

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

/**
 * 저장소 계층에서 올라온 오류를 사용자에게 보여 줄 응답으로 바꿉니다.
 * - ApiFail: 검증·권한·충돌 등 메시지를 그대로 보여 줘도 되는 오류
 * - StoreCorruptError: 저장 파일이 깨졌음 → 아무것도 바꾸지 않았음을 알립니다(파일 경로는 노출하지 않음)
 * - 그 밖: 내부 오류(자세한 내용은 서버 로그에만 남김)
 */
export function storeErrorResponse(e: unknown) {
  if (e instanceof ApiFail) return jsonError(e.message, e.status);
  if (e instanceof StoreCorruptError) {
    console.error("[store] 저장 데이터 오류:", e.message);
    return jsonError("저장된 데이터를 읽을 수 없어 요청을 처리하지 않았습니다. 기존 데이터는 그대로 보존되어 있으니 관리자에게 문의하세요.", 503);
  }
  console.error("[store] 처리 오류:", e);
  return jsonError("저장하지 못했습니다. 잠시 후 다시 시도해 주세요. 계속되면 관리자에게 문의하세요.", 500);
}

export interface AuthedUser {
  user: SessionUser;
  uid: string;
}

/**
 * 서버가 확인한 로그인 사용자만 통과시킵니다. 사용자 ID는 서버가 세션에서 정하며,
 * 화면(브라우저)이 보낸 사용자 ID·역할 값은 어디서도 읽지 않습니다.
 */
export async function requireUser(): Promise<AuthedUser | NextResponse> {
  const user = verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) return jsonError("로그인이 필요합니다.", 401);
  const uid = userIdOf(user);
  if (user.role === "ADMIN") await claimLegacyAdminData(uid);
  return { user, uid };
}

export async function requireAdmin(): Promise<AuthedUser | NextResponse> {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  if (auth.user.role !== "ADMIN") return jsonError("관리자만 할 수 있습니다.", 403);
  return auth;
}

/** 값을 바꾸는 요청(POST·PUT·DELETE)이 같은 사이트에서 온 것인지 확인합니다(다른 사이트에서의 위조 요청 방지). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // 같은 출처의 단순 요청은 Origin이 없을 수 있음. 쿠키는 SameSite=Lax로도 보호됨.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** 요청 본문(JSON)을 읽습니다. 기본 2MB, 첨부·백업처럼 큰 요청만 호출하는 쪽에서 한도를 늘립니다. 한도를 넘으면 null. */
export async function readBody(request: Request, maxBytes = 2 * 1024 * 1024): Promise<Record<string, unknown> | null> {
  try {
    const declared = Number(request.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maxBytes) return null;
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const body: unknown = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const CONTENT_ID = /^[A-Za-z0-9_-]{1,40}$/;

export function cleanContentId(v: unknown): string | null {
  return typeof v === "string" && CONTENT_ID.test(v) ? v : null;
}

export function cleanText(v: unknown, max: number): string {
  return typeof v === "string" ? v.normalize("NFC").trim().slice(0, max) : "";
}

export { looksLikePersonalData } from "./pii";
