import type { EduMaterial, MaterialFormat } from "@/lib/care-guide-data";
import { FormatIcon } from "./icons";

const FORMAT_BADGE: Record<MaterialFormat, string> = {
  "동영상 가이드": "bg-fuchsia-100 text-fuchsia-700",
  "카드뉴스": "bg-teal-100 text-teal-700",
  "주의사항 리플렛": "bg-amber-100 text-amber-700",
};

export default function MaterialCard({
  material,
  onPreview,
}: {
  material: EduMaterial;
  onPreview?: () => void;
}) {
  return (
    <article
      onClick={onPreview}
      role={onPreview ? "button" : undefined}
      tabIndex={onPreview ? 0 : undefined}
      onKeyDown={
        onPreview
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPreview();
              }
            }
          : undefined
      }
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-brand-teal/40 hover:shadow-xl hover:shadow-brand-teal/10 ${
        onPreview ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`relative flex h-24 items-center justify-center gap-2 overflow-hidden bg-gradient-to-br ${material.accent} text-white`}
      >
        <div className="flex items-center gap-2 transition-transform duration-500 ease-out group-hover:scale-110">
          <FormatIcon format={material.format} className="h-6 w-6" />
          <span className="text-xs font-semibold tracking-wide">{material.format}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${FORMAT_BADGE[material.format]}`}
          >
            {material.format}
          </span>
          <span className="text-xs font-bold text-brand-teal">{material.category}</span>
        </div>
        <h4 className="text-base font-bold leading-snug text-slate-900">{material.title}</h4>
        <p className="line-clamp-2 text-sm text-slate-600">{material.summary}</p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {material.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {onPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="mt-3 self-start rounded-full border border-brand-blue px-4 py-1.5 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white"
          >
            미리보기
          </button>
        )}
      </div>
    </article>
  );
}
