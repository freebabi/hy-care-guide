"use client";

import { Archive, CircleAlert, FilePen, Megaphone, Pin, Sparkles, Info, type LucideIcon } from "lucide-react";
import { NOTICE_STATUS_LABEL, NOTICE_TYPE_LABEL, type NoticeItem, type NoticeType } from "@/lib/care-guide/me-types";
import { REVIEW_STATUS_LABEL, isOfficial, reviewStatusOf } from "@/lib/care-guide/review";
import type { GuideContent } from "@/lib/care-guide/types";

export const NOTICE_STYLE: Record<NoticeType, { icon: LucideIcon; cls: string }> = {
  important: { icon: CircleAlert, cls: "bg-rose-50 text-rose-800" },
  new: { icon: Sparkles, cls: "bg-sky-50 text-sky-800" },
  revision: { icon: FilePen, cls: "bg-indigo-50 text-indigo-800" },
  retired: { icon: Archive, cls: "bg-slate-100 text-slate-700" },
  other: { icon: Info, cls: "bg-teal-50 text-teal-800" },
};

export function TypeBadge({ type }: { type: NoticeType }) {
  const s = NOTICE_STYLE[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
      <s.icon className="h-3.5 w-3.5" aria-hidden="true" />
      {NOTICE_TYPE_LABEL[type]}
    </span>
  );
}

/** 중요·고정 표시와(관리자 화면에서는) 게시 상태 */
export function FlagBadges({ notice, showStatus = false }: { notice: NoticeItem; showStatus?: boolean }) {
  return (
    <>
      {notice.important && notice.type !== "important" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
          <Megaphone className="h-3 w-3" aria-hidden="true" />
          중요
        </span>
      )}
      {notice.pinned && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#26384D] px-2 py-0.5 text-[11px] font-bold text-white">
          <Pin className="h-3 w-3" aria-hidden="true" />
          상단 고정
        </span>
      )}
      {showStatus && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            notice.status === "published" ? "bg-emerald-50 text-emerald-800" : notice.status === "draft" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"
          }`}
        >
          {NOTICE_STATUS_LABEL[notice.status]}
        </span>
      )}
    </>
  );
}

/**
 * ‘콘텐츠 개정’ 공지의 개정 정보. 연결된 콘텐츠가 공식 승인되지 않았다면
 * 개정이 끝난 것처럼 보이지 않도록 ‘승인 전’으로 분명히 표시합니다.
 */
export function RevisionBox({ notice, guides }: { notice: NoticeItem; guides: GuideContent[] }) {
  const r = notice.revision;
  if (!r) return null;
  const guide = guides.find((g) => g.contentId === r.contentId);
  const official = guide ? isOfficial(guide) : false;
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm">
      <h3 className="text-sm font-bold text-slate-900">개정 정보</h3>
      <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-slate-500">관련 콘텐츠</dt>
          <dd className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{guide?.title ?? "연결된 콘텐츠를 찾을 수 없습니다"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">버전</dt>
          <dd className="text-slate-900">
            {r.fromVersion !== undefined ? `v${r.fromVersion}` : "—"} → {r.toVersion !== undefined ? `v${r.toVersion}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">개정일</dt>
          <dd className="text-slate-900">{r.revisedAt ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">검토·승인 상태</dt>
          <dd>
            {guide ? (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  official ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {REVIEW_STATUS_LABEL[reviewStatusOf(guide)]}
                {official ? " · 공식 승인" : " · 공식 승인 전"}
              </span>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
      {r.changes && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-500">주요 변경사항</p>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-800">{r.changes}</p>
        </div>
      )}
      {guide && !official && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-900">
          이 콘텐츠는 아직 담당 부서의 공식 승인을 받지 않았습니다. 개정 내용이 공식 안내로 확정된 것이 아니므로 ‘개정 완료’로 보지 마세요.
        </p>
      )}
    </div>
  );
}

export function summarize(body: string, max = 110): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}
