import { NextResponse } from "next/server";
import { jsonError, jsonOk, readBody, requireAdmin, sameOrigin, storeErrorResponse } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { applyRestore, buildBackup } from "@/lib/server/backup";

export const dynamic = "force-dynamic";

/**
 * 백업 파일 내려받기(관리자 전용). CMS 콘텐츠 변경분과 개선 요청만 담고,
 * 비밀값·직원 명단·접속 기록·개인 보관함은 담지 않습니다. ?files=1 이면 안내문 원본 첨부도 담습니다.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const includeFiles = new URL(request.url).searchParams.get("files") === "1";
    const backup = await buildBackup({ includeFiles });
    await audit(auth.user.employeeId, `backup.export${includeFiles ? ":files" : ""}`);
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return new Response(JSON.stringify(backup, null, 1), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="hycg-backup-${stamp}.json"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return storeErrorResponse(e);
  }
}

/**
 * 백업 적용(관리자 전용). 반드시 미리보기(/api/admin/backup/preview)를 거친 뒤 확인(confirm)한 요청만 처리합니다.
 * body: { backup, confirm: true, addNew: boolean, overwriteContentIds: string[], expectedRevisions: { guides, requests } }
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request, 45 * 1024 * 1024);
  if (!body) return jsonError("요청 형식이 올바르지 않거나 파일이 너무 큽니다.", 400);
  if (body.confirm !== true) return jsonError("복구 내용을 확인한 뒤 진행해 주세요.", 400);
  const rev = body.expectedRevisions as { guides?: unknown; requests?: unknown } | undefined;
  if (!rev || typeof rev.guides !== "number" || typeof rev.requests !== "number") return jsonError("미리보기 정보가 없습니다. 미리보기부터 다시 진행해 주세요.", 400);
  const overwrite = Array.isArray(body.overwriteContentIds) ? body.overwriteContentIds.filter((v): v is string => typeof v === "string") : [];
  try {
    const result = await applyRestore(body.backup, {
      addNew: body.addNew !== false,
      overwriteContentIds: overwrite,
      expectedRevisions: { guides: rev.guides, requests: rev.requests },
    });
    await audit(auth.user.employeeId, `backup.restore:add${result.guidesAdded}+over${result.guidesOverwritten}+req${result.requestsAdded}`);
    return jsonOk({ result });
  } catch (e) {
    return storeErrorResponse(e);
  }
}
