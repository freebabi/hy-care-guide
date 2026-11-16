import { NextResponse } from "next/server";
import { jsonOk, requireUser } from "@/lib/server/api";
import { unreadCount } from "@/lib/server/notices";
import { getNoticeReads } from "@/lib/server/user-data";

export const dynamic = "force-dynamic";

/** 읽지 않은 공지 개수(상단 메뉴 표시용). 본인 기준으로만 계산합니다. */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  return jsonOk({ unread: await unreadCount(await getNoticeReads(auth.uid)) });
}
