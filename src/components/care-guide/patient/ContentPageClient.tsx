"use client";

import { useRouter } from "next/navigation";
import { loadGuides } from "@/lib/care-guide/cms-store";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import type { GuideContent } from "@/lib/care-guide/types";
import GuideDetailView from "../GuideDetailView";

export default function ContentPageClient({ slug }: { slug: string }) {
  const guides = useClientValue<GuideContent[]>(loadGuides, []);
  const guide = guides.find((g) => g.slug === slug);
  const router = useRouter();

  if (guides.length > 0 && !guide) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        안내를 찾을 수 없습니다. 링크를 다시 확인해주세요.
      </div>
    );
  }

  if (!guide) return null;

  const related = (guide.relatedContentIds ?? [])
    .map((id) => guides.find((g) => g.contentId === id))
    .filter((g): g is GuideContent => Boolean(g));

  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-slate-500">한양대학교병원 {guide.category} 안내</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <GuideDetailView
          guide={guide}
          relatedGuides={related}
          variant="patient"
          onSelectRelated={(id) => {
            const target = guides.find((g) => g.contentId === id);
            if (target) router.push(`/c/${target.slug}`);
          }}
        />
      </div>
    </div>
  );
}
