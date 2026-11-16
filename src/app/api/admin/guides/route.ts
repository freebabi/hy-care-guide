import { NextResponse } from "next/server";
import { cleanContentId, jsonError, jsonOk, readBody, requireAdmin, sameOrigin, storeErrorResponse } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { applyGuideOp, type GuideOp } from "@/lib/server/guides";

export const dynamic = "force-dynamic";

/**
 * 콘텐츠 등록·수정·게시 전환·폐기·복원(관리자 전용).
 * 권한과 검토 상태 규칙은 모두 서버가 확인합니다(화면의 버튼 비활성화에 의존하지 않음).
 * body: { op: "create" | "update", guide, note?, requestId? } 또는 { op: "toggle" | "retire" | "restore", contentId }
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request, 10 * 1024 * 1024); // 원본 첨부 최대 5개(각 1MB, base64) + 본문
  if (!body) return jsonError("요청 형식이 올바르지 않거나 내용이 너무 큽니다.", 400);

  let op: GuideOp;
  if (body.op === "create") {
    op = { op: "create", guide: body.guide, note: typeof body.note === "string" ? body.note : undefined };
  } else if (body.op === "update") {
    op = {
      op: "update",
      guide: body.guide,
      note: typeof body.note === "string" ? body.note : undefined,
      requestId: typeof body.requestId === "string" ? body.requestId : undefined,
    };
  } else if (body.op === "toggle" || body.op === "retire" || body.op === "restore") {
    const contentId = cleanContentId(body.contentId);
    if (!contentId) return jsonError("콘텐츠 ID가 올바르지 않습니다.", 400);
    op = { op: body.op, contentId };
  } else {
    return jsonError("지원하지 않는 작업입니다.", 400);
  }

  try {
    const result = await applyGuideOp(op);
    await audit(auth.user.employeeId, `guide.${op.op}`, result.guide.contentId);
    return jsonOk(result, op.op === "create" ? 201 : 200);
  } catch (e) {
    return storeErrorResponse(e);
  }
}
