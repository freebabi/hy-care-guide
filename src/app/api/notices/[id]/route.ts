import { NextResponse } from "next/server";
import { cleanText, jsonError, jsonOk, readBody, requireAdmin, requireUser, sameOrigin } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { deleteNotice, getNotice, updateNotice } from "@/lib/server/notices";
import { parseNoticeInput } from "@/lib/server/notice-input";
import { getNoticeReads } from "@/lib/server/user-data";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const id = cleanText((await params).id, 60);
  const notice = await getNotice(id, auth.user.role === "ADMIN", await getNoticeReads(auth.uid));
  return notice ? jsonOk({ notice }) : jsonError("공지를 찾을 수 없습니다.", 404);
}

/** 공지 수정·게시·게시 종료(관리자 전용) */
export async function PUT(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request);
  if (!body) return jsonError("요청 형식이 올바르지 않습니다.", 400);
  const parsed = parseNoticeInput(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  const notice = await updateNotice(cleanText((await params).id, 60), parsed.value);
  if (!notice) return jsonError("공지를 찾을 수 없습니다.", 404);
  await audit(auth.user.employeeId, `notice.update:${notice.status}`, notice.id);
  return jsonOk({ notice });
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const id = cleanText((await params).id, 60);
  const removed = await deleteNotice(id);
  if (!removed) return jsonError("공지를 찾을 수 없습니다.", 404);
  await audit(auth.user.employeeId, "notice.delete", id);
  return jsonOk({ ok: true });
}
