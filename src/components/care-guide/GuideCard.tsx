import type { GuideCategory, GuideContent } from "@/lib/care-guide/types";
import { CategoryIcon, CheckIcon, ClockIcon } from "./icons";

const CATEGORY_STYLE: Record<GuideCategory, string> = {
  검사: "bg-blue-50 text-blue-700",
  수술: "bg-rose-50 text-rose-700",
  입원: "bg-indigo-50 text-indigo-700",
  퇴원: "bg-emerald-50 text-emerald-700",
  복약: "bg-amber-50 text-amber-700",
  생활안내: "bg-teal-50 text-teal-700",
};

export default function GuideCard({
  guide,
  reason,
  selected,
  onToggleSelect,
  onPreview,
  showStatus,
}: {
  guide: GuideContent;
  reason?: string;
  selected?: boolean;
  onToggleSelect?: () => void;
  onPreview: () => void;
  showStatus?: boolean;
}) {
  const isSelectable = typeof onToggleSelect === "function";

  return (
    <article
      className={`flex flex-col gap-2.5 rounded-xl border bg-white p-4 transition-colors ${
        selected ? "border-brand-blue ring-1 ring-brand-blue/30" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        {isSelectable && (
          <button
            type="button"
            onClick={onToggleSelect}
            aria-pressed={selected}
            aria-label={selected ? "선택 해제" : "안내 선택"}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
              selected ? "border-brand-blue bg-brand-blue text-white" : "border-slate-300 text-transparent"
            }`}
          >
            <CheckIcon className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${CATEGORY_STYLE[guide.category]}`}
            >
              <CategoryIcon category={guide.category} className="h-3 w-3" />
              {guide.category}
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
              <ClockIcon className="h-3 w-3" /> {guide.readMinutes}분
            </span>
          </div>

          <h4 className="mt-1.5 text-[15px] font-bold leading-snug text-slate-900">{guide.title}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{guide.summary}</p>

          {reason && <p className="mt-1.5 text-xs font-semibold text-brand-teal">추천 이유: {reason}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={onPreview}
        className="self-start rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-blue hover:text-brand-blue"
      >
        미리보기
      </button>
    </article>
  );
}
