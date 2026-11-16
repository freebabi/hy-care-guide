"use client";

import { BarChart3, ClipboardCheck, Download, Eye, History, Layers, MessageSquareOff, Printer, RefreshCw, Search, Send, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { daysAgoKst, formatDate, formatDateTime, kstDayEnd, kstDayStart, todayKst } from "@/lib/care-guide/format";
import { fetchActivity, useLibrary } from "@/lib/care-guide/me-api";
import { ACTIVITY_LABEL, ACTIVITY_TYPES, type ActivityItem, type ActivityType } from "@/lib/care-guide/me-types";
import { getSendLog } from "@/lib/care-guide/notification-service";
import { useRole } from "@/lib/care-guide/role";
import { useClientValue } from "@/lib/care-guide/use-client-value";

type TabId = "bundles" | "activity" | "electronic";
type Period = "all" | "today" | "7" | "30" | "custom";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "bundles", label: "안내자료 구성 이력" },
  { id: "activity", label: "자료 활용 이력" },
  { id: "electronic", label: "전자 발송 이력" },
];

const TYPE_STYLE: Record<ActivityType, { icon: LucideIcon; cls: string }> = {
  view: { icon: Eye, cls: "bg-slate-100 text-slate-700" },
  download: { icon: Download, cls: "bg-sky-50 text-sky-800" },
  print: { icon: Printer, cls: "bg-indigo-50 text-indigo-800" },
  compose: { icon: Layers, cls: "bg-teal-50 text-teal-800" },
  provided: { icon: ClipboardCheck, cls: "bg-emerald-50 text-emerald-800" },
  "message-prep": { icon: Send, cls: "bg-amber-50 text-amber-800" },
};

const field = "min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30";

function periodRange(period: Period, from: string, to: string): { from?: string; to?: string } {
  if (period === "today") return { from: kstDayStart(todayKst()), to: kstDayEnd(todayKst()) };
  if (period === "7") return { from: kstDayStart(daysAgoKst(6)), to: kstDayEnd(todayKst()) };
  if (period === "30") return { from: kstDayStart(daysAgoKst(29)), to: kstDayEnd(todayKst()) };
  if (period === "custom") return { from: from ? kstDayStart(from) : undefined, to: to ? kstDayEnd(to) : undefined };
  return {};
}

export default function HistoryPage() {
  const role = useRole();
  const { data: library, status: libStatus } = useLibrary();
  const legacyCount = useClientValue(() => getSendLog().length, 0);

  const [tab, setTab] = useState<TabId>("activity");
  const [period, setPeriod] = useState<Period>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<ActivityType | "">("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState(""); // 입력이 멈춘 뒤 적용되는 검색어
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [shown, setShown] = useState(50);

  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [durable, setDurable] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t === "bundles" || t === "activity" || t === "electronic") setTab(t);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setQuery(q), 300);
    return () => window.clearTimeout(id);
  }, [q]);

  const range = useMemo(() => periodRange(period, from, to), [period, from, to]);

  useEffect(() => {
    if (tab !== "activity") return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    void fetchActivity({ type, q: query, order, ...range }).then((r) => {
      if (cancelled) return;
      setLoading(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setError("");
      setItems(r.items);
      setDurable(r.durable);
      setShown(50);
    });
    return () => {
      cancelled = true;
    };
  }, [tab, type, query, order, range, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  function selectTab(id: TabId) {
    setTab(id);
    window.history.replaceState(null, "", `?tab=${id}`);
  }

  const bundles = useMemo(() => {
    const qq = query.trim().toLowerCase();
    const f = range.from ? new Date(range.from).getTime() : null;
    const t = range.to ? new Date(range.to).getTime() : null;
    const list = library.bundles.filter((b) => {
      if (qq && !b.title.toLowerCase().includes(qq)) return false;
      const u = new Date(b.updatedAt).getTime();
      return (f === null || u >= f) && (t === null || u <= t);
    });
    list.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    return order === "desc" ? list.reverse() : list;
  }, [library.bundles, query, range, order]);

  const filtersUi = (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
        기간
        <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={field}>
          <option value="all">전체 기간</option>
          <option value="today">오늘</option>
          <option value="7">최근 7일</option>
          <option value="30">최근 30일</option>
          <option value="custom">직접 지정</option>
        </select>
      </label>
      {period === "custom" && (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            시작일
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            종료일
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={field} />
          </label>
        </>
      )}
      {tab === "activity" && (
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          활용 유형
          <select value={type} onChange={(e) => setType(e.target.value as ActivityType | "")} className={field}>
            <option value="">전체 유형</option>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACTIVITY_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs font-semibold text-slate-700">
        제목 검색
        <span className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="콘텐츠·자료 묶음 제목" className={`${field} w-full pl-9`} />
        </span>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
        정렬
        <select value={order} onChange={(e) => setOrder(e.target.value as "asc" | "desc")} className={field}>
          <option value="desc">최신순</option>
          <option value="asc">오래된 순</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">발송·활용 이력</h1>
          <p className="mt-1 text-sm text-slate-600">준비한 안내자료와 실제 활용 기록을 확인하세요.</p>
        </div>
        {role === "ADMIN" && (
          <Link
            href="/dashboard"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-brand-blue/40 bg-white px-4 text-sm font-semibold text-brand-blue-dark hover:bg-blue-soft"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            전체 활용 통계 (관리자)
          </Link>
        )}
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        이 화면에는 <b>내 기록만</b> 표시됩니다. 자료를 열어 본 기록은 자동으로 남고, ‘안내 제공 완료’는 직원이 직접 기록한 경우에만 남습니다. 환자 이름·연락처 등 환자 정보는 저장하지 않습니다.
      </p>

      <div role="tablist" aria-label="이력 구분" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => selectTab(t.id)}
            className={`min-h-[44px] flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
              tab === t.id ? "bg-white text-brand-blue-dark shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "electronic" && filtersUi}

      {tab === "bundles" &&
        (libStatus !== "ready" ? (
          <p className="py-10 text-center text-sm text-slate-600">불러오는 중입니다…</p>
        ) : bundles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Layers className="h-6 w-6 text-slate-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-800">
              {library.bundles.length === 0 ? "저장한 안내자료 구성이 없습니다." : "조건에 맞는 구성이 없습니다."}
            </p>
            <Link href="/compose" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-brand-blue-dark hover:bg-blue-soft/60">
              안내자료 구성하기
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden grid-cols-[minmax(0,2fr)_90px_110px_110px_130px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 md:grid">
              <span>자료 묶음명</span>
              <span>구성 자료</span>
              <span>생성일</span>
              <span>수정일</span>
              <span />
            </div>
            <ul className="divide-y divide-slate-100">
              {bundles.map((b) => (
                <li key={b.id} className="grid gap-1 px-4 py-3 md:grid-cols-[minmax(0,2fr)_90px_110px_110px_130px] md:items-center md:gap-3">
                  <span className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{b.title}</span>
                  <span className="text-sm text-slate-700">
                    <span className="text-xs text-slate-500 md:hidden">구성 자료 </span>
                    {b.contentIds.length}건
                  </span>
                  <span className="text-sm text-slate-700">
                    <span className="text-xs text-slate-500 md:hidden">생성 </span>
                    {formatDate(b.createdAt)}
                  </span>
                  <span className="text-sm text-slate-700">
                    <span className="text-xs text-slate-500 md:hidden">수정 </span>
                    {formatDate(b.updatedAt)}
                  </span>
                  <Link
                    href={`/compose?bundle=${encodeURIComponent(b.id)}`}
                    className="mt-1 inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-brand-blue-dark hover:bg-blue-soft/60 md:mt-0"
                  >
                    다시 구성하기
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      {tab === "activity" && (
        <>
          {!durable && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
              현재 서버 환경에서는 이력이 영구 보관되지 않아 서버가 다시 시작되면 사라질 수 있습니다.
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-600" aria-live="polite">
              {items ? `${items.length}건` : loading ? "불러오는 중…" : ""}
            </p>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              새로고침
            </button>
          </div>

          {items && items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <History className="h-6 w-6 text-slate-400" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">조건에 맞는 활용 이력이 없습니다.</p>
              <p className="text-xs text-slate-600">안내자료를 열어 보거나 구성하면 이곳에 기록됩니다.</p>
            </div>
          ) : (
            items && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="hidden grid-cols-[minmax(0,1.7fr)_190px_130px_minmax(0,1.3fr)_90px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 lg:grid">
                  <span>콘텐츠 · 자료 묶음</span>
                  <span>활용 유형</span>
                  <span>실행 일시</span>
                  <span>관련 자료</span>
                  <span>사용자</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {items.slice(0, shown).map((a) => {
                    const s = TYPE_STYLE[a.type];
                    const rel = a.related ?? [];
                    return (
                      <li key={a.id} className="grid gap-1.5 px-4 py-3 lg:grid-cols-[minmax(0,1.7fr)_190px_130px_minmax(0,1.3fr)_90px] lg:items-center lg:gap-3">
                        <span className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{a.title}</span>
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
                            <s.icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {ACTIVITY_LABEL[a.type]}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">{a.type === "provided" ? "직접 기록" : "자동 기록"}</span>
                        </span>
                        <span className="text-sm tabular-nums text-slate-700">{formatDateTime(a.at)}</span>
                        <span className="min-w-0 text-xs leading-relaxed text-slate-600">
                          {rel.length === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <>
                              {rel.slice(0, 3).map((r) => r.title).join(" · ")}
                              {rel.length > 3 && ` 외 ${rel.length - 3}건`}
                            </>
                          )}
                        </span>
                        <span className="text-sm text-slate-700 [overflow-wrap:anywhere]">{a.user}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          )}
          {items && items.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + 50)}
              className="mx-auto min-h-[44px] rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              더 보기 ({items.length - shown}건 남음)
            </button>
          )}
        </>
      )}

      {tab === "electronic" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
          <MessageSquareOff className="h-7 w-7 text-slate-400" aria-hidden="true" />
          <p className="text-base font-bold text-slate-900">현재 연결된 전자 발송 서비스가 없습니다.</p>
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            SMS, 카카오 알림톡, 이메일 발송은 아직 연동되지 않았습니다. 서비스가 연동되면 발송 채널, 안내 콘텐츠, 요청 일시, 처리 결과, 실패 사유만 기록합니다(환자 정보는 저장하지 않음).
          </p>
          {legacyCount > 0 && (
            <p className="max-w-md rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
              이 브라우저에는 이전 버전에서 ‘문구 복사·QR 준비’를 ‘발송’으로 잘못 표시했던 기록 {legacyCount}건이 남아 있습니다. 실제 발송이 아니므로 이력에서 제외했고, 삭제하지는 않았습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
