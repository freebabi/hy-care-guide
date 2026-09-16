"use client";

import { useState } from "react";
import type { EduMaterial } from "@/lib/care-guide-data";
import { getCardNewsSlides } from "@/lib/preview-content";
import { ChevronLeftIcon, ChevronRightIcon, FormatIcon } from "../icons";
import Modal from "./Modal";

export default function CardNewsModal({
  material,
  onClose,
}: {
  material: EduMaterial;
  onClose: () => void;
}) {
  const slides = getCardNewsSlides(material);
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isFirst = index === 0;
  const isLast = index === slides.length - 1;

  return (
    <Modal onClose={onClose} ariaLabel={`${material.title} 카드뉴스`} maxWidthClassName="sm:max-w-md">
      <div className={`flex h-40 items-center justify-center gap-2 bg-gradient-to-br ${material.accent} text-white`}>
        <FormatIcon format={material.format} className="h-8 w-8" />
        <span className="text-sm font-bold">{material.format}</span>
      </div>

      <div className="flex min-h-[220px] flex-col justify-between px-6 pb-6 pt-5">
        <div key={index} className="animate-fade-in-up">
          <p className="text-xs font-bold text-toss-blue">
            {index + 1} / {slides.length}
          </p>
          <h3 className="mt-2 text-xl font-extrabold leading-snug text-slate-900">{slide.heading}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{slide.body}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            aria-label="이전 장"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-toss-gray text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeftIcon />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.heading}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 장으로 이동`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-toss-blue" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
            disabled={isLast}
            aria-label="다음 장"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-toss-gray text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </Modal>
  );
}
