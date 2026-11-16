"use client";

import { Megaphone, Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FlagBadges, TypeBadge, summarize } from "@/components/care-guide/notices";
import { formatDate } from "@/lib/care-guide/format";
import { fetchNotices, refreshUnread } from "@/lib/care-guide/me-api";
import type { NoticeItem } from "@/lib/care-guide/me-types";
import { useRole } from "@/lib/care-guide/role";
import { useGuides } from "@/lib/care-guide/use-guides";

type TabId = "all" | "important" | "new" | "revision" | "retired";

const TABS: Array<{ id: TabId; label: string; match: (n: NoticeItem) => boolean }> = [
  { id: "all", label: "전체", match: () => true },
  { id: "important", label: "중요 공지", match: (n) => n.important || n.type === "important" },
  { id: "new", label: "신규 자료", match: (n) => n.type === "new" },
  { id: "revision", label: "콘텐츠 개정", match: (n) => n.type === "revision" },
  { id: "retired", label: "사용 종료 및 변경 안내", match: (n) => n.type === "retired" || n.type === "other" },
];

export default function NoticesPage() {
  const role = useRole();
  const { guides } = useGuides();
  const [notices, setNotices] = useState<NoticeItem[] | null>(null);
  const [error, setError] = useState("");
  const [durable, setDurable] = useState(true);
  const [tab, setTab] = useState<TabId>("all");

  useEffect(() => {
    let cancelled = false;
    void fetchNotices(false).then((r) => {
      if (cancelled) return;
      if (!r.ok) setError(r.error);
      else {
        setNotices(r.notices);
        setDurable(r.durable);
      }
    });
    void refreshUnread();
    return () => {
      cancelled = true;
    };
  }, []);

  const titleOf = useMemo(() => new Map(guides.map((g) => [g.contentId, g.title])), [guides]);
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const list = (notices ?? []).filter(current.match);
  const unreadTotal = (notices ?? []).filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">공지 및 업데이트</h1>
          <p className="mt-1 text-sm text-slate-600">HY CARE GUIDE의 새로운 소식과 안내자료 변경사항을 확인하세요.</p>
        </div>
        {role === "ADMIN" && (
          <Link
            href="/notices/manage"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-brand-blue/40 bg-white px-4 text-sm font-semibold text-brand-blue-dark hover:bg-blue-soft"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            공지 관리 (관리자)
          </Link>
        )}
      </div>

      {!durable && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          현재 서버 환경에서는 공지가 영구 보관되지 않아 서버가 다시 시작되면 사라질 수 있습니다.
        </p>
      )}

      <div role="tablist" aria-label="공지 유형" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => {
          const count = (notices ?? []).filter(t.match).filter((n) => !n.read).length;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                tab === t.id ? "bg-white text-brand-blue-dark shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
              {count > 0 && <span className="rounded-full bg-rose-600 px-1.5 text-[11px] font-bold text-white">{count}</span>}
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {error}
        </p>
      ) : notices === null ? (
        <p className="py-10 text-center text-sm text-slate-600">불러오는 중입니다…</p>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Megaphone className="h-6 w-6 text-slate-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-800">
            {notices.length === 0 ? "등록된 공지가 없습니다." : "이 구분에 해당하는 공지가 없습니다."}
          </p>
          <p className="text-xs text-slate-600">관리자가 공지를 등록하면 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <>
          {unreadTotal > 0 && <p className="text-xs font-semibold text-rose-700">읽지 않은 공지 {unreadTotal}건</p>}
          <ul className="flex flex-col gap-3">
            {list.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notices/${encodeURIComponent(n.id)}`}
                  className={`block rounded-xl border p-4 transition-colors hover:border-brand-blue/40 hover:bg-blue-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 sm:p-5 ${
                    n.read ? "border-slate-200 bg-white" : "border-brand-blue/30 bg-white shadow-[inset_3px_0_0_0_var(--color-brand-blue)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <TypeBadge type={n.type} />
                    <FlagBadges notice={n} />
                    {!n.read && <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">NEW</span>}
                    <span className="ml-auto text-xs text-slate-500">{formatDate(n.publishedAt ?? n.createdAt)}</span>
                  </div>
                  <h2 className={`mt-2 text-[16px] leading-snug text-slate-900 [overflow-wrap:anywhere] ${n.read ? "font-semibold" : "font-bold"}`}>{n.title}</h2>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{summarize(n.body)}</p>
                  {n.relatedContentIds.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500 [overflow-wrap:anywhere]">
                      관련 콘텐츠 ·{" "}
                      {n.relatedContentIds
                        .slice(0, 2)
                        .map((id) => titleOf.get(id) ?? "(삭제된 콘텐츠)")
                        .join(", ")}
                      {n.relatedContentIds.length > 2 && ` 외 ${n.relatedContentIds.length - 2}건`}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
