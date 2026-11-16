import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * HY CARE GUIDE 서버 쪽 인증 도구입니다.
 *
 * - 역할은 ADMIN(관리자) / EMPLOYEE(일반 직원) 두 가지뿐입니다.
 * - 모든 사용자는 **사번(employeeId)** 으로 구별합니다. 이름은 표시용이며 데이터를 식별하는 데 쓰지 않습니다.
 * - 관리자는 환경변수로 지정한 1명(ADMIN_EMPLOYEE_ID + ADMIN_NAME)뿐이며, 관리자 비밀번호(ADMIN_PASSWORD)까지 서버에서 확인합니다.
 *   (관리자 사번·이름은 소스코드에 적지 않고 서버 설정에만 둡니다.)
 * - 세션은 서버만 아는 SESSION_SECRET으로 서명한 쿠키(HttpOnly)이며, 화면(브라우저)이 보낸 역할·사번 값은 신뢰하지 않습니다.
 * - 직원의 사번·이름은 아직 병원 인사 명부와 대조하지 못합니다(첫 로그인 때 등록, 이후 같은 이름만 허용). 운영 전 명부/SSO 연동 필요.
 */
/** 화면에 보이는 관리자 표시 이름 */
export const ADMIN_DISPLAY_NAME = "서비스전략팀";
export const SESSION_COOKIE = "hycg_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12시간

/**
 * 이 요청이 실제로 HTTPS로 들어왔는지. 앞단 프록시가 있으면 X-Forwarded-Proto(또는 Forwarded: proto=)를 우선합니다.
 * (사내 플랫폼처럼 HTTP로 서비스되는 곳에서는 Secure 쿠키를 브라우저가 저장하지 않아 로그인이 되지 않습니다.)
 */
export function isSecureRequest(request: Request): boolean {
  const xfp = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (xfp) return xfp === "https";
  const fwd = request.headers.get("forwarded")?.match(/proto=("?)([a-z]+)\1/i)?.[2]?.toLowerCase();
  if (fwd) return fwd === "https";
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 로그인 쿠키 공통 옵션. HttpOnly·SameSite=Lax는 항상 유지하고, Secure는 HTTPS 요청일 때만 붙입니다.
 * Path는 앱의 하위 경로(APP_BASE_PATH)로 좁혀, 같은 주소의 다른 앱에는 쿠키가 전달되지 않게 합니다.
 */
export function sessionCookieOptions(request: Request, maxAge: number) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  // 주의: `basePath || "/"` 로 쓰면 빌드 때 "/__APP_BASE_PATH__" 상수로 접혀, 루트 실행(값 없음)에서 Path 가 비어 버립니다.
  // (비면 브라우저가 /api/auth 를 기본 경로로 삼아 로그인이 유지되지 않음) 접히지 않도록 실행 중에 고릅니다.
  const path = [basePath, "/"].find((p) => p.length > 0) ?? "/";
  return { httpOnly: true, sameSite: "lax" as const, secure: isSecureRequest(request), path, maxAge };
}

export type Role = "ADMIN" | "EMPLOYEE";

export interface SessionUser {
  /** 사번 — 사용자 고유 ID의 근거. 화면으로 내려보내지 않습니다. */
  employeeId: string;
  /** 표시 이름 (관리자는 ADMIN_DISPLAY_NAME) */
  name: string;
  role: Role;
}

/** 브라우저로 내려보내는 값(사번 제외) */
export interface PublicUser {
  name: string;
  role: Role;
}

export function toPublicUser(user: SessionUser): PublicUser {
  return { name: user.name, role: user.role };
}

interface SessionPayload extends SessionUser {
  exp: number; // 만료 시각(초)
}

/** 사번 형식: 숫자 5~10자리. (병원 사번 규칙이 확정되면 이 한 곳만 고치면 됩니다.) */
const EMPLOYEE_ID = /^\d{5,10}$/;

export function isValidEmployeeId(v: unknown): v is string {
  return typeof v === "string" && EMPLOYEE_ID.test(v);
}

function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

export function isAuthConfigured(): boolean {
  return secret() !== null;
}

/** 이름 비교용: 공백 제거 + 소문자 */
export function normalizeName(name: string): string {
  return name.normalize("NFC").replace(/\s+/g, "").toLowerCase();
}

/** 관리자 설정(서버 환경변수). 하나라도 없으면 관리자 로그인은 꺼집니다. */
export function adminConfig(): { employeeId: string; name: string } | null {
  const employeeId = (process.env.ADMIN_EMPLOYEE_ID ?? "").trim();
  const name = (process.env.ADMIN_NAME ?? "").trim();
  if (!isValidEmployeeId(employeeId) || !name) return null;
  return { employeeId, name };
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && adminConfig() !== null;
}

export function isAdminEmployeeId(employeeId: string): boolean {
  const cfg = adminConfig();
  return cfg !== null && cfg.employeeId === employeeId;
}

function sign(data: string, key: string): string {
  return createHmac("sha256", key).update(data).digest("base64url");
}

/** 세션 쿠키 값을 만듭니다. SESSION_SECRET이 없으면 만들지 않습니다. */
export function createSessionToken(user: SessionUser): string | null {
  const key = secret();
  if (!key) return null;
  const payload: SessionPayload = { ...user, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body, key)}`;
}

/** 쿠키 값이 위·변조되지 않았고 만료되지 않았는지 확인합니다. */
export function verifySessionToken(token: string | undefined): SessionUser | null {
  const key = secret();
  if (!key || !token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = sign(body, key);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "ADMIN" && payload.role !== "EMPLOYEE") return null;
    if (!isValidEmployeeId(payload.employeeId)) return null;
    if (typeof payload.name !== "string" || !payload.name) return null;
    // 관리자 역할은 서버 설정에 지정된 사번 한 명에게만 유효합니다. (이름·화면 값으로는 얻을 수 없음)
    if (payload.role === "ADMIN") {
      if (!isAdminEmployeeId(payload.employeeId)) return null;
      return { employeeId: payload.employeeId, name: ADMIN_DISPLAY_NAME, role: "ADMIN" };
    }
    // 직원 토큰이 관리자 사번을 달고 있으면 무효(관리자 사번은 관리자 로그인으로만 사용)
    if (isAdminEmployeeId(payload.employeeId)) return null;
    return { employeeId: payload.employeeId, name: payload.name, role: "EMPLOYEE" };
  } catch {
    return null;
  }
}

/** 관리자 비밀번호를 시간 차이로 알아낼 수 없게(고정 시간) 비교합니다. */
export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * 사용자 고유 ID. 사번에서 만들며 이름과는 무관합니다.
 * DB로 옮기면 users.id 또는 users.employee_id 와 같은 값이 됩니다.
 */
export function userIdOf(user: Pick<SessionUser, "employeeId">): string {
  return `emp-${user.employeeId}`;
}

// ── 로그인 시도 제한(서버 메모리, 10분 동안 같은 대상에서 여러 번 실패하면 잠시 막음) ──
// 병원 안에서는 모두가 같은 IP로 보일 수 있어, 직원 로그인은 IP가 아니라 ‘사번’ 단위로 제한합니다.
// (한 명의 오타가 전 직원을 막지 않도록 하기 위함입니다.)
const failures = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_FAILURES = 5;

export function isBlocked(key: string, max = DEFAULT_MAX_FAILURES): boolean {
  const f = failures.get(key);
  if (!f) return false;
  if (Date.now() - f.first > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return f.count >= max;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const f = failures.get(key);
  if (!f || now - f.first > WINDOW_MS) failures.set(key, { count: 1, first: now });
  else f.count += 1;
}

export function clearFailures(key: string): void {
  failures.delete(key);
}
