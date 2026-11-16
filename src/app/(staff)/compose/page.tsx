"use client";

import { ArrowDown, ArrowUp, Check, Download, Eye, GripVertical, ListChecks, Plus, Printer, Save, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import MedicalReviewChip from "@/components/care-guide/MedicalReviewChip";
import Modal from "@/components/care-guide/modals/Modal";
import ProvidedRecordButton from "@/components/care-guide/ProvidedRecordButton";
import { formatDate, todayKst } from "@/lib/care-guide/format";
import { isMedicalReviewPending } from "@/lib/care-guide/review";
import { postActivity, saveBundleApi, useLibrary } from "@/lib/care-guide/me-api";
import { buildContentUrl } from "@/lib/care-guide/notification-service";
import { useRole } from "@/lib/care-guide/role";
import { EMPTY_FILTERS, filterGuides, type GuideFilters } from "@/lib/care-guide/search";
import { JOURNEY_STAGES, TOPICS } from "@/lib/care-guide/taxonomy";
import type { GuideContent, JourneyStageId, TopicId } from "@/lib/care-guide/types";
import { useGuides } from "@/lib/care-guide/use-guides";

const PAGE_SIZE = 24;
const DRAFT_KEY = "hycg.compose.draft.v1";

interface Draft {
  selected: string[];
  title: string;
  description: string;
  bundleId: string | null;
}

const chipBase =
  "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40";
const chipOn = "border-brand-blue bg-blue-soft text-brand-blue-dark";
const chipOff = "border-slate-200 bg-white text-slate-600 hover:border-brand-blue/30 hover:bg-blue-soft/60";
const smallBtn =
  "inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40";

export default function ComposePage() {
  const { guides } = useGuides();
  const role = useRole();
  const { data: library, status: libStatus } = useLibrary();

  const [filters, setFilters] = useState<GuideFilters>(EMPTY_FILTERS);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bundleId, setBundleId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  // 끌기가 시작된 위치는 화면 갱신을 기다리지 않도록 ref에도 보관합니다.
  const dragFromRef = useRef<number | null>(null);

  const byId = useMemo(() => new Map(guides.map((g) => [g.contentId, g])), [guides]);
  const matches = useMemo(() => filterGuides(guides, filters), [guides, filters]);
  const shown = matches.slice(0, visible);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const previewGuide = previewId ? byId.get(previewId) : undefined;

  // 처음 열 때: 저장된 묶음(?bundle=)이 있으면 불러오고, 없으면 이 탭에서 작성하던 초안을 복원합니다.
  useEffect(() => {
    if (hydrated) return;
    const wanted = new URLSearchParams(window.location.search).get("bundle");
    if (wanted) {
      if (libStatus !== "ready") return; // 보관함이 도착한 뒤에 다시 시도
      const b = library.bundles.find((x) => x.id === wanted);
      if (b) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelected(b.contentIds);
        setTitle(b.title);
        setDescription(b.description);
        setBundleId(b.id);
      } else {
        setNotice({ kind: "error", text: "저장된 자료 묶음을 찾을 수 없습니다." });
      }
    } else {
      try {
        const raw = window.sessionStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw) as Draft;
          setSelected(Array.isArray(d.selected) ? d.selected : []);
          setTitle(d.title ?? "");
          setDescription(d.description ?? "");
          setBundleId(d.bundleId ?? null);
        }
      } catch {
        // 초안을 읽지 못해도 빈 상태로 시작합니다.
      }
    }
    setHydrated(true);
  }, [hydrated, libStatus, library.bundles]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ selected, title, description, bundleId } satisfies Draft));
    } catch {
      // 저장 공간이 없어도 화면 동작에는 영향이 없습니다.
    }
  }, [hydrated, selected, title, description, bundleId]);

  /** 열람(미리보기)할 수 있는 자료: 게시 중이거나 관리자 */
  const canView = (g: GuideContent | undefined): g is GuideContent => Boolean(g) && (g!.status === "게시" || role === "ADMIN");
  /** 구성·인쇄·내려받기에 쓸 수 있는 자료: 열람 가능 + 의료진 검토 대기가 아닌 자료 */
  const canUse = (g: GuideContent | undefined): boolean => canView(g) && !isMedicalReviewPending(g);
  const items = selected.map((id) => ({ id, guide: byId.get(id) }));
  const usable = items.filter((i) => canUse(i.guide)) as Array<{ id: string; guide: GuideContent }>;
  /** 담겨 있지만 검토 대기라 저장·인쇄에서 빠지는 자료 수 */
  const waitingInSelection = items.filter((i) => canView(i.guide) && isMedicalReviewPending(i.guide)).length;

  function toggleSelect(id: string) {
    setNotice(null);
    // 검토 대기 자료는 새로 담을 수 없습니다(이미 담겨 있다면 해제는 가능).
    if (!selected.includes(id) && isMedicalReviewPending(byId.get(id))) {
      setNotice({ kind: "error", text: "의료진 검토 대기 중인 자료는 검토 완료 후 안내자료 구성에 담을 수 있습니다. 미리보기로 내용은 확인할 수 있습니다." });
      return;
    }
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= selected.length || from === to) return;
    setSelected((cur) => {
      const next = cur.slice();
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }

  function resetAll() {
    setSelected([]);
    setTitle("");
    setDescription("");
    setBundleId(null);
    setNotice(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function loadBundle(id: string) {
    const b = library.bundles.find((x) => x.id === id);
    if (!b) return;
    setSelected(b.contentIds);
    setTitle(b.title);
    setDescription(b.description);
    setBundleId(b.id);
    setNotice({ kind: "ok", text: `‘${b.title}’을 불러왔습니다.` });
    window.history.replaceState(null, "", `?bundle=${encodeURIComponent(b.id)}`);
  }

  const related = usable.map((u) => ({ contentId: u.id, title: u.guide.title }));
  const effectiveTitle = title.trim() || `안내자료 구성 (${usable.length}건)`;

  async function save() {
    setNotice(null);
    if (title.trim().length < 2) return setNotice({ kind: "error", text: "자료 묶음 제목을 2자 이상 입력해 주세요." });
    if (usable.length === 0) return setNotice({ kind: "error", text: "저장할 안내자료를 1건 이상 선택해 주세요." });
    setBusy(true);
    const r = await saveBundleApi({
      id: bundleId ?? undefined,
      title: title.trim(),
      description: description.trim(),
      contentIds: usable.map((u) => u.id),
      related,
    });
    setBusy(false);
    if (!r.ok) return setNotice({ kind: "error", text: r.error });
    setBundleId(r.bundle.id);
    setSelected(r.bundle.contentIds);
    setNotice({ kind: "ok", text: "저장했습니다. ‘내 보관함 → 나만의 자료 묶음’과 ‘발송·활용 이력’에서 확인할 수 있습니다." });
  }

  function download() {
    if (usable.length === 0) return;
    const lines = [
      effectiveTitle,
      `작성일 ${todayKst()}`,
      description.trim() ? `\n${description.trim()}` : "",
      "",
      ...usable.flatMap((u, i) => [`${i + 1}. ${u.guide.title}`, `   ${u.guide.summary}`, `   ${buildContentUrl(u.guide.slug)}`, ""]),
      "※ 이 목록에는 환자 정보가 포함되어 있지 않습니다.",
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `안내자료-구성-${todayKst().replaceAll("-", "")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    void postActivity({ type: "download", title: effectiveTitle, bundleId: bundleId ?? undefined, related });
    setNotice({ kind: "ok", text: "구성 목록(.txt)을 내려받았습니다." });
  }

  const printHref =
    `/compose/print?ids=${encodeURIComponent(usable.map((u) => u.id).join(","))}` + (title.trim() ? `&title=${encodeURIComponent(title.trim())}` : "");

  const panel = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">
          선택한 자료 <span className="text-brand-blue-dark">{selected.length}</span>건
        </h2>
        {selected.length > 0 && (
          <button type="button" onClick={resetAll} className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline">
            전체 비우기
          </button>
        )}
      </div>

      {library.bundles.length > 0 && (
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          저장된 구성 불러오기
          <select
            value=""
            onChange={(e) => e.target.value && loadBundle(e.target.value)}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-2.5 text-sm font-normal"
          >
            <option value="">선택하세요</option>
            {library.bundles.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.contentIds.length}건 · {formatDate(b.updatedAt)})
              </option>
            ))}
          </select>
        </label>
      )}

      {selected.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          왼쪽 목록에서 안내자료를 선택하면 이곳에 순서대로 담깁니다.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5" aria-label="선택한 안내자료 순서">
          {items.map(({ id, guide }, index) => (
            <li
              key={id}
              draggable
              onDragStart={() => {
                dragFromRef.current = index;
                setDragFrom(index);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFromRef.current !== null) move(dragFromRef.current, index);
                dragFromRef.current = null;
                setDragFrom(null);
                setDragOver(null);
              }}
              onDragEnd={() => {
                dragFromRef.current = null;
                setDragFrom(null);
                setDragOver(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg border bg-white p-2 ${
                dragOver === index && dragFrom !== index ? "border-brand-blue bg-blue-soft/50" : "border-slate-200"
              } ${dragFrom === index ? "opacity-50" : ""}`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-400" aria-hidden="true" />
              <span className="w-5 shrink-0 text-center text-xs font-bold text-slate-500">{index + 1}</span>
              <div className="min-w-0 flex-1">
                {canView(guide) && canUse(guide) ? (
                  <p className="text-[13px] font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere]">{guide.title}</p>
                ) : canView(guide) ? (
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-[13px] font-semibold leading-snug text-slate-600 [overflow-wrap:anywhere]">{guide.title}</p>
                    <MedicalReviewChip guide={guide} />
                    <p className="text-xs text-slate-600">검토 완료 전에는 저장·인쇄에서 제외됩니다</p>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-amber-800">열람할 수 없는 자료(비공개·삭제) — 저장 시 제외됩니다</p>
                )}
              </div>
              {canView(guide) && (
                <button type="button" onClick={() => setPreviewId(id)} className={smallBtn} aria-label={`${guide.title} 미리보기`}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className={smallBtn} aria-label="위로 이동">
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === items.length - 1}
                className={smallBtn}
                aria-label="아래로 이동"
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => toggleSelect(id)} className={`${smallBtn} text-rose-700`} aria-label="선택 해제">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}
      {waitingInSelection > 0 && (
        <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
          의료진 검토 대기 자료 {waitingInSelection}건은 저장·인쇄·내려받기에서 제외됩니다. 검토 완료 후 다시 담아 주세요.
        </p>
      )}
      {selected.length > 1 && <p className="text-xs text-slate-500">끌어서 놓거나 위·아래 버튼으로 순서를 바꿀 수 있습니다.</p>}

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          자료 묶음 제목
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            placeholder="예: 입원 환자 기본 안내"
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 text-sm font-normal focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          설명 (선택)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="어떤 상황에 쓰는 묶음인지 적어 두세요."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
          />
        </label>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          제목·설명에 환자 이름, 등록번호, 생년월일, 연락처를 입력하지 마세요. 자료 묶음은 일반 안내자료의 조합만 저장하며, 저장하면 <b>나만 볼 수 있는 개인 묶음</b>이 됩니다.
        </p>

        {notice && (
          <p
            role={notice.kind === "error" ? "alert" : "status"}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
              notice.kind === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"
            }`}
          >
            {notice.text}
          </p>
        )}

        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {busy ? "저장 중…" : bundleId ? "변경 내용 저장" : "자료 묶음 저장"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {usable.length > 0 ? (
            <Link
              href={printHref}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              인쇄용 화면
            </Link>
          ) : (
            <span className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-slate-200 px-3 text-sm font-bold text-slate-400">
              <Printer className="h-4 w-4" aria-hidden="true" />
              인쇄용 화면
            </span>
          )}
          <button
            type="button"
            onClick={download}
            disabled={usable.length === 0}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            목록 내려받기
          </button>
        </div>
        {usable.length > 0 && (
          <ProvidedRecordButton
            title={effectiveTitle}
            bundleId={bundleId ?? undefined}
            related={related}
            label="이 구성으로 안내 제공 기록"
            className="w-full"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">안내자료 구성</h1>
        <p className="mt-1 text-sm text-slate-600">환자의 병원 이용 단계에 맞춰 필요한 안내자료를 선택하고 하나의 목록으로 준비하세요.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">안내자료 검색</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => {
                setFilters((f) => ({ ...f, query: e.target.value }));
                setVisible(PAGE_SIZE);
              }}
              placeholder="검사, 수술, 입원, 퇴원 등 검색"
              className="h-[48px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="여정 단계">
            <span className="text-xs font-semibold text-slate-500">여정 단계</span>
            <button
              type="button"
              aria-pressed={filters.journeys.length === 0}
              onClick={() => setFilters((f) => ({ ...f, journeys: [] }))}
              className={`${chipBase} ${filters.journeys.length === 0 ? chipOn : chipOff}`}
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
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      journeys: on ? f.journeys.filter((v) => v !== s.id) : [...f.journeys, s.id as JourneyStageId],
                    }))
                  }
                  className={`${chipBase} ${on ? chipOn : chipOff}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="주제"
              value={filters.topics[0] ?? "전체"}
              onChange={(e) => setFilters((f) => ({ ...f, topics: e.target.value === "전체" ? [] : [e.target.value as TopicId] }))}
              className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="전체">주제 전체</option>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-xs font-medium text-slate-600" aria-live="polite">
              {matches.length}건의 안내자료 · {selected.length}건 선택됨
            </p>
          </div>

          {matches.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
              조건에 맞는 안내자료가 없습니다. 검색어나 단계·주제를 바꿔 보세요.
            </p>
          ) : (
            <>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
                {shown.map((g) => {
                  const on = selectedSet.has(g.contentId);
                  const waiting = isMedicalReviewPending(g);
                  return (
                    <li key={g.contentId}>
                      <div
                        className={`flex h-full flex-col gap-2 rounded-lg border p-4 transition-colors ${
                          waiting
                            ? "border-slate-200 bg-slate-50"
                            : on
                              ? "border-brand-blue bg-blue-soft/40"
                              : "border-slate-200 bg-white hover:border-brand-blue/30"
                        }`}
                      >
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          aria-disabled={waiting}
                          onClick={() => toggleSelect(g.contentId)}
                          className={`flex items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${waiting ? "cursor-not-allowed" : ""}`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                              waiting
                                ? "border-dashed border-slate-300 bg-white"
                                : on
                                  ? "border-brand-blue bg-brand-blue text-white"
                                  : "border-slate-300 bg-white"
                            }`}
                          >
                            {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[15px] font-bold leading-snug text-slate-900 [overflow-wrap:anywhere]">{g.title}</span>
                            <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-slate-600">{g.summary}</span>
                            {waiting && (
                              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <MedicalReviewChip guide={g} />
                                <span className="text-xs text-slate-600">검토 완료 후 담을 수 있음</span>
                              </span>
                            )}
                          </span>
                        </button>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="truncate text-xs font-medium text-slate-500">
                            {g.category} · {g.subcategory}
                          </span>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {on && <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[11px] font-bold text-white">{selected.indexOf(g.contentId) + 1}번째 선택</span>}
                            <button
                              type="button"
                              onClick={() => setPreviewId(g.contentId)}
                              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-brand-blue-dark hover:bg-blue-soft/60"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              미리보기
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {matches.length > shown.length && (
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE_SIZE)}
                  className="mx-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-brand-blue/40 bg-white px-6 text-sm font-bold text-brand-blue-dark hover:bg-blue-soft"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {matches.length - shown.length}건 더 보기
                </button>
              )}
            </>
          )}
        </div>

        <aside
          className="hidden rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
          aria-label="선택한 안내자료"
        >
          {panel}
        </aside>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          선택 자료 확인 ({selected.length})
        </button>
      </div>

      {sheetOpen && (
        <Modal onClose={() => setSheetOpen(false)} ariaLabel="선택한 안내자료" maxWidthClassName="sm:max-w-lg">
          {(requestClose) => (
            <div className="p-4 sm:p-6">
              <div className="mb-3 flex justify-end">
                <button type="button" onClick={requestClose} className={smallBtn} aria-label="닫기">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {panel}
            </div>
          )}
        </Modal>
      )}

      {previewGuide && <GuidePreviewModal guide={previewGuide} allGuides={guides} onClose={() => setPreviewId(null)} />}
    </div>
  );
}
