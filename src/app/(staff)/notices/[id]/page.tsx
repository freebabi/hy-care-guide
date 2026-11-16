"use client";

import { ChevronLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import { FlagBadges, RevisionBox, TypeBadge } from "@/components/care-guide/notices";
import { formatDate, formatDateTime } from "@/lib/care-guide/format";
import { guidePath } from "@/lib/care-guide/slug";
import { fetchNotice, markNoticeRead } from "@/lib/care-guide/me-api";
import type { NoticeItem } from "@/lib/care-guide/me-types";
import { useRole } from "@/lib/care-guide/role";
import { useGuides } from "@/lib/care-guide/use-guides";

export default function NoticeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const role = useRole();
  const { guides } = useGuides();
  const [notice, setNotice] = useState<NoticeItem | null>(null);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchNotice(id).then(async (r) => {
      if (cancelled) return;
      if (!r.ok) return setError(r.error);
      setNotice(r.notice);
      // 게시 중인 공지를 열면 읽음으로 표시합니다(내 읽음 정보는 다른 직원에게 보이지 않습니다).
      if (r.notice.status === "published") await markNoticeRead(r.notice.id);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const byId = useMemo(() => new Map(guides.map((g) => [g.contentId, g])), [guides]);
  const previewGuide = previewId ? byId.get(previewId) : undefined;
  const related = (notice?.relatedContentIds ?? []).map((cid) => ({ id: cid, guide: byId.get(cid) }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Link
        href="/notices"
        className="inline-flex min-h-[40px] w-fit items-center gap-1 rounded-lg text-sm font-semibold text-brand-blue-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        공지 목록으로
      </Link>

      {error ? (
        <p role="alert" className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-700">
          {error}
        </p>
      ) : !notice ? (
        <p className="py-10 text-center text-sm text-slate-600">불러오는 중입니다…</p>
      ) : (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-1.5">
            <TypeBadge type={notice.type} />
            <FlagBadges notice={notice} showStatus={role === "ADMIN"} />
          </div>
          <h1 className="mt-3 text-xl font-extrabold leading-snug text-slate-900 [overflow-wrap:anywhere]">{notice.title}</h1>
          <p className="mt-1.5 text-xs text-slate-500">
            등록 {formatDate(notice.publishedAt ?? notice.createdAt)}
            {notice.updatedAt !== notice.createdAt && ` · 수정 ${formatDateTime(notice.updatedAt)}`}
          </p>

          {notice.status !== "published" && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-900">
              현재 직원에게 공개되지 않은 공지입니다(관리자에게만 보임).
            </p>
          )}

          <div className="mt-5 whitespace-pre-line text-[15px] leading-[1.8] text-slate-800 [overflow-wrap:anywhere]">{notice.body}</div>

          {notice.type === "revision" && (
            <div className="mt-6">
              <RevisionBox notice={notice} guides={guides} />
            </div>
          )}

          {related.length > 0 && (
            <section className="mt-6 border-t border-slate-100 pt-5" aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-sm font-bold text-slate-900">
                관련 안내자료
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {related.map(({ id: cid, guide }) => (
                  <li key={cid} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                    {guide && (guide.status === "게시" || role === "ADMIN") ? (
                      <>
                        <Link href={guidePath(guide.slug)} className="min-w-0 text-sm font-semibold text-slate-900 hover:text-brand-blue-dark hover:underline [overflow-wrap:anywhere]">
                          {guide.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPreviewId(cid)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-brand-blue-dark hover:bg-blue-soft/60"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          미리보기
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-slate-500">현재 열람할 수 없는 자료입니다(비공개 또는 삭제됨).</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}

      {previewGuide && <GuidePreviewModal guide={previewGuide} allGuides={guides} onClose={() => setPreviewId(null)} />}
    </div>
  );
}
