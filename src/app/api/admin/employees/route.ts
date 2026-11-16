import { NextResponse } from "next/server";
import { jsonOk, requireAdmin } from "@/lib/server/api";
import { listEmployees } from "@/lib/server/employees";

export const dynamic = "force-dynamic";

/** 등록된 직원 목록(사번·이름·최근 로그인) — 관리자 전용 */
export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  return jsonOk({ employees: await listEmployees() });
}
