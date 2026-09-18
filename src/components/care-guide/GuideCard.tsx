import type { GuideCategory, GuideContent } from "@/lib/care-guide/types";
import { CategoryIcon, ClockIcon } from "./icons";

/**
 * 카테고리 배지에 아주 은은한 색상 포인트를 준다. 카드 전체를 물들이지 않고
 * 배지 하나에만 적용해, 제목보다 색이 먼저 눈에 띄지 않도록 한다.
 */
const CATEGORY_BADGE: Record<GuideCategory, string> = {
  검사: "bg-blue-soft text-brand-blue-dark",
  수술: "bg-indigo-50 text-indigo-700",
  입원: "bg-teal-50 text-teal-700",
  퇴원: "bg-emerald-50 text-emerald-700",
  기타: "bg-slate-100 text-slate-600",
};

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
    <article className="flex h-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-[0_6px_20px_-8px_rgba(14,74,132,0.14)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${CATEGORY_BADGE[guide.category]}`}
          >
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
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-blue transition-colors hover:border-brand-blue/30 hover:bg-blue-soft/70"
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
