"use client";

import { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "@/components/care-guide/modals/ConfirmDialog";
import { formatDateTime } from "@/lib/care-guide/format";
import { withBasePath } from "@/lib/care-guide/base-path";

interface Row {
  employeeId: string;
  name: string;
  lastLoginAt: string;
  loginCount: number;
}

async function fetchRows(): Promise<{ rows?: Row[]; error?: string }> {
  try {
    const res = await fetch(withBasePath("/api/admin/employees"), { cache: "no-store", credentials: "same-origin" });
    const data = (await res.json()) as { employees?: Row[]; error?: string };
    return res.ok ? { rows: data.employees ?? [] } : { error: data.error ?? "불러오지 못했습니다." };
  } catch {
    return { error: "서버에 연결하지 못했습니다." };
  }
}

/**
 * 관리자 전용: 사번에 등록된 직원 이름 목록. 이름을 잘못 입력해 등록된 사번은 ‘등록 초기화’로 풀 수 있습니다.
 * (초기화해도 그 직원의 보관함·이력은 지워지지 않습니다. 사번 기준으로 저장되어 있기 때문입니다.)
 */
export default function RegisteredEmployees() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<Row | null>(null);

  const load = useCallback(async () => {
    const r = await fetchRows();
    if (r.error) setError(r.error);
    else {
      setError("");
      setRows(r.rows ?? []);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchRows().then((r) => {
      if (cancelled) return;
      if (r.error) setError(r.error);
      else setRows(r.rows ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const shown = (rows ?? []).filter((r) => !q || r.name.toLowerCase().includes(q) || r.employeeId.includes(q));

  return (
    <section className="flex flex-col gap-3" aria-labelledby="registered-heading">
      <div>
        <h2 id="registered-heading" className="text-base font-bold text-slate-900">
          사번에 등록된 직원
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          처음 로그인한 이름이 사번에 등록됩니다. 이름을 잘못 입력해 로그인이 막힌 직원이 있으면 ‘등록 초기화’를 눌러 주세요. 보관함·이력은 지워지지 않습니다.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {error}
        </p>
      )}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="이름 또는 사번 검색"
        aria-label="등록 직원 검색"
        className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm sm:max-w-xs"
      />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {rows === null && !error ? (
          <p className="px-4 py-8 text-center text-sm text-slate-600">불러오는 중입니다…</p>
        ) : shown.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-600">{rows?.length ? "조건에 맞는 직원이 없습니다." : "아직 등록된 직원이 없습니다."}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {shown.slice(0, 200).map((r) => (
              <li key={r.employeeId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 [overflow-wrap:anywhere]">
                    {r.name} <span className="font-normal tabular-nums text-slate-500">· {r.employeeId}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    최근 로그인 {formatDateTime(r.lastLoginAt)} · {r.loginCount}회
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTarget(r)}
                  className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  등록 초기화
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {target && (
        <ConfirmDialog
          title="사번 등록 초기화"
          message={`사번 ${target.employeeId}에 등록된 이름 ‘${target.name}’을 초기화합니다. 다음에 이 사번으로 로그인하는 사람의 이름이 새로 등록됩니다. 보관함·이력은 지워지지 않습니다.`}
          confirmLabel="초기화"
          onClose={() => setTarget(null)}
          onConfirm={async () => {
            await fetch(withBasePath(`/api/admin/employees/${target.employeeId}`), { method: "DELETE", credentials: "same-origin" });
            await load();
          }}
        />
      )}
    </section>
  );
}
