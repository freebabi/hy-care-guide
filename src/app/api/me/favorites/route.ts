import { NextResponse } from "next/server";
import { cleanContentId, cleanText, jsonError, jsonOk, readBody, requireUser, sameOrigin } from "@/lib/server/api";
import { setFavorite } from "@/lib/server/user-data";

export const dynamic = "force-dynamic";

/** 즐겨찾기 등록(on: true) / 해제(on: false) */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request);
  const contentId = cleanContentId(body?.contentId);
  const title = cleanText(body?.title, 200);
  if (!body || !contentId || !title || typeof body.on !== "boolean") return jsonError("요청 형식이 올바르지 않습니다.", 400);
  try {
    return jsonOk({ favorites: await setFavorite(auth.uid, contentId, title, body.on) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "저장하지 못했습니다.", 400);
  }
}
