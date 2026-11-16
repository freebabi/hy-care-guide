import { NextResponse } from "next/server";
import { jsonError, jsonOk, readBody, requireUser, sameOrigin, storeErrorResponse } from "@/lib/server/api";
import { createRequest, listRequests } from "@/lib/server/requests";

export const dynamic = "force-dynamic";

/** 개선 요청 목록. 관리자는 모든 요청, 일반 직원은 본인이 낸 요청만 받습니다(서버가 세션으로 판단). */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return jsonOk({ requests: await listRequests({ uid: auth.uid, isAdmin: auth.user.role === "ADMIN" }) });
  } catch (e) {
    return storeErrorResponse(e);
  }
}

/** 개선 요청 제출(로그인한 직원·관리자). 대상 안내의 제목·버전은 서버가 정합니다. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request, 3 * 1024 * 1024); // 첨부 1MB(base64로 약 1.4MB) + 본문
  if (!body) return jsonError("요청 형식이 올바르지 않거나 내용이 너무 큽니다.", 400);
  try {
    const created = await createRequest(auth.uid, auth.user.role === "ADMIN", {
      contentId: body.contentId,
      kind: body.kind,
      message: body.message,
      requesterDepartment: body.requesterDepartment,
      attachment: body.attachment,
    });
    return jsonOk({ request: created }, 201);
  } catch (e) {
    return storeErrorResponse(e);
  }
}
