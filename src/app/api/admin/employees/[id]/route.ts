import { NextResponse } from "next/server";
import { isValidEmployeeId } from "@/lib/auth/server";
import { jsonError, jsonOk, requireAdmin, sameOrigin } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { resetEmployee } from "@/lib/server/employees";

export const dynamic = "force-dynamic";

/**
 * 잘못 등록된 사번의 이름 연결을 초기화합니다(관리자 전용).
 * 그 직원의 보관함·이력 데이터는 사번 기준이라 지워지지 않으며, 다시 로그인하면 올바른 이름으로 새로 등록됩니다.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const id = (await params).id;
  if (!isValidEmployeeId(id)) return jsonError("사번 형식이 올바르지 않습니다.", 400);
  const removed = await resetEmployee(id);
  if (!removed) return jsonError("등록된 사번이 아닙니다.", 404);
  await audit(auth.user.employeeId, "employee.reset", id);
  return jsonOk({ ok: true });
}
