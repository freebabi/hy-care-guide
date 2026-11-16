import { NextResponse } from "next/server";
import { cleanContentId, cleanText, jsonError, jsonOk, readBody, requireUser, sameOrigin } from "@/lib/server/api";
import { recordView, removeRecent } from "@/lib/server/user-data";

export const dynamic = "force-dynamic";

/** 자료를 열람했을 때 호출: 최근 본 자료 갱신 + 열람 이력 기록 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request);
  const contentId = cleanContentId(body?.contentId);
  const title = cleanText(body?.title, 200);
  if (!contentId || !title) return jsonError("요청 형식이 올바르지 않습니다.", 400);
  return jsonOk({ recent: await recordView(auth.uid, auth.user.name, contentId, title) });
}

/** 최근 본 자료 삭제: ?contentId=… 한 건, 또는 ?all=1 전체 */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const params = new URL(request.url).searchParams;
  if (params.get("all") === "1") return jsonOk({ recent: await removeRecent(auth.uid, "all") });
  const contentId = cleanContentId(params.get("contentId"));
  if (!contentId) return jsonError("삭제할 자료가 지정되지 않았습니다.", 400);
  return jsonOk({ recent: await removeRecent(auth.uid, contentId) });
}
