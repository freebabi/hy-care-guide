import "server-only";
import { cleanContentId, cleanText } from "./api";
import { NOTICE_TYPES, type NoticeRevision, type NoticeStatus, type NoticeType } from "@/lib/care-guide/me-types";
import type { NoticeInput } from "./notices";

type Parsed = { ok: true; value: NoticeInput } | { ok: false; error: string };

/** 관리자가 보낸 공지 입력을 검사하고 정리합니다. */
export function parseNoticeInput(body: Record<string, unknown>): Parsed {
  const type = body.type as NoticeType;
  if (!NOTICE_TYPES.includes(type)) return { ok: false, error: "공지 유형을 선택해 주세요." };
  const title = cleanText(body.title, 120);
  const text = typeof body.body === "string" ? body.body.normalize("NFC").trim().slice(0, 8000) : "";
  const status = body.status as NoticeStatus;
  if (status !== "draft" && status !== "published" && status !== "ended") return { ok: false, error: "게시 상태가 올바르지 않습니다." };
  // 임시 저장은 비어 있어도 되지만 게시할 때는 제목과 내용이 있어야 합니다.
  if (status !== "draft" && (title.length < 2 || text.length < 2)) {
    return { ok: false, error: "게시하려면 제목과 내용을 입력해 주세요." };
  }
  if (title.length < 1) return { ok: false, error: "제목을 입력해 주세요." };

  const related = Array.from(
    new Set((Array.isArray(body.relatedContentIds) ? body.relatedContentIds : []).map(cleanContentId).filter((v): v is string => Boolean(v))),
  ).slice(0, 30);

  let revision: NoticeRevision | undefined;
  if (type === "revision" && body.revision && typeof body.revision === "object") {
    const r = body.revision as Record<string, unknown>;
    const contentId = cleanContentId(r.contentId);
    if (contentId) {
      const ver = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 10000 ? Math.floor(v) : undefined);
      const date = typeof r.revisedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.revisedAt) ? r.revisedAt : undefined;
      revision = {
        contentId,
        fromVersion: ver(r.fromVersion),
        toVersion: ver(r.toVersion),
        revisedAt: date,
        changes: cleanText(r.changes, 1500) || undefined,
      };
    }
  }
  if (type === "revision" && status === "published" && !revision) {
    return { ok: false, error: "콘텐츠 개정 공지는 개정된 콘텐츠를 선택해야 게시할 수 있습니다." };
  }

  return {
    ok: true,
    value: {
      type,
      title,
      body: text,
      important: type === "important" || body.important === true,
      pinned: body.pinned === true,
      status,
      relatedContentIds: revision && !related.includes(revision.contentId) ? [revision.contentId, ...related] : related,
      revision,
    },
  };
}
