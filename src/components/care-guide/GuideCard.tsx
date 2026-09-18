import type { GuideContent } from "@/lib/care-guide/types";
import { CategoryIcon, ClockIcon } from "./icons";

export default function GuideCard({
  guide,
  onPreview,
  onEdit,
}: {
  guide: GuideContent;
  onPreview: () => void;
  onEdit?: () => void;
}) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_20px_-8px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
            <CategoryIcon category={guide.category} className="h-3 w-3" />
            {guide.category}
          </span>
          <span className="truncate text-[11px] font-medium text-slate-400">{guide.subcategory}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-400">
          <ClockIcon className="h-3 w-3" /> {guide.estimatedReadMinutes}분
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <h4 className="text-[16px] font-bold leading-snug text-slate-900">{guide.title}</h4>
        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-slate-500">{guide.summary}</p>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-blue transition-colors hover:border-brand-blue/30 hover:bg-brand-blue/[0.04]"
        >
          미리보기
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          >
            수정
          </button>
        )}
      </div>
    </article>
  );
}
