"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PATIENTS } from "@/lib/care-guide/patients-data";
import { STAGES } from "@/lib/care-guide/types";
import { SearchIcon, UserIcon } from "@/components/care-guide/icons";

function formatScheduledAt(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}.${dd} ${hh}:${min}`;
}

export default function StaffHomePage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return PATIENTS;
    return PATIENTS.filter((p) => p.name.includes(q) || p.registrationNumber.includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">환자 안내</h1>
        <p className="mt-1 text-sm text-slate-500">환자분에게 지금 필요한 안내를 추천합니다.</p>
      </div>

      <label className="relative block max-w-md">
        <span className="sr-only">환자 검색</span>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="환자명 또는 등록번호로 검색"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </label>

      <div>
        <p className="mb-3 text-sm font-bold text-slate-700">
          {query ? `검색 결과 ${filtered.length}건` : "최근 조회한 환자"}
        </p>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
            검색 결과가 없습니다. 환자명 또는 등록번호를 다시 확인해주세요.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((patient) => {
              const scheduled = formatScheduledAt(patient.scheduledAt);
              return (
                <Link
                  key={patient.patientId}
                  href={`/patients/${patient.patientId}`}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-blue hover:shadow-sm"
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    {patient.name}
                    <span className="font-normal text-slate-400">{patient.registrationNumber}</span>
                  </span>
                  <span className="text-xs font-semibold text-brand-teal">{patient.department}</span>
                  <span className="text-sm text-slate-600">● {STAGES[patient.stage].label}</span>
                  {scheduled && <span className="text-xs text-slate-400">{scheduled}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
