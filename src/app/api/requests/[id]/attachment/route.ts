import { NextResponse } from "next/server";
import { jsonError, requireUser, storeErrorResponse } from "@/lib/server/api";
import { fileResponse, readAttachmentFile } from "@/lib/server/attachments";
import { getRequestForFile } from "@/lib/server/requests";

export const dynamic = "force-dynamic";

/** 개선 요청의 첨부 파일. 요청한 본인과 관리자만 받을 수 있습니다(환자 정보가 찍혀 있을 수 있어 다른 직원은 접근 불가). */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return jsonError("파일을 찾을 수 없습니다.", 404);
  try {
    const r = await getRequestForFile(id, { uid: auth.uid, isAdmin: auth.user.role === "ADMIN" });
    if (!r?.attachment || !r.attachmentFileId) return jsonError("파일을 찾을 수 없습니다.", 404);
    const file = await readAttachmentFile("requests", id, r.attachmentFileId);
    if (!file) return jsonError("파일을 찾을 수 없습니다.", 404);
    return fileResponse(file, r.attachment.name, true);
  } catch (e) {
    return storeErrorResponse(e);
  }
}
