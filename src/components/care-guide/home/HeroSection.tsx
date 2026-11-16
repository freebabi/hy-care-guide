"use client";

import { useEffect, useState } from "react";
import { CloseIcon, InfoIcon, SearchIcon } from "../icons";

const PLACEHOLDER_FULL = "검사, 시술, 수술, 입원, 퇴원 등 안내자료 또는 키워드를 검색하세요.";
// 좁은 화면에서는 입력창이 좁아 긴 안내 문구가 잘리므로 핵심만 보여줍니다.
const PLACEHOLDER_SHORT = "안내자료 또는 키워드를 검색하세요.";

function useIsNarrow(maxWidth = 639) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [maxWidth]);
  return narrow;
}

/** 메인 상단: 제목·설명·검색창 (이전의 담백한 디자인) */
export default function HeroSection({
  query,
  onQueryChange,
  onSubmit,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  /** 엔터 입력 시 결과 영역으로 이동하기 위한 콜백 */
  onSubmit: () => void;
}) {
  const narrow = useIsNarrow();
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-5">
      <div>
        <h1 id="hero-title" className="text-2xl font-bold tracking-tight text-slate-900">
          환자의 여정에 깊이를 더하다. 지금, 필요한 안내를 더 쉽고 정확하게
        </h1>
      </div>

      <p className="flex max-w-2xl items-start gap-1.5 text-xs leading-relaxed text-slate-500">
        <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
        환자 정보는 병원 기존 시스템에서 확인하고, HY CARE GUIDE에서는 전달할 안내 콘텐츠를
        검색·미리보기하고 전달을 준비합니다.
      </p>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label className="relative block w-full sm:max-w-xl">
          <span className="sr-only">안내자료 검색</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={narrow ? PLACEHOLDER_SHORT : PLACEHOLDER_FULL}
            aria-label={PLACEHOLDER_FULL}
            className="h-[50px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-500 placeholder:transition-colors focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10 focus:placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="검색어 지우기"
              className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </label>
      </form>
    </section>
  );
}
