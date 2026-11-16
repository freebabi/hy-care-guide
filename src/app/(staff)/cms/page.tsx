"use client";

import { useEffect, useMemo, useState } from "react";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import MedicalReviewChip from "@/components/care-guide/MedicalReviewChip";
import { CategoryIcon, SearchIcon } from "@/components/care-guide/icons";
import GuideFormModal from "@/components/care-guide/staff/GuideFormModal";
import Link from "next/link";
import { nextContentId, restoreGuide, retireGuide, toggleGuideStatus, upsertGuide } from "@/lib/care-guide/cms-store";
import { useRole } from "@/lib/care-guide/role";
import { classificationReviewReason, needsClassificationReview } from "@/lib/care-guide/classification";
import { IMAGE_APPROVAL_LABEL, IMAGE_ASSETS } from "@/lib/care-guide/image-assets";
import { REVIEW_STATUS_LABEL, REVIEW_STATUS_ORDER, isMedicalReviewPending, reviewBadgeClass, reviewStatusOf } from "@/lib/care-guide/review";
import { guideJourneyIds, guideTopicIds } from "@/lib/care-guide/search";
import ServerDataPanel from "@/components/care-guide/staff/ServerDataPanel";
import { useGuides } from "@/lib/care-guide/use-guides";
import type { GuideContent, ReviewStatus } from "@/lib/care-guide/types";
import { withBasePath } from "@/lib/care-guide/base-path";

export default function CmsPage() {
  const { guides } = useGuides();
  const role = useRole();
  const [query, setQuery] = useState("");
  const [onlyReview, setOnlyReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | "all">("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "게시" | "비게시">("all");
  const [medicalFilter, setMedicalFilter] = useState<"all" | "pending" | "completed">("all");
  const [editingGuide, setEditingGuide] = useState<GuideContent | null | "new">(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [assetsOpen, setAssetsOpen] = useState(false);

  const reviewCount = useMemo(() => guides.filter(needsClassificationReview).length, [guides]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((g) => {
      if (onlyReview && !needsClassificationReview(g)) return false;
      if (reviewFilter !== "all" && reviewStatusOf(g) !== reviewFilter) return false;
      if (publishFilter !== "all" && g.status !== publishFilter) return false;
      if (medicalFilter === "pending" && !isMedicalReviewPending(g)) return false;
      if (medicalFilter === "completed" && isMedicalReviewPending(g)) return false;
      if (!q) return true;
      return g.title.toLowerCase().includes(q) || (g.keywords ?? []).some((k) => k.toLowerCase().includes(q));
    });
  }, [guides, query, onlyReview, reviewFilter, publishFilter, medicalFilter]);

  const previewGuide = previewId ? guides.find((g) => g.contentId === previewId) : null;

  // 관리자 메뉴의 ‘안내 이미지 관리’(/cms#assets)로 들어오면 해당 영역을 펼치고 그 위치로 이동합니다.
  useEffect(() => {
    const openIfAssets = () => {
      if (window.location.hash !== "#assets") return;
      setAssetsOpen(true);
      // 화면 전환 직후 브라우저/Next가 맨 위로 되돌릴 수 있어, 몇 번 나누어 위치를 맞춥니다.
      [60, 300, 700].forEach((ms) =>
        timers.push(
          window.setTimeout(() => {
            const el = document.getElementById("assets");
            if (el && Math.abs(el.getBoundingClientRect().top) > 120) el.scrollIntoView({ block: "start" });
          }, ms),
        ),
      );
    };
    const timers: number[] = [];
    openIfAssets();
    window.addEventListener("hashchange", openIfAssets);
    window.addEventListener("popstate", openIfAssets);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("hashchange", openIfAssets);
      window.removeEventListener("popstate", openIfAssets);
    };
  }, []);

  if (role !== "ADMIN") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <h1 className="text-lg font-extrabold text-slate-900">관리자 전용 화면입니다</h1>
        <p className="text-sm leading-relaxed text-slate-700">
          안내 콘텐츠의 등록·수정·승인·폐기는 관리자만 할 수 있습니다. 내용에 고칠 점이 있다면 안내 상세 화면에서 ‘수정·개선 요청’을 남겨 주세요.
        </p>
        <Link href="/" className="mt-1 inline-flex min-h-[44px] items-center rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark">
          안내 목록으로
        </Link>
      </div>
    );
  }

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

      <ServerDataPanel />

      <label className="relative block w-full sm:max-w-md">
        <span className="sr-only">콘텐츠 검색</span>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 또는 키워드로 검색"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          검토 상태
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value as ReviewStatus | "all")}
            className="min-h-[36px] rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">전체</option>
            {REVIEW_STATUS_ORDER.map((st) => (
              <option key={st} value={st}>
                {REVIEW_STATUS_LABEL[st]} ({guides.filter((g) => reviewStatusOf(g) === st).length})
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          게시 상태
          <select
            value={publishFilter}
            onChange={(e) => setPublishFilter(e.target.value as "all" | "게시" | "비게시")}
            className="min-h-[36px] rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">전체</option>
            <option value="게시">게시</option>
            <option value="비게시">비게시</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          의료 검토
          <select
            value={medicalFilter}
            onChange={(e) => setMedicalFilter(e.target.value as "all" | "pending" | "completed")}
            className="min-h-[36px] rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700"
          >
            <option value="all">전체</option>
            <option value="pending">검토 대기 ({guides.filter((g) => isMedicalReviewPending(g)).length})</option>
            <option value="completed">검토 완료</option>
          </select>
        </label>
        <span className="text-xs text-slate-600">{filtered.length}건 표시</span>
      </div>

      <label className="flex w-fit items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900">
        <input
          type="checkbox"
          checked={onlyReview}
          onChange={(e) => setOnlyReview(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        분류 검토 대상만 보기 ({reviewCount}건)
      </label>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th className="whitespace-nowrap px-4 py-3">제목</th>
              <th className="whitespace-nowrap px-4 py-3">카테고리</th>
              <th className="whitespace-nowrap px-4 py-3">분류(여정·주제)</th>
              <th className="whitespace-nowrap px-4 py-3">URL</th>
              <th className="whitespace-nowrap px-4 py-3">버전</th>
              <th className="whitespace-nowrap px-4 py-3">검토 상태</th>
              <th className="whitespace-nowrap px-4 py-3">의료 검토</th>
              <th className="whitespace-nowrap px-4 py-3">상태</th>
              <th className="sticky right-0 whitespace-nowrap border-l border-slate-100 bg-slate-50 px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
            {filtered.map((g) => (
              <tr key={g.contentId}>
                <td className="min-w-[220px] px-4 py-3 font-semibold text-slate-800">{g.title}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <CategoryIcon category={g.category} className="h-3.5 w-3.5" />
                    {g.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                  <span>
                    여정 {guideJourneyIds(g).length} · 주제 {guideTopicIds(g).length}
                  </span>
                  {needsClassificationReview(g) && (
                    <span
                      title={classificationReviewReason(g) ?? undefined}
                      className="ml-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200"
                    >
                      분류 검토
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">/c/{g.slug}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">v{g.version}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${reviewBadgeClass(reviewStatusOf(g))}`}
                  >
                    {REVIEW_STATUS_LABEL[reviewStatusOf(g)]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                  {g.medicalReview ? <MedicalReviewChip guide={g} showCompleted /> : "—"}
                  {g.medicalReview === "completed" && g.medicalReviewedAt && <span className="ml-1.5">{g.medicalReviewedAt}</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await toggleGuideStatus(g.contentId);
                      } catch (e) {
                        window.alert(e instanceof Error ? e.message : "처리하지 못했습니다.");
                      }
                    }}
                    className={`min-h-[32px] rounded-full px-3 py-1 text-xs font-bold ${
                      g.status === "게시" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {g.status}
                  </button>
                </td>
                <td className="sticky right-0 whitespace-nowrap border-l border-slate-100 bg-white px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setPreviewId(g.contentId)}
                    className="mr-3 inline-flex min-h-[32px] items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    미리보기
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGuide(g)}
                    className="inline-flex min-h-[32px] items-center text-xs font-semibold text-brand-blue hover:underline"
                  >
                    수정
                  </button>
                  {reviewStatusOf(g) === "retired" && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`‘${g.title}’의 사용 종료를 해제할까요? 작성 중·미승인·비게시 상태로 돌아가며, 다시 게시하려면 검토·승인을 거쳐야 합니다.`)) {
                          try {
                            await restoreGuide(g.contentId);
                          } catch (e) {
                            window.alert(e instanceof Error ? e.message : "처리하지 못했습니다.");
                          }
                        }
                      }}
                      className="ml-3 inline-flex min-h-[32px] items-center text-xs font-semibold text-emerald-800 hover:underline"
                    >
                      복원
                    </button>
                  )}
                  {reviewStatusOf(g) !== "retired" && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`‘${g.title}’을(를) 사용 종료(폐기)할까요? 환자에게 더 이상 보이지 않으며, 데이터와 이력은 남습니다.`)) {
                          try {
                            await retireGuide(g.contentId);
                          } catch (e) {
                            window.alert(e instanceof Error ? e.message : "처리하지 못했습니다.");
                          }
                        }
                      }}
                      className="ml-3 inline-flex min-h-[32px] items-center text-xs font-semibold text-rose-700 hover:underline"
                    >
                      폐기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details
        id="assets"
        open={assetsOpen}
        onToggle={(e) => setAssetsOpen((e.currentTarget as HTMLDetailsElement).open)}
        className="scroll-mt-20 rounded-xl border border-slate-200 bg-white"
      >
        <summary className="flex min-h-[48px] cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm font-bold text-slate-900">
          <span>안내 이미지 관리 ({IMAGE_ASSETS.length}개)</span>
          <span aria-hidden="true" className="text-xs font-semibold text-brand-blue-dark">
            펼쳐서 보기 ▾
          </span>
        </summary>
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="mb-3 text-xs leading-relaxed text-slate-700">
            웹 화면에 쓰이는 이미지만 `public/assets/guides/`에 웹용 복사본으로 두고, 원본은 `reference-materials/`에 그대로 보관합니다. 사용 승인 상태가
            ‘부서 승인 전’인 이미지는 화면에 ‘승인 전 안내자료’ 표시가 붙습니다. (이 목록은 읽기 전용이며
            `src/lib/care-guide/image-assets.ts`에서 관리합니다.)
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2">웹 파일명</th>
                  <th className="whitespace-nowrap px-3 py-2">연결 콘텐츠</th>
                  <th className="px-3 py-2">설명</th>
                  <th className="px-3 py-2">대체 텍스트(앞부분)</th>
                  <th className="px-3 py-2">원본 파일명</th>
                  <th className="whitespace-nowrap px-3 py-2">사용 승인</th>
                  <th className="whitespace-nowrap px-3 py-2">최종 검토일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {IMAGE_ASSETS.map((img) => (
                  <tr key={img.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-800">
                      <a href={withBasePath(img.src)} target="_blank" rel="noreferrer" className="text-brand-blue underline underline-offset-2">
                        {img.id}.jpg
                      </a>
                      <span className="block text-slate-600">
                        {img.width}×{img.height}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-800">
                      {img.contentIds
                        .map((id) => {
                          const g = guides.find((x) => x.contentId === id);
                          return g ? `${id} ${g.title}` : id;
                        })
                        .join(", ")}
                    </td>
                    <td className="min-w-[200px] px-3 py-2 text-slate-800">{img.description}</td>
                    <td className="min-w-[220px] px-3 py-2 text-slate-700">{img.alt.slice(0, 60)}…</td>
                    <td className="min-w-[200px] px-3 py-2 text-slate-700">
                      {img.sourceFile}
                      <span className="block text-slate-600">{img.sourceDate}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-900 ring-1 ring-amber-200">
                        {IMAGE_APPROVAL_LABEL[img.approval]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-800">{img.lastReviewedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

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
          onSave={async (guide, note) => {
            await upsertGuide(guide, note);
            setEditingGuide(null);
          }}
        />
      )}
    </div>
  );
}
