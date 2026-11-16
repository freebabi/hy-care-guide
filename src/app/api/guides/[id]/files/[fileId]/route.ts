import { NextResponse } from "next/server";
import { cleanContentId, jsonError, requireUser, storeErrorResponse } from "@/lib/server/api";
import { fileResponse, isFileId, parseGuideFileUrl, readAttachmentFile } from "@/lib/server/attachments";
import { listAllGuides } from "@/lib/server/guides";

export const dynamic = "force-dynamic";

/** 콘텐츠에 첨부된 원본 파일 내려받기. 직원 전용(환자·비로그인 접근 불가)이며, 비게시 콘텐츠의 파일은 관리자만 받을 수 있습니다. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string; fileId: string }> }) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { id, fileId } = await ctx.params;
  const contentId = cleanContentId(id);
  if (!contentId || !isFileId(fileId)) return jsonError("파일을 찾을 수 없습니다.", 404);
  try {
    const guide = (await listAllGuides()).find((g) => g.contentId === contentId);
    const meta = guide?.sourceFiles?.find((f) => parseGuideFileUrl(contentId, f.dataUrl) === fileId);
    if (!guide || !meta || (guide.status !== "게시" && auth.user.role !== "ADMIN")) return jsonError("파일을 찾을 수 없습니다.", 404);
    const file = await readAttachmentFile("guides", contentId, fileId);
    if (!file) return jsonError("파일을 찾을 수 없습니다.", 404);
    return fileResponse(file, meta.name, true);
  } catch (e) {
    return storeErrorResponse(e);
  }
}
