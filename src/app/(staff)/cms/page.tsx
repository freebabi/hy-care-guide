"use client";

import { useMemo, useState } from "react";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import { CategoryIcon, SearchIcon } from "@/components/care-guide/icons";
import GuideFormModal from "@/components/care-guide/staff/GuideFormModal";
import { nextContentId, toggleGuideStatus, upsertGuide } from "@/lib/care-guide/cms-store";
import { useGuides } from "@/lib/care-guide/use-guides";
import type { GuideContent } from "@/lib/care-guide/types";

export default function CmsPage() {
  const { guides, refresh } = useGuides();
  const [query, setQuery] = useState("");
  const [editingGuide, setEditingGuide] = useState<GuideContent | null | "new">(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) => g.title.toLowerCase().includes(q));
  }, [guides, query]);

  const previewGuide = previewId ? guides.find((g) => g.contentId === previewId) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">콘텐츠 관리</h1>
          <p className="mt-1 text-sm text-slate-500">환자 안내 콘텐츠를 등록, 수정, 게시할 수 있습니다.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditingGuide("new")}
          className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-blue-dark"
        >
          + 새 콘텐츠 등록
        </button>
      </div>

      <label className="relative block w-full sm:max-w-md">
        <span className="sr-only">콘텐츠 검색</span>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목으로 검색"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </label>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">버전</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
            {filtered.map((g) => (
              <tr key={g.contentId}>
                <td className="px-4 py-3 font-semibold text-slate-800">{g.title}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <CategoryIcon category={g.category} className="h-3.5 w-3.5" />
                    {g.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">/c/{g.slug}</td>
                <td className="px-4 py-3 text-slate-400">v{g.version}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      toggleGuideStatus(g.contentId);
                      refresh();
                    }}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      g.status === "게시" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {g.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setPreviewId(g.contentId)}
                    className="mr-3 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    미리보기
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGuide(g)}
                    className="text-xs font-semibold text-brand-blue hover:underline"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewGuide && (
        <GuidePreviewModal
          guide={previewGuide}
          allGuides={guides}
          onClose={() => setPreviewId(null)}
          showSendAction={false}
        />
      )}

      {editingGuide && (
        <GuideFormModal
          initialGuide={editingGuide === "new" ? null : editingGuide}
          nextId={nextContentId(guides)}
          existingSlugs={guides
            .filter((g) => editingGuide === "new" || g.contentId !== editingGuide.contentId)
            .map((g) => g.slug)}
          otherGuides={guides.filter(
            (g) => editingGuide === "new" || g.contentId !== editingGuide.contentId,
          )}
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
