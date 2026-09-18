"use client";

import { useRouter } from "next/navigation";
import { loadGuides } from "@/lib/care-guide/cms-store";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import type { GuideContent } from "@/lib/care-guide/types";
import GuideDetailView from "../GuideDetailView";

export default function ContentPageClient({ slug }: { slug: string }) {
  const guides = useClientValue<GuideContent[]>(loadGuides, []);
  const found = guides.find((g) => g.slug === slug);
  // 비게시(draft) 콘텐츠는 slug를 알아도 환자에게 노출되지 않아야 하므로,
  // "찾을 수 없음" 상태와 동일하게 처리합니다.
  const guide = found && found.status === "게시" ? found : undefined;
  const router = useRouter();

  if (guides.length === 0) {
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
    .filter((g): g is GuideContent => Boolean(g));

  return (
    <div>
      <p className="mb-4 text-base font-semibold text-slate-500">한양대학교병원 {guide.category} 안내</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <GuideDetailView
          guide={guide}
          relatedGuides={related}
          variant="patient"
          onSelectRelated={(id) => {
            const target = guides.find((g) => g.contentId === id);
            if (target && target.status === "게시") router.push(`/c/${target.slug}`);
          }}
        />
      </div>
    </div>
  );
}
