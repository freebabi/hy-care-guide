import { NextResponse } from "next/server";
import { jsonError, jsonOk, readBody, requireAdmin, sameOrigin, storeErrorResponse } from "@/lib/server/api";
import { previewRestore } from "@/lib/server/backup";

export const dynamic = "force-dynamic";

/** 백업 파일 미리보기(관리자 전용). 아무것도 저장하지 않고, 무엇이 새로 추가되고 무엇이 현재와 다른지만 알려 줍니다. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request, 45 * 1024 * 1024);
  if (!body) return jsonError("요청 형식이 올바르지 않거나 파일이 너무 큽니다.", 400);
  try {
    return jsonOk({ plan: await previewRestore(body.backup) });
  } catch (e) {
    return storeErrorResponse(e);
  }
}
