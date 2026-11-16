"use client";

import { useRouter } from "next/navigation";
import { isMedicalReviewPending, isPatientVisible } from "@/lib/care-guide/review";
import { contentPath, slugEquals } from "@/lib/care-guide/slug";
import { useGuides } from "@/lib/care-guide/use-guides";
import type { GuideContent } from "@/lib/care-guide/types";
import GuideDetailView from "../GuideDetailView";

export default function ContentPageClient({ slug }: { slug: string }) {
  // 서버가 알려 준 "환자에게 공개할 수 있는" 목록만 씁니다. 서버 응답이 오기 전에는 아무 내용도 보여 주지 않습니다.
  const { guides, status, scope, refresh } = useGuides();
  // 주소(slug)는 한글이면 %EC… 처럼 인코딩되어 들어오므로, 한 번 디코딩·정규화한 값끼리 비교합니다.
  const found = guides.find((g) => slugEquals(g.slug, slug));
  // 비게시(draft) 콘텐츠는 slug를 알아도 환자에게 노출되지 않아야 하므로,
  // "찾을 수 없음" 상태와 동일하게 처리합니다.
  // 의료진 검토 대기 중인 신규 콘텐츠도 같은 방식으로 환자에게 공개하지 않습니다.
  const guide = isPatientVisible(found) ? found : undefined;
  const router = useRouter();

  if (status === "error") {
    return (
      <div role="alert" className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-base text-slate-600">
        안내를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        <div className="mt-4">
          <button type="button" onClick={() => void refresh()} className="min-h-[44px] rounded-full border border-slate-300 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (status !== "ready" || scope === null) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-6 w-2/3 rounded bg-slate-200" />
        <div className="mt-6 h-24 w-full rounded bg-slate-100" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-base text-slate-500">
        안내를 찾을 수 없습니다. 병원에 문의해주세요.
      </div>
    );
  }

  const related = (guide.relatedContentIds ?? [])
    .map((id) => guides.find((g) => g.contentId === id))
    .filter((g): g is GuideContent => Boolean(g) && !isMedicalReviewPending(g));

  return (
    <div>
      <p className="mb-4 text-base font-semibold text-slate-500">
        한양대학교병원 {guide.categoryLabelOverride ?? guide.category} 안내
      </p>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <GuideDetailView
          guide={guide}
          relatedGuides={related}
          variant="patient"
          headingLevel="h1"
          onSelectRelated={(id) => {
            const target = guides.find((g) => g.contentId === id);
            if (isPatientVisible(target)) router.push(contentPath(target.slug));
          }}
        />
      </div>
    </div>
  );
}
