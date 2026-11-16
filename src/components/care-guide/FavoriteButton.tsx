"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { toggleFavorite, useLibrary } from "@/lib/care-guide/me-api";
import type { GuideContent } from "@/lib/care-guide/types";

/** 즐겨찾기 별 버튼. 누르면 내 보관함에 등록되고, 다시 누르면 해제됩니다(로그인한 본인 기준으로 서버에 저장). */
export default function FavoriteButton({
  guide,
  withLabel = false,
  className = "",
}: {
  guide: Pick<GuideContent, "contentId" | "title">;
  withLabel?: boolean;
  className?: string;
}) {
  const { data, status } = useLibrary();
  const [error, setError] = useState("");
  const on = data.favorites.some((f) => f.contentId === guide.contentId);

  async function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    setError("");
    const r = await toggleFavorite(guide);
    if (!r.ok) {
      setError(r.error);
      window.setTimeout(() => setError(""), 4000);
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={status !== "ready"}
        aria-pressed={on}
        aria-label={`${guide.title} ${on ? "즐겨찾기 해제" : "즐겨찾기 등록"}`}
        title={on ? "즐겨찾기 해제" : "즐겨찾기 등록"}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:opacity-50 ${
          withLabel ? "min-h-[44px] border border-slate-200 bg-white px-4 hover:bg-slate-50" : "h-9 w-9 hover:bg-amber-50"
        } ${on ? "text-amber-700" : "text-slate-500 hover:text-amber-700"} ${className}`}
      >
        <Star className={`h-[18px] w-[18px] ${on ? "fill-amber-400 text-amber-500" : ""}`} aria-hidden="true" />
        {withLabel && <span>{on ? "즐겨찾기 해제" : "즐겨찾기"}</span>}
      </button>
      {error && (
        <span
          role="alert"
          className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-900 shadow"
        >
          {error}
        </span>
      )}
    </span>
  );
}
