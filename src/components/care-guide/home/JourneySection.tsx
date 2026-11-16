"use client";

import { JOURNEY_STAGES } from "@/lib/care-guide/taxonomy";
import type { JourneyStageId } from "@/lib/care-guide/types";
import { CheckIcon } from "../icons";
import { JourneyIcon } from "../journey-icons";

export default function JourneySection({
  counts,
  selected,
  totalCount,
  onToggle,
  onClear,
}: {
  counts: Map<JourneyStageId, number>;
  selected: JourneyStageId[];
  totalCount: number;
  onToggle: (id: JourneyStageId) => void;
  onClear: () => void;
}) {
  return (
    <section aria-labelledby="journey-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="journey-title" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            환자는 지금 어떤 단계에 있나요?
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            환자의 병원 이용 단계에 따라 필요한 안내자료를 찾아보세요. 여러 단계를 함께 선택할 수 있습니다.
          </p>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-blue/40 hover:text-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            단계 선택 해제
          </button>
        )}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {JOURNEY_STAGES.map((stage) => {
          const count = counts.get(stage.id) ?? 0;
          const isSelected = selected.includes(stage.id);
          return (
            <li key={stage.id} className="flex">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggle(stage.id)}
                className={`group relative flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 active:translate-y-px sm:p-5 ${
                  isSelected
                    ? "border-brand-blue bg-blue-soft shadow-[0_0_0_3px_rgba(27,103,169,0.18)]"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-[0_8px_22px_-10px_rgba(14,74,132,0.25)]"
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSelected ? "bg-brand-blue text-white" : "bg-blue-soft text-brand-blue group-hover:bg-brand-blue group-hover:text-white"
                    }`}
                  >
                    <JourneyIcon id={stage.id} className="h-6 w-6" />
                  </span>
                  <span className="text-xs font-bold tracking-wide text-slate-500">
                    STEP {String(stage.order).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-[15px] font-bold leading-snug text-slate-900 sm:text-base">{stage.label}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{stage.description}</p>
                  <p className="mt-1.5 hidden text-xs leading-relaxed text-slate-600 sm:block">
                    {stage.subItems.join(" · ")}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                    count > 0
                      ? "bg-white text-brand-blue-dark ring-1 ring-brand-blue/25"
                      : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                  }`}
                >
                  {count > 0 ? `안내자료 ${count}건` : "자료 준비 중"}
                </span>
              </button>
            </li>
          );
        })}

        <li className="flex">
          <button
            type="button"
            onClick={onClear}
            className="flex w-full flex-col items-start justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-left transition-colors hover:border-brand-blue/50 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 sm:p-5"
          >
            <span className="text-[15px] font-bold text-slate-800 sm:text-base">단계 구분 없이 전체 보기</span>
            <span className="text-[13px] leading-relaxed text-slate-600">모든 안내자료 {totalCount}건을 확인합니다.</span>
          </button>
        </li>
      </ul>
    </section>
  );
}
