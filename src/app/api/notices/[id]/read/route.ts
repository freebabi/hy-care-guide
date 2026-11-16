import { NextResponse } from "next/server";
import { cleanText, jsonError, jsonOk, requireUser, sameOrigin } from "@/lib/server/api";
import { getNotice, unreadCount } from "@/lib/server/notices";
import { getNoticeReads, markNoticeRead } from "@/lib/server/user-data";

export const dynamic = "force-dynamic";

/** 공지를 읽음으로 표시합니다. 읽음 정보는 본인 파일에만 저장되어 다른 직원에게 보이지 않습니다. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const id = cleanText((await params).id, 60);
  // 게시 중인 공지만 읽음 처리할 수 있습니다(임시 저장 공지의 존재를 직원이 알 수 없도록).
  const notice = await getNotice(id, false, {});
  if (!notice) return jsonError("공지를 찾을 수 없습니다.", 404);
  await markNoticeRead(auth.uid, id);
  return jsonOk({ unread: await unreadCount(await getNoticeReads(auth.uid)) });
}
