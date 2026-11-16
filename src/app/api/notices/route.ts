import { NextResponse } from "next/server";
import { jsonError, jsonOk, readBody, requireAdmin, requireUser, sameOrigin } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { createNotice, listNotices } from "@/lib/server/notices";
import { parseNoticeInput } from "@/lib/server/notice-input";
import { getNoticeReads } from "@/lib/server/user-data";
import { isDurable } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** 공지 목록. 직원에게는 게시 중인 공지만, 관리자가 ?all=1을 주면 임시 저장·게시 종료 공지까지 보여 줍니다. */
export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const wantsAll = new URL(request.url).searchParams.get("all") === "1";
  const includeAll = wantsAll && auth.user.role === "ADMIN";
  const reads = await getNoticeReads(auth.uid);
  return jsonOk({ notices: await listNotices({ includeAll, reads }), durable: isDurable() });
}

/** 공지 작성(관리자 전용) */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request);
  if (!body) return jsonError("요청 형식이 올바르지 않습니다.", 400);
  const parsed = parseNoticeInput(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  const notice = await createNotice(parsed.value);
  await audit(auth.user.employeeId, `notice.create:${notice.status}`, notice.id);
  return jsonOk({ notice }, 201);
}
