"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadGuides } from "@/lib/care-guide/cms-store";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import type { GuideContent } from "@/lib/care-guide/types";
import GuideDetailView from "../GuideDetailView";
import { ChevronLeftIcon } from "../icons";

export default function GuideDetailClient({
  token,
  contentId,
}: {
  token: string;
  contentId: string;
}) {
  const guides = useClientValue<GuideContent[]>(loadGuides, []);
  const router = useRouter();

  const guide = guides.find((g) => g.contentId === contentId);

  if (guides.length > 0 && !guide) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        안내를 찾을 수 없습니다.
      </div>
    );
  }

  if (!guide) return null;

  const related = (guide.relatedContentIds ?? [])
    .map((id) => guides.find((g) => g.contentId === id))
    .filter((g): g is GuideContent => Boolean(g));

  return (
    <div>
      <Link
        href={`/g/${token}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500"
      >
        <ChevronLeftIcon className="h-4 w-4" /> 오늘의 안내
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <GuideDetailView
          guide={guide}
          relatedGuides={related}
          variant="patient"
          onSelectRelated={(id) => router.push(`/g/${token}/guides/${id}`)}
        />
      </div>
    </div>
  );
}
