"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { nextContentId, upsertGuide } from "@/lib/care-guide/cms-store";
import { useRole } from "@/lib/care-guide/role";
import { recordView } from "@/lib/care-guide/me-api";
import { isMedicalReviewPending } from "@/lib/care-guide/review";
import { contentPath, guidePath, slugEquals } from "@/lib/care-guide/slug";
import { useGuides } from "@/lib/care-guide/use-guides";
import type { GuideContent } from "@/lib/care-guide/types";
import { ChevronLeftIcon } from "../icons";
import GuideDetailView from "../GuideDetailView";
import FavoriteButton from "../FavoriteButton";
import ProvidedRecordButton from "../ProvidedRecordButton";
import GuideFormModal from "./GuideFormModal";
import ImprovementRequestPanel from "./ImprovementRequestPanel";
import SendAssistantModal from "./SendAssistantModal";

/** 직원용 안내 상세 페이지(전체 화면). 수정은 관리자만 보이며, 직원은 개선 요청만 남길 수 있습니다. */
export default function StaffGuidePage({ slug }: { slug: string }) {
  const { guides, refresh } = useGuides();
  const role = useRole();
  const router = useRouter();
  const [showSend, setShowSend] = useState(false);
  const [editing, setEditing] = useState(false);

  const guide = guides.find((g) => slugEquals(g.slug, slug));
  // 비게시(비공개·폐기) 콘텐츠는 관리자만 볼 수 있습니다.
  const visible = guide && (guide.status === "게시" || role === "ADMIN");

  // 상세 화면을 열면 ‘최근 본 자료’와 열람 이력에 자동으로 남습니다.
  const viewedId = guide && visible ? guide.contentId : null;
  const viewedTitle = guide?.title ?? "";
  useEffect(() => {
    if (viewedId) void recordView({ contentId: viewedId, title: viewedTitle });
  }, [viewedId, viewedTitle]);

  const back = (
    <Link
      href="/"
      className="inline-flex min-h-[40px] w-fit items-center gap-1 rounded-lg text-sm font-semibold text-brand-blue-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
    >
      <ChevronLeftIcon className="h-4 w-4" /> 안내 목록으로
    </Link>
  );

  if (guides.length === 0 || !guide || !visible) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-700">
          {guides.length === 0
            ? "불러오는 중입니다…"
            : guide
              ? "비공개 처리된 안내입니다. 관리자만 볼 수 있습니다."
              : "안내를 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  const related = (guide.relatedContentIds ?? [])
    .map((id) => guides.find((g) => g.contentId === id))
    .filter((g): g is GuideContent => Boolean(g) && (g?.status === "게시" || role === "ADMIN"));

  return (
    <div className="flex flex-col gap-5">
      {back}

      {guide.status !== "게시" && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">
          비공개 상태입니다. 환자에게 보이지 않으며 관리자에게만 표시됩니다.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowSend(true)}
          disabled={isMedicalReviewPending(guide)}
          title={isMedicalReviewPending(guide) ? "의료진 검토 완료 후 환자에게 보낼 수 있습니다." : undefined}
          className="min-h-[44px] rounded-full bg-brand-blue px-5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:hover:bg-slate-300"
        >
          환자에게 보내기
        </button>
        {!isMedicalReviewPending(guide) && (
          <Link
            href={contentPath(guide.slug)}
            target="_blank"
            className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
          >
            환자 화면으로 보기
          </Link>
        )}
        <FavoriteButton guide={guide} withLabel />
        {!isMedicalReviewPending(guide) && <ProvidedRecordButton title={guide.title} contentId={guide.contentId} />}
        {role === "ADMIN" && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="min-h-[44px] rounded-full border border-brand-blue/40 bg-white px-5 text-sm font-bold text-brand-blue-dark hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            수정 (관리자)
          </button>
        )}
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <GuideDetailView
            guide={guide}
            relatedGuides={related}
            variant="staff"
            headingLevel="h1"
            onSelectRelated={(id) => {
              const target = guides.find((g) => g.contentId === id);
              if (target) router.push(guidePath(target.slug));
            }}
          />
          <div className="mt-8">
            <ImprovementRequestPanel guide={guide} />
          </div>
        </div>
      </article>

      {showSend && <SendAssistantModal guide={guide} onClose={() => setShowSend(false)} />}

      {editing && role === "ADMIN" && (
        <GuideFormModal
          initialGuide={guide}
          nextId={nextContentId(guides)}
          existingSlugs={guides.filter((g) => g.contentId !== guide.contentId).map((g) => g.slug)}
          otherGuides={guides.filter((g) => g.contentId !== guide.contentId)}
          onClose={() => setEditing(false)}
          onSave={async (saved, note) => {
            const result = await upsertGuide(saved, note);
            await refresh();
            setEditing(false);
            if (!slugEquals(result.slug, slug)) router.replace(guidePath(result.slug));
          }}
        />
      )}
    </div>
  );
}
