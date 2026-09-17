import type { GuideCategory, GuideContent } from "@/lib/care-guide/types";
import { CategoryIcon, ClockIcon } from "./icons";

const CATEGORY_STYLE: Record<GuideCategory, string> = {
  검사: "bg-blue-50 text-blue-700",
  수술: "bg-rose-50 text-rose-700",
  입원: "bg-indigo-50 text-indigo-700",
  퇴원: "bg-emerald-50 text-emerald-700",
  기타: "bg-slate-100 text-slate-600",
};

export default function GuideCard({
  guide,
  onPreview,
  onEdit,
  showStatus,
}: {
  guide: GuideContent;
  onPreview: () => void;
  onEdit?: () => void;
  showStatus?: boolean;
}) {
  return (
    <article className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${CATEGORY_STYLE[guide.category]}`}
        >
          <CategoryIcon category={guide.category} className="h-3 w-3" />
          {guide.category}
        </span>
        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
          {guide.subcategory}
        </span>
        {showStatus && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              guide.status === "게시" ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            {guide.status}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
          <ClockIcon className="h-3 w-3" /> {guide.estimatedReadMinutes}분
        </span>
      </div>

      <h4 className="text-[15px] font-bold leading-snug text-slate-900">{guide.title}</h4>
      <p className="line-clamp-2 text-sm text-slate-600">{guide.summary}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="self-start rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue"
        >
          미리보기
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="self-start rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-slate-400 hover:text-slate-700"
          >
            수정
          </button>
        )}
      </div>
    </article>
  );
}
