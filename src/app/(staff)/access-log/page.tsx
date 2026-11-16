"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@/components/care-guide/icons";
import RegisteredEmployees from "@/components/care-guide/staff/RegisteredEmployees";
import { useRole } from "@/lib/care-guide/role";
import { withBasePath } from "@/lib/care-guide/base-path";

interface Entry {
  name: string;
  at: string;
}

const PAGE = 100;
const KST = "Asia/Seoul";

const dayFmt = new Intl.DateTimeFormat("sv-SE", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("sv-SE", {
  timeZone: KST,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** 한국 시간 기준 날짜(2026-11-10)와 시각(16:05:09) */
function kst(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  return { day: dayFmt.format(d), time: timeFmt.format(d) };
}

async function fetchLog(): Promise<{ entries?: Entry[]; durable?: boolean; error?: string }> {
  try {
    const res = await fetch(withBasePath("/api/auth/login-log"), { cache: "no-store", credentials: "same-origin" });
    const data = (await res.json()) as { entries?: Entry[]; durable?: boolean; error?: string };
    if (!res.ok) return { error: data.error ?? "기록을 불러오지 못했습니다." };
    return data;
  } catch {
    return { error: "기록을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요." };
  }
}

/** 직원 접속 기록(관리자 전용): 직원 이름과 로그인 시간만 보여 줍니다. */
export default function AccessLogPage() {
  const role = useRole();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [durable, setDurable] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [onlyToday, setOnlyToday] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [loading, setLoading] = useState(false);

  const apply = useCallback((r: { entries?: Entry[]; durable?: boolean; error?: string }) => {
    if (r.error) setError(r.error);
    else {
      setError("");
      setEntries(r.entries ?? []);
      setDurable(r.durable ?? true);
    }
    setLoading(false);
  }, []);

  /** 처음 열 때(효과 안)와 새로고침 버튼이 함께 쓰는 조회 */
  const refresh = () => {
    setLoading(true);
    void fetchLog().then(apply);
  };

  useEffect(() => {
    if (role !== "ADMIN") return;
    let cancelled = false;
    void fetchLog().then((r) => {
      if (!cancelled) apply(r);
    });
    return () => {
      cancelled = true;
    };
  }, [role, apply]);

  const today = dayFmt.format(new Date());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries ?? []).filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false;
      if (onlyToday && kst(e.at).day !== today) return false;
      return true;
    });
  }, [entries, query, onlyToday, today]);

  const stats = useMemo(() => {
    const all = entries ?? [];
    return {
      total: all.length,
      today: all.filter((e) => kst(e.at).day === today).length,
      people: new Set(all.map((e) => e.name)).size,
    };
  }, [entries, today]);

  if (role !== "ADMIN") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <h1 className="text-lg font-extrabold text-slate-900">관리자 전용 화면입니다</h1>
        <p className="text-sm leading-relaxed text-slate-700">직원 접속 기록은 관리자만 볼 수 있습니다.</p>
        <Link
          href="/"
          className="mt-1 inline-flex min-h-[44px] items-center rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark"
        >
          안내 목록으로
        </Link>
      </div>
    );
  }

  const visible = filtered.slice(0, shown);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">직원 접속 기록</h1>
          <p className="mt-1 text-sm text-slate-600">직원 로그인 시 남은 이름과 로그인 시간입니다. (한국 시간 기준)</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="min-h-[40px] rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 disabled:opacity-60"
        >
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </div>

      {!durable && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          현재 서버 환경에서는 접속 기록이 영구 보관되지 않아 서버가 다시 시작되면 사라질 수 있습니다. 계속 보관하려면 저장소(DB) 설정이
          필요합니다.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {error}
        </p>
      )}

      <dl className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["전체 기록", stats.total],
          ["오늘 접속", stats.today],
          ["접속한 직원", stats.people],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <dt className="text-xs font-semibold text-slate-600">{label}</dt>
            <dd className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="직원 이름 검색"
            aria-label="직원 이름 검색"
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
          />
        </div>
        <button
          type="button"
          aria-pressed={onlyToday}
          onClick={() => {
            setOnlyToday((v) => !v);
            setShown(PAGE);
          }}
          className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${
            onlyToday
              ? "border-brand-blue bg-blue-soft text-brand-blue-dark"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          오늘만 보기
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {entries === null && !error ? (
          <p className="px-4 py-10 text-center text-sm text-slate-600">불러오는 중입니다…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-600">
            {entries && entries.length === 0 ? "아직 기록된 직원 로그인이 없습니다." : "조건에 맞는 기록이 없습니다."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  직원 이름
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                  로그인 시간
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((e, i) => {
                const t = kst(e.at);
                return (
                  <tr key={`${e.at}-${i}`}>
                    <td className="px-4 py-3 font-semibold text-slate-900 [overflow-wrap:anywhere]">{e.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
                      <span className="text-slate-500">{t.day}</span> <span className="font-medium text-slate-900">{t.time}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mx-auto min-h-[44px] rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          더 보기 ({filtered.length - shown}건 남음)
        </button>
      )}

      <RegisteredEmployees />
    </div>
  );
}
