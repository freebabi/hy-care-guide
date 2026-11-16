import type { DetailBlock, DetailContent } from "@/lib/care-guide/types";
import { DetailIcon } from "./detail-icons";
import GuideFigure from "./GuideFigure";
import { InfoIcon, WarningIcon } from "./icons";

function Block({ block, variant, bodyClass }: { block: DetailBlock; variant: "staff" | "patient"; bodyClass: string }) {
  switch (block.type) {
    case "paragraph":
      return <p className={`leading-relaxed text-slate-700 ${bodyClass}`}>{block.text}</p>;

    case "list":
      return (
        <ul className={`list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700 marker:text-brand-blue ${bodyClass}`}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="flex flex-col gap-2.5">
          {block.items.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className={`leading-relaxed ${bodyClass}`}>
                <p className="font-semibold text-slate-900">{step.title}</p>
                {step.text && <p className="mt-0.5 text-slate-700">{step.text}</p>}
              </div>
            </li>
          ))}
        </ol>
      );

    case "callout": {
      const warn = block.tone === "warning";
      return (
        <div
          className={`flex gap-2.5 rounded-xl border px-4 py-3 ${
            warn ? "border-amber-200 bg-amber-50 text-amber-950" : "border-brand-blue/20 bg-blue-soft text-slate-800"
          }`}
        >
          {warn ? (
            <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          ) : (
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
          )}
          <p className={`leading-relaxed ${bodyClass}`}>{block.text}</p>
        </div>
      );
    }

    case "image":
      return <GuideFigure assetId={block.assetId} variant={variant} />;

    case "review-needed":
      // 근거 자료가 없어 비워 둔 항목입니다. 직원에게는 검토 필요로, 환자에게는 의료진 문의 안내로 보여줍니다.
      return variant === "staff" ? (
        <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50/70 px-4 py-3">
          <p className="text-xs font-bold text-amber-900">관련 부서 검토 필요</p>
          <p className={`mt-0.5 leading-relaxed text-amber-950 ${bodyClass}`}>{block.topic}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
          <p className={`leading-relaxed text-slate-700 ${bodyClass}`}>
            <span className="font-semibold text-slate-900">{block.topic}</span>
            <span> — 담당 의료진에게 직접 확인해 주세요.</span>
          </p>
        </div>
      );
  }
}

export default function DetailSections({
  detail,
  variant,
  bodyClass,
  headingTag = "h3",
}: {
  detail: DetailContent;
  variant: "staff" | "patient";
  bodyClass: string;
  /** 제목이 h1인 전체 화면에서는 "h2", 팝업 안에서는 "h3" */
  headingTag?: "h2" | "h3";
}) {
  const Heading = headingTag;
  const titleClass = variant === "patient" ? "text-lg" : "text-base";
  return (
    <div className="flex flex-col gap-7">
      {detail.sections.map((section) => (
        <section key={section.id} aria-labelledby={`detail-${section.id}`}>
          <Heading id={`detail-${section.id}`} className={`flex scroll-mt-20 items-center gap-2.5 font-bold text-slate-900 ${titleClass}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-soft text-brand-blue">
              <DetailIcon name={section.icon} className="h-[18px] w-[18px]" />
            </span>
            {section.title}
          </Heading>
          <div className="mt-3 flex flex-col gap-3 sm:pl-[42px]">
            {section.blocks.map((block, i) => (
              <Block key={`${section.id}-${i}`} block={block} variant={variant} bodyClass={bodyClass} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
