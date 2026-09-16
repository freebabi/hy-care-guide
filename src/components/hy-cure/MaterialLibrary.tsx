"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, MATERIALS } from "@/lib/hy-cure-data";
import MaterialCard from "./MaterialCard";
import MaterialPreviewModal from "./modals/MaterialPreviewModal";

export default function MaterialLibrary() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MATERIALS.filter((material) => {
      const matchesCategory = category === "전체" || material.category === category;
      const matchesQuery =
        q === "" ||
        material.title.toLowerCase().includes(q) ||
        material.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const previewMaterial = MATERIALS.find((m) => m.id === previewId) ?? null;

  return (
    <section id="library" className="scroll-mt-24 bg-slate-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            교육자료 라이브러리
          </h2>
          <p className="mt-2 text-slate-600">
            표준 교육자료 500여 개를 검색하고 카테고리별로 필터링해 미리 확인해보세요.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">교육자료 검색</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목이나 태그로 검색 (예: 내시경, 복약지도)"
              className="w-full rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>

          <div role="tablist" aria-label="교육자료 카테고리" className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  category === c
                    ? "border-brand-blue bg-brand-blue text-white shadow-sm shadow-brand-blue/30"
                    : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-brand-blue hover:text-brand-blue"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <p className="animate-fade-in rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
              검색 조건에 맞는 교육자료가 없습니다. 다른 검색어나 카테고리를 선택해보세요.
            </p>
          ) : (
            <div key={`${category}|${query}`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((material, index) => (
                <div
                  key={material.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >
                  <MaterialCard material={material} onPreview={() => setPreviewId(material.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewMaterial && (
        <MaterialPreviewModal material={previewMaterial} onClose={() => setPreviewId(null)} />
      )}
    </section>
  );
}
