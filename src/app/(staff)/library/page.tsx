"use client";

import { useMemo, useState } from "react";
import GuideCard from "@/components/care-guide/GuideCard";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import { SearchIcon } from "@/components/care-guide/icons";
import { useGuides } from "@/lib/care-guide/use-guides";
import type { GuideCategory } from "@/lib/care-guide/types";

const CATEGORIES: Array<GuideCategory | "전체"> = ["전체", "검사", "수술", "입원", "퇴원", "복약", "생활안내"];

export default function LibraryPage() {
  const { guides } = useGuides();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [department, setDepartment] = useState("전체");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => g.departments.forEach((d) => set.add(d)));
    return ["전체", ...Array.from(set)];
  }, [guides]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((g) => {
      const matchesCategory = category === "전체" || g.category === category;
      const matchesDept = department === "전체" || g.departments.includes(department as never);
      const matchesQuery =
        q === "" || g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q);
      return matchesCategory && matchesDept && matchesQuery;
    });
  }, [guides, query, category, department]);

  const previewGuide = previewId ? guides.find((g) => g.contentId === previewId) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">환자 안내 콘텐츠</h1>
        <p className="mt-1 text-sm text-slate-500">검사, 수술, 입원, 복약 등 상황별 안내를 검색해보세요.</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">콘텐츠 검색</span>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검사, 수술, 입원, 복약 등 검색"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  category === c
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-brand-blue"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === "전체" ? "진료과 전체" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          검색 조건에 맞는 안내가 없습니다.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide) => (
            <GuideCard key={guide.contentId} guide={guide} onPreview={() => setPreviewId(guide.contentId)} showStatus />
          ))}
        </div>
      )}

      {previewGuide && (
        <GuidePreviewModal guide={previewGuide} allGuides={guides} onClose={() => setPreviewId(null)} />
      )}
    </div>
  );
}
