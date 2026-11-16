"use client";

import { TOPICS } from "@/lib/care-guide/taxonomy";
import type { TopicId } from "@/lib/care-guide/types";

export default function TopicSection({
  counts,
  selected,
  onToggle,
  onClear,
}: {
  counts: Map<TopicId, number>;
  selected: TopicId[];
  onToggle: (id: TopicId) => void;
  onClear: () => void;
}) {
  return (
    <section aria-labelledby="topic-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="topic-title" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            주제별로 찾기
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            환자의 여정과 별개로, 안내자료의 주제로도 찾을 수 있습니다. 여러 주제를 함께 선택할 수 있습니다.
          </p>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-blue/40 hover:text-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            주제 선택 해제
          </button>
        )}
      </div>

      <ul className="mt-5 flex flex-wrap gap-2.5">
        {TOPICS.map((topic) => {
          const count = counts.get(topic.id) ?? 0;
          const isSelected = selected.includes(topic.id);
          return (
            <li key={topic.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggle(topic.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2 active:translate-y-px ${
                  isSelected
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:border-brand-blue/50 hover:bg-blue-soft"
                }`}
              >
                {topic.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : count > 0
                        ? "bg-blue-soft text-brand-blue-dark"
                        : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {count > 0 ? count : "준비 중"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
