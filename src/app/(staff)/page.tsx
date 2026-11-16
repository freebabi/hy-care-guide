"use client";

import { useEffect, useMemo, useState } from "react";
import GuideCard from "@/components/care-guide/GuideCard";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import { CloseIcon, InfoIcon, SearchIcon } from "@/components/care-guide/icons";
import GuideFormModal from "@/components/care-guide/staff/GuideFormModal";
import { nextContentId, upsertGuide } from "@/lib/care-guide/cms-store";
import { useRole } from "@/lib/care-guide/role";
import { EMPTY_FILTERS, countByTopic, filterGuides, type GuideFilters } from "@/lib/care-guide/search";
import { JOURNEY_BY_ID, JOURNEY_STAGES, TOPICS, TOPIC_BY_ID } from "@/lib/care-guide/taxonomy";
import type { GuideCategory, GuideContent, JourneyStageId, TopicId } from "@/lib/care-guide/types";
import { useGuides } from "@/lib/care-guide/use-guides";

const CATEGORIES: Array<GuideCategory | "전체"> = ["전체", "검사", "수술", "입원", "퇴원", "기타"];
/** 한 번에 보여주는 카드 수. 자료가 늘어도 화면이 끝없이 길어지지 않도록 "더 보기"로 나눕니다. */
const PAGE_SIZE = 12;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** 새로고침해도 조건이 유지되고 주소를 복사해 공유할 수 있도록, 필터를 주소(?q=&j=&t=&c=&d=)에 저장합니다. */
function readFiltersFromUrl(): GuideFilters {
  const p = new URLSearchParams(window.location.search);
  const journeys = (p.get("j") ?? "").split(",").filter((id): id is JourneyStageId => JOURNEY_BY_ID.has(id as JourneyStageId));
  const topics = (p.get("t") ?? "").split(",").filter((id): id is TopicId => TOPIC_BY_ID.has(id as TopicId));
  const category = p.get("c");
  return {
    query: p.get("q") ?? "",
    journeys,
    topics,
    category: CATEGORIES.includes(category as GuideCategory) ? (category as GuideCategory) : "전체",
    department: p.get("d") ?? "전체",
  };
}

function writeFiltersToUrl(f: GuideFilters) {
  const p = new URLSearchParams();
  if (f.query.trim()) p.set("q", f.query);
  if (f.journeys.length) p.set("j", f.journeys.join(","));
  if (f.topics.length) p.set("t", f.topics.join(","));
  if (f.category !== "전체") p.set("c", f.category);
  if (f.department !== "전체") p.set("d", f.department);
  const qs = p.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

export default function StaffHomePage() {
  const { guides, refresh } = useGuides();
  const role = useRole();
  const [filters, setFilters] = useState<GuideFilters>(EMPTY_FILTERS);
  const [urlReady, setUrlReady] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingGuide, setEditingGuide] = useState<GuideContent | null>(null);

  // 첫 화면이 뜬 뒤 주소에 저장된 조건을 한 번 읽어 옵니다(서버 렌더와 어긋나지 않도록 마운트 후 적용).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(readFiltersFromUrl());
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (urlReady) writeFiltersToUrl(filters);
  }, [filters, urlReady]);

  // 조건이 바뀌면 표시 개수를 첫 페이지로 되돌립니다. (렌더 중 파생 상태 초기화 패턴)
  const filterKey = JSON.stringify(filters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const departments = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => g.departments.forEach((d) => set.add(d)));
    return ["전체", ...Array.from(set)];
  }, [guides]);

  const topicCounts = useMemo(() => countByTopic(guides), [guides]);
  const publishedCount = useMemo(() => guides.filter((g) => g.status === "게시").length, [guides]);
  const filtered = useMemo(() => filterGuides(guides, filters), [guides, filters]);
  const visibleGuides = filtered.slice(0, visibleCount);
  const previewGuide = previewId ? guides.find((g) => g.contentId === previewId) : null;

  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [
    ...(filters.query.trim()
      ? [{ key: "q", label: `검색 “${filters.query.trim()}”`, onRemove: () => setFilters((f) => ({ ...f, query: "" })) }]
      : []),
    ...(filters.category !== "전체"
      ? [{ key: "c", label: filters.category, onRemove: () => setFilters((f) => ({ ...f, category: "전체" as const })) }]
      : []),
    ...(filters.department !== "전체"
      ? [{ key: "d", label: filters.department, onRemove: () => setFilters((f) => ({ ...f, department: "전체" })) }]
      : []),
    ...filters.journeys.map((id) => ({
      key: `j-${id}`,
      label: `단계 · ${JOURNEY_BY_ID.get(id)?.label ?? id}`,
      onRemove: () => setFilters((f) => ({ ...f, journeys: f.journeys.filter((v) => v !== id) })),
    })),
    ...filters.topics.map((id) => ({
      key: `t-${id}`,
      label: `주제 · ${TOPIC_BY_ID.get(id)?.label ?? id}`,
      onRemove: () => setFilters((f) => ({ ...f, topics: f.topics.filter((v) => v !== id) })),
    })),
  ];
  const hasFilters = activeChips.length > 0;

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
  }

  const chipBase =
    "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px";
  const chipInactive =
    "border-slate-200 bg-white text-slate-600 hover:border-brand-blue/30 hover:bg-blue-soft/60 hover:text-brand-blue-dark";
  // 1차 필터(카테고리): 브랜드 블루 solid fill로 가장 강한 위계
  const chipActivePrimary = "border-brand-blue bg-brand-blue text-white";
  // 2차 필터(여정 단계): soft blue 배경 + 네이비 텍스트로 1차보다 한 단계 낮은 위계
  const chipActiveSecondary = "border-blue-soft bg-blue-soft text-brand-blue-dark";
  const selectClass =
    "rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 outline-none transition-colors hover:border-brand-blue/30 focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/20";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">환자 안내 콘텐츠</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          환자의 여정에 깊이를 더하다. 지금, 필요한 안내를 전하는 HY Care Guide
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <p className="flex max-w-2xl items-start gap-1.5 text-xs leading-relaxed text-slate-500">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
          환자 정보는 병원 기존 시스템에서 확인하고, HY CARE GUIDE에서는 전달할 안내 콘텐츠를
          검색·미리보기하고 전달을 준비합니다.
        </p>

        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">콘텐츠 검색</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder="검사, 수술, 입원, 퇴원 등 검색"
            className="h-[50px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-500 focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10"
          />
        </label>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="대표 카테고리">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filters.category === c}
                  onClick={() => setFilters((f) => ({ ...f, category: c }))}
                  className={`${chipBase} ${filters.category === c ? chipActivePrimary : chipInactive}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <select
              aria-label="진료과"
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
              className={selectClass}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "전체" ? "진료과 전체" : d}
                </option>
              ))}
            </select>

            <select
              aria-label="주제"
              value={filters.topics[0] ?? "전체"}
              onChange={(e) =>
                setFilters((f) => ({ ...f, topics: e.target.value === "전체" ? [] : [e.target.value as TopicId] }))
              }
              className={selectClass}
            >
              <option value="전체">주제 전체</option>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id} disabled={(topicCounts.get(t.id) ?? 0) === 0 && filters.topics[0] !== t.id}>
                  {t.label} ({topicCounts.get(t.id) ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="여정 단계">
            <span className="text-xs font-semibold text-slate-500">여정 단계</span>
            <button
              type="button"
              aria-pressed={filters.journeys.length === 0}
              onClick={() => setFilters((f) => ({ ...f, journeys: [] }))}
              className={`${chipBase} ${filters.journeys.length === 0 ? chipActiveSecondary : chipInactive}`}
            >
              전체
            </button>
            {JOURNEY_STAGES.map((s) => {
              const on = filters.journeys.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilters((f) => ({ ...f, journeys: toggle(f.journeys, s.id) }))}
                  className={`${chipBase} ${on ? chipActiveSecondary : chipInactive}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`flex flex-col gap-4 ${urlReady ? "" : "invisible"}`} aria-busy={!urlReady}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-live="polite">
          <p className="text-xs font-medium text-slate-600">
            {filtered.length}건의 안내
            {hasFilters && <span className="text-slate-500"> · 전체 {publishedCount}건 중</span>}
          </p>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full bg-blue-soft py-0.5 pl-3 pr-1 text-xs font-semibold text-brand-blue-dark"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`${chip.label} 조건 해제`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full px-2 py-1 text-xs font-bold text-brand-blue-dark underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            >
              전체 초기화
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div
            key={filterKey}
            className="animate-content-swap flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white px-6 py-14 text-center"
          >
            <SearchIcon className="h-6 w-6 text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-700">선택한 조건에 해당하는 안내자료가 아직 없습니다.</p>
              <p className="mt-1 text-xs text-slate-600">
                검사명, 수술명 또는 안내 내용으로 검색하거나 다른 여정 단계·주제를 선택해보세요.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-brand-blue transition-colors hover:bg-blue-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px"
            >
              전체 콘텐츠 보기
            </button>
          </div>
        ) : (
          <>
            <div
              key={filterKey}
              className="animate-content-swap grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            >
              {visibleGuides.map((guide) => (
                <GuideCard
                  key={guide.contentId}
                  guide={guide}
                  onPreview={() => setPreviewId(guide.contentId)}
                  onEdit={role === "ADMIN" ? () => setEditingGuide(guide) : undefined}
                />
              ))}
            </div>
            {filtered.length > visibleGuides.length && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-xs font-medium text-slate-600">
                  {filtered.length}건 중 {visibleGuides.length}건 표시
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="min-h-[44px] rounded-full border border-brand-blue/40 bg-white px-6 py-2.5 text-sm font-bold text-brand-blue-dark transition-colors hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 active:translate-y-px"
                >
                  안내자료 {Math.min(PAGE_SIZE, filtered.length - visibleGuides.length)}건 더 보기
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {previewGuide && (
        <GuidePreviewModal guide={previewGuide} allGuides={guides} onClose={() => setPreviewId(null)} />
      )}

      {editingGuide && role === "ADMIN" && (
        <GuideFormModal
          initialGuide={editingGuide}
          nextId={nextContentId(guides)}
          existingSlugs={guides.filter((g) => g.contentId !== editingGuide.contentId).map((g) => g.slug)}
          otherGuides={guides.filter((g) => g.contentId !== editingGuide.contentId)}
          onClose={() => setEditingGuide(null)}
          onSave={async (guide, note) => {
            await upsertGuide(guide, note);
            await refresh();
            setEditingGuide(null);
          }}
        />
      )}
    </div>
  );
}
