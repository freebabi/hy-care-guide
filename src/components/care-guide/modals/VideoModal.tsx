"use client";

import { useEffect, useRef, useState } from "react";
import type { EduMaterial } from "@/lib/care-guide-data";
import { formatTime, getVideoMeta } from "@/lib/preview-content";
import { FormatIcon, PauseIcon, PlayIcon } from "../icons";
import Modal from "./Modal";

export default function VideoModal({
  material,
  onClose,
}: {
  material: EduMaterial;
  onClose: () => void;
}) {
  const { durationSeconds, chapters } = getVideoMeta(material);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime((t) => {
        if (t + 1 >= durationSeconds) {
          setIsPlaying(false);
          return durationSeconds;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, durationSeconds]);

  function togglePlay() {
    setCurrentTime((t) => {
      if (t >= durationSeconds) return 0;
      return t;
    });
    setIsPlaying((p) => !p);
  }

  function seekFromClientX(clientX: number) {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setCurrentTime(Math.round(ratio * durationSeconds));
  }

  const activeChapterIndex = [...chapters]
    .reverse()
    .findIndex((c) => currentTime >= c.timeSeconds);
  const activeChapter =
    activeChapterIndex === -1 ? undefined : chapters[chapters.length - 1 - activeChapterIndex];

  const progressPercent = durationSeconds === 0 ? 0 : (currentTime / durationSeconds) * 100;

  return (
    <Modal onClose={onClose} ariaLabel={`${material.title} 동영상`} maxWidthClassName="sm:max-w-lg">
      <div
        className={`relative flex h-56 items-center justify-center bg-gradient-to-br ${material.accent} text-white`}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "일시정지" : "재생"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:scale-105 hover:bg-white/30"
        >
          {isPlaying ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8 translate-x-0.5" />}
        </button>
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-bold">
          <FormatIcon format={material.format} className="h-3.5 w-3.5" />
          {material.format}
        </span>
      </div>

      <div className="px-6 pb-6 pt-4">
        <h3 className="text-lg font-extrabold leading-snug text-slate-900">{material.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{material.summary}</p>

        {/* 타임바 */}
        <div className="mt-5">
          <div
            ref={barRef}
            onClick={(e) => seekFromClientX(e.clientX)}
            role="slider"
            aria-label="재생 위치"
            aria-valuemin={0}
            aria-valuemax={durationSeconds}
            aria-valuenow={currentTime}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setCurrentTime((t) => Math.min(durationSeconds, t + 5));
              if (e.key === "ArrowLeft") setCurrentTime((t) => Math.max(0, t - 5));
            }}
            className="group relative h-2 w-full cursor-pointer rounded-full bg-slate-200"
          >
            <div
              className="h-full rounded-full bg-toss-blue transition-[width] duration-150"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-toss-blue shadow transition-transform group-hover:scale-125"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(durationSeconds)}</span>
          </div>
        </div>

        {/* 챕터 목차 */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-slate-800">타임라인 목차</p>
          <div className="flex flex-col gap-1.5">
            {chapters.map((chapter) => (
              <button
                key={chapter.label}
                type="button"
                onClick={() => setCurrentTime(chapter.timeSeconds)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                  activeChapter?.label === chapter.label
                    ? "bg-blue-50 font-bold text-toss-blue"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">
                  {formatTime(chapter.timeSeconds)}
                </span>
                {chapter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
