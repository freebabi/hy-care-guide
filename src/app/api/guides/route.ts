import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/server";
import { jsonOk, storeErrorResponse } from "@/lib/server/api";
import { publicView, staffView } from "@/lib/server/guides";

export const dynamic = "force-dynamic";

/**
 * 안내 콘텐츠의 서버 변경분(관리자가 수정·등록한 것). 기본 안내 88건은 코드에 있으므로 여기에는 변경분만 옵니다.
 * - 관리자: 모든 변경분(검토 대기·비게시 포함, 첨부 원본 파일·버전 이력 포함)
 * - 일반 직원: 게시 중인 변경분(검토 대기 포함, 첨부 원본 파일·버전 이력 포함). 비게시·폐기 콘텐츠는 내려가지 않음
 * - 로그인하지 않은 방문자(환자): 환자에게 공개할 수 있는 것(게시 + 의료진 검토 완료)만, 내부 정보 제거
 * 어느 쪽인지는 서버가 쿠키의 서명된 세션으로 정하며, 화면이 보낸 값은 보지 않습니다.
 */
export async function GET() {
  try {
    const user = verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
    return jsonOk(user ? await staffView({ isAdmin: user.role === "ADMIN" }) : await publicView());
  } catch (e) {
    return storeErrorResponse(e);
  }
}
