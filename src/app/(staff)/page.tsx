"use client";

import { useMemo, useState } from "react";
import GuideCard from "@/components/care-guide/GuideCard";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import { SearchIcon } from "@/components/care-guide/icons";
import GuideFormModal from "@/components/care-guide/staff/GuideFormModal";
import { nextContentId, upsertGuide } from "@/lib/care-guide/cms-store";
import { useGuides } from "@/lib/care-guide/use-guides";
import { STAGES, type GuideCategory, type GuideContent, type StageCode } from "@/lib/care-guide/types";

const CATEGORIES: Array<GuideCategory | "전체"> = ["전체", "검사", "수술", "입원", "퇴원", "기타"];
const STAGE_LIST = Object.values(STAGES);

export default function StaffHomePage() {
  const { guides, refresh } = useGuides();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [department, setDepartment] = useState("전체");
  const [stage, setStage] = useState<StageCode | "전체">("전체");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingGuide, setEditingGuide] = useState<GuideContent | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => g.departments.forEach((d) => set.add(d)));
    return ["전체", ...Array.from(set)];
  }, [guides]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((g) => {
      if (g.status !== "게시") return false;
      const matchesCategory = category === "전체" || g.category === category;
      const matchesDept = department === "전체" || g.departments.includes(department as never);
      const matchesStage = stage === "전체" || g.patientStages.includes(stage);
      const matchesQuery =
        q === "" ||
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.subcategory.toLowerCase().includes(q);
      return matchesCategory && matchesDept && matchesStage && matchesQuery;
    });
  }, [guides, query, category, department, stage]);

  const previewGuide = previewId ? guides.find((g) => g.contentId === previewId) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">환자 안내 콘텐츠</h1>
        <p className="mt-1 text-sm text-slate-400">
          환자의 여정에 깊이를 더하다. 지금, 필요한 안내를 전하는 HY Care Guide
        </p>
        <p className="mt-3 max-w-xl rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500">
          환자 정보는 병원 기존 시스템에서 확인하고, HY CARE GUIDE에서는 환자에게 전달할 안내
          콘텐츠를 검색·미리보기하고 전달을 준비합니다.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">콘텐츠 검색</span>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검사, 수술, 입원, 퇴원 등 검색"
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">여정 단계</span>
          <button
            type="button"
            onClick={() => setStage("전체")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              stage === "전체"
                ? "border-brand-teal bg-brand-teal text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-brand-teal hover:text-brand-teal"
            }`}
          >
            전체
          </button>
          {STAGE_LIST.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setStage(s.code)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                stage === s.code
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-brand-teal hover:text-brand-teal"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400">{filtered.length}건의 안내</p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          검색 조건에 맞는 안내가 없습니다.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide) => (
            <GuideCard
              key={guide.contentId}
              guide={guide}
              onPreview={() => setPreviewId(guide.contentId)}
              onEdit={() => setEditingGuide(guide)}
            />
          ))}
        </div>
      )}

      {previewGuide && (
        <GuidePreviewModal guide={previewGuide} allGuides={guides} onClose={() => setPreviewId(null)} />
      )}

      {editingGuide && (
        <GuideFormModal
          initialGuide={editingGuide}
          nextId={nextContentId(guides)}
          onClose={() => setEditingGuide(null)}
          onSave={(guide) => {
            upsertGuide(guide);
            refresh();
            setEditingGuide(null);
          }}
        />
      )}
    </div>
  );
}
