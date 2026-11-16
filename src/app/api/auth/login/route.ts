import { NextResponse } from "next/server";
import {
  ADMIN_DISPLAY_NAME,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  adminConfig,
  checkAdminPassword,
  clearFailures,
  createSessionToken,
  isAdminEmployeeId,
  isAdminPasswordConfigured,
  isAuthConfigured,
  isBlocked,
  isValidEmployeeId,
  normalizeName,
  sessionCookieOptions,
  recordFailure,
  toPublicUser,
  type SessionUser,
} from "@/lib/auth/server";
import { recordEmployeeLogin } from "@/lib/auth/login-log";
import { registerLogin } from "@/lib/server/employees";
import { sameOrigin } from "@/lib/server/api";

export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

const NAME_PATTERN = /^[0-9A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ·.\- ]+$/;

/** 이름·사번 입력을 검사해 정리합니다. */
function parseIdentity(body: { name?: unknown; employeeId?: unknown }): { name: string; employeeId: string } | string {
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const employeeId = typeof body.employeeId === "string" ? body.employeeId.trim() : "";
  if (name.length < 2 || name.length > 20) return "이름은 2자 이상 20자 이하로 입력해 주세요.";
  if (!NAME_PATTERN.test(name)) return "이름에 사용할 수 없는 문자가 있습니다.";
  if (!isValidEmployeeId(employeeId)) return "사번은 숫자 5~10자리로 입력해 주세요.";
  return { name, employeeId };
}

/**
 * 로그인.
 * - mode "employee": 이름 + 사번. 항상 EMPLOYEE 역할입니다. 관리자 사번은 직원 로그인으로 쓸 수 없습니다.
 * - mode "admin": 이름 + 사번 + 관리자 비밀번호가 서버 설정과 모두 일치해야 하며, ADMIN 역할은 서버에 지정된 1명뿐입니다.
 * 브라우저가 보낸 role 값은 읽지 않습니다.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("허용되지 않은 요청입니다.", 403);
  if (!isAuthConfigured()) {
    return fail("서버 설정이 아직 끝나지 않아 로그인할 수 없습니다. 담당자에게 문의해 주세요. (SESSION_SECRET 필요)", 503);
  }

  let body: { mode?: unknown; name?: unknown; employeeId?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("요청 형식이 올바르지 않습니다.", 400);
  }

  const ip = clientIp(request);
  let user: SessionUser;

  if (body.mode === "admin") {
    // 관리자 로그인은 같은 IP 5회, 전체 합산 30회 실패 시 10분간 막습니다.
    if (isBlocked(`adm:${ip}`) || isBlocked("adm:all", 30)) return fail("로그인 시도가 너무 많습니다. 10분 뒤에 다시 시도해 주세요.", 429);
    const cfg = adminConfig();
    if (!cfg || !isAdminPasswordConfigured()) {
      return fail("관리자 로그인이 아직 설정되지 않았습니다. (서버 설정 ADMIN_EMPLOYEE_ID, ADMIN_NAME, ADMIN_PASSWORD 필요)", 503);
    }
    const password = typeof body.password === "string" ? body.password : "";
    const id = typeof body.employeeId === "string" ? body.employeeId.trim() : "";
    const name = typeof body.name === "string" ? body.name : "";
    // 어느 항목이 틀렸는지 알려 주지 않도록 한 가지 문구만 사용합니다.
    const ok = id === cfg.employeeId && normalizeName(name) === normalizeName(cfg.name) && password !== "" && checkAdminPassword(password);
    if (!ok) {
      recordFailure(`adm:${ip}`);
      recordFailure("adm:all");
      return fail("이름, 사번 또는 비밀번호가 올바르지 않습니다.", 401);
    }
    clearFailures(`adm:${ip}`);
    user = { employeeId: cfg.employeeId, name: ADMIN_DISPLAY_NAME, role: "ADMIN" };
  } else if (body.mode === "employee") {
    const parsed = parseIdentity(body);
    if (typeof parsed === "string") return fail(parsed, 400);
    // 직원 로그인 실패는 ‘사번’ 단위로만 셉니다(같은 IP를 쓰는 다른 직원은 영향받지 않음).
    const key = `emp:${parsed.employeeId}`;
    if (isBlocked(key)) return fail("이 사번으로 로그인 시도가 너무 많습니다. 10분 뒤에 다시 시도해 주세요.", 429);
    if (isAdminEmployeeId(parsed.employeeId)) {
      recordFailure(key);
      return fail("이 사번은 관리자 계정입니다. ‘관리자 로그인’을 이용해 주세요.", 403);
    }
    if (normalizeName(parsed.name) === normalizeName(ADMIN_DISPLAY_NAME)) {
      return fail("사용할 수 없는 이름입니다.", 403);
    }
    const registered = await registerLogin(parsed.employeeId, parsed.name);
    if (!registered.ok) {
      recordFailure(key);
      return fail("이 사번에 등록된 이름과 다릅니다. 이름과 사번을 다시 확인해 주세요. 계속 안 되면 서비스전략팀에 문의해 주세요.", 403);
    }
    clearFailures(key);
    user = { employeeId: parsed.employeeId, name: parsed.name, role: "EMPLOYEE" };
  } else {
    return fail("로그인 방식이 올바르지 않습니다.", 400);
  }

  const token = createSessionToken(user);
  if (!token) return fail("세션을 만들지 못했습니다.", 500);

  // 직원 로그인만 ‘이름·시간’을 기록합니다(관리자 확인용). 기록 실패가 로그인을 막지는 않습니다.
  if (user.role === "EMPLOYEE") await recordEmployeeLogin(user.name, user.employeeId);

  const response = NextResponse.json({ user: toPublicUser(user) }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(request, SESSION_MAX_AGE_SECONDS));
  return response;
}
