import { NextResponse } from "next/server";
import { jsonError, jsonOk, readBody, requireAdmin, sameOrigin, storeErrorResponse } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { updateRequestAdmin } from "@/lib/server/requests";

export const dynamic = "force-dynamic";

/** 개선 요청 처리(상태 변경·관리자 답변·반영 버전 기록). 관리자만 할 수 있습니다. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return jsonError("요청 번호가 올바르지 않습니다.", 400);
  const body = await readBody(request);
  if (!body) return jsonError("요청 형식이 올바르지 않습니다.", 400);
  try {
    const updated = await updateRequestAdmin(id, { status: body.status, adminNote: body.adminNote, appliedVersion: body.appliedVersion });
    await audit(auth.user.employeeId, `request.update:${updated.status}`, updated.requestId);
    return jsonOk({ request: updated });
  } catch (e) {
    return storeErrorResponse(e);
  }
}
