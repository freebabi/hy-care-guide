"use client";

import type { EduMaterial } from "@/lib/hy-cure-data";
import { ChatIcon, CloseIcon, FormatIcon, SendCheckIcon } from "./icons";

export default function AlimtalkPhoneMockup({
  material,
  onClose,
}: {
  material: EduMaterial;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[300px] animate-float-in overflow-hidden rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-100 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="알림톡 미리보기 닫기"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-slate-600 shadow hover:text-slate-900"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {/* 상태바 */}
        <div className="flex items-center justify-between bg-slate-900 px-5 pb-1 pt-2 text-[10px] font-semibold text-white">
          <span>9:41</span>
          <span>HY-Cure</span>
        </div>

        {/* 카카오톡 스타일 채팅 헤더 */}
        <div className="flex items-center gap-2 bg-[#b2c7d9] px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3c1e1e] text-[#fee500]">
            <ChatIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">한양큐어 알림톡</p>
            <p className="text-[10px] text-slate-600">채널 · 교육자료 자동발송</p>
          </div>
        </div>

        {/* 채팅 배경 & 메시지 */}
        <div className="flex min-h-[280px] flex-col justify-end gap-2 bg-[#b2c7d9]/60 px-3 py-4">
          <div className="flex justify-start">
            <div className="w-[220px] animate-bubble-in overflow-hidden rounded-2xl rounded-tl-sm bg-white shadow-md">
              <div
                className={`flex h-16 items-center justify-center gap-2 bg-gradient-to-br ${material.accent} text-white`}
              >
                <FormatIcon format={material.format} className="h-5 w-5" />
                <span className="text-[11px] font-bold">{material.format}</span>
              </div>
              <div className="p-3">
                <p className="text-[11px] font-bold text-brand-teal">{material.category}</p>
                <p className="mt-0.5 text-sm font-bold leading-snug text-slate-900">
                  {material.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                  {material.summary}
                </p>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg bg-[#fee500] py-1.5 text-xs font-bold text-slate-900"
                >
                  자세히 보기
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-end gap-1 pr-1">
            <span className="text-[10px] text-slate-500">읽음</span>
            <span className="text-[10px] text-slate-400">방금 전</span>
          </div>
        </div>

        {/* 홈 인디케이터 */}
        <div className="flex justify-center bg-white py-2">
          <span className="h-1 w-24 rounded-full bg-slate-300" />
        </div>
      </div>

      <span className="sr-only" role="status">
        <SendCheckIcon /> 알림톡이 전송되었습니다.
      </span>
    </div>
  );
}
