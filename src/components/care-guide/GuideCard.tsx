import type { GuideCategory, GuideContent } from "@/lib/care-guide/types";
import { CategoryIcon, ClockIcon } from "./icons";
import FavoriteButton from "./FavoriteButton";
import MedicalReviewChip from "./MedicalReviewChip";

/**
 * 카테고리 배지에 아주 은은한 색상 포인트를 준다. 카드 전체를 물들이지 않고
 * 배지 하나에만 적용해, 제목보다 색이 먼저 눈에 띄지 않도록 한다.
 */
const CATEGORY_BADGE: Record<GuideCategory, string> = {
  검사: "bg-blue-soft text-brand-blue-dark",
  수술: "bg-indigo-50 text-indigo-700",
  입원: "bg-teal-50 text-teal-700",
  퇴원: "bg-emerald-50 text-emerald-700",
  기타: "bg-slate-100 text-slate-700",
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
    <article
      onClick={onPreview}
      className="group flex h-full cursor-pointer flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-[0_6px_20px_-8px_rgba(14,74,132,0.14)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${CATEGORY_BADGE[guide.category]}`}
          >
            <CategoryIcon category={guide.category} className="h-3.5 w-3.5" />
            {guide.categoryLabelOverride ?? guide.category}
          </span>
          <span className="truncate text-xs font-medium text-slate-500">{guide.subcategory}</span>
          <MedicalReviewChip guide={guide} />
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500">
          <ClockIcon className="h-3.5 w-3.5" /> {guide.estimatedReadMinutes}분
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <h2 className="text-[16px] font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-brand-blue-dark">
          {guide.title}
        </h2>
        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-slate-600">{guide.summary}</p>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <span className="order-last ml-auto">
          <FavoriteButton guide={guide} />
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-blue transition-colors hover:border-brand-blue/30 hover:bg-blue-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px"
        >
          미리보기
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:ring-offset-2 active:translate-y-px"
          >
            수정
          </button>
        )}
      </div>
    </article>
  );
}
