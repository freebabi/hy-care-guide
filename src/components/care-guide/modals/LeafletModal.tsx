"use client";

import { useEffect, useState } from "react";
import type { EduMaterial } from "@/lib/care-guide-data";
import { getLeafletTabs, type LeafletCalloutType } from "@/lib/preview-content";
import { ChatIcon, DownloadIcon, FormatIcon, LeafletIcon, LightbulbIcon, WarningIcon } from "../icons";
import Modal from "./Modal";

const CALLOUT_STYLE: Record<LeafletCalloutType, { box: string; icon: React.ReactNode; label: string }> = {
  info: {
    box: "border-slate-200 bg-slate-50 text-slate-700",
    icon: <LeafletIcon className="h-4 w-4 text-slate-500" />,
    label: "안내",
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-900",
    icon: <WarningIcon className="h-4 w-4 text-amber-600" />,
    label: "주의",
  },
  tip: {
    box: "border-toss-blue/20 bg-blue-50 text-blue-900",
    icon: <LightbulbIcon className="h-4 w-4 text-toss-blue" />,
    label: "팁",
  },
};

export default function LeafletModal({
  material,
  onClose,
}: {
  material: EduMaterial;
  onClose: () => void;
}) {
  const tabs = getLeafletTabs(material);
  const [activeId, setActiveId] = useState(tabs[0].id);
  const [toast, setToast] = useState<string | null>(null);
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <Modal onClose={onClose} ariaLabel={`${material.title} 리플렛`} maxWidthClassName="sm:max-w-lg">
      <div className={`flex h-24 items-center gap-3 bg-gradient-to-br ${material.accent} px-6 text-white`}>
        <FormatIcon format={material.format} className="h-7 w-7" />
        <div>
          <p className="text-xs font-bold text-white/80">{material.category}</p>
          <h3 className="text-lg font-extrabold leading-snug">{material.title}</h3>
        </div>
      </div>

      <div className="px-6 pt-5">
        <div role="tablist" aria-label="리플렛 목차" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeId === tab.id}
              onClick={() => setActiveId(tab.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                activeId === tab.id
                  ? "border-toss-blue bg-toss-blue text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-toss-blue hover:text-toss-blue"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div key={activeId} className="animate-fade-in-up mt-4 flex flex-col gap-3 pb-6">
          {activeTab.callouts.map((callout, i) => {
            const style = CALLOUT_STYLE[callout.type];
            return (
              <div
                key={i}
                className={`flex gap-2.5 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed ${style.box}`}
              >
                <span className="mt-0.5 shrink-0">{style.icon}</span>
                <p>{callout.text}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2.5 border-t border-slate-100 py-5">
          <button
            type="button"
            onClick={() => setToast("예시 화면입니다. 실제 서비스에서는 PDF가 다운로드됩니다.")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <DownloadIcon />
            리플렛 PDF 다운로드
          </button>
          <button
            type="button"
            onClick={() => setToast("예시 화면입니다. 실제 서비스에서는 카카오톡으로 공유됩니다.")}
            className="inline-flex items-center gap-2 rounded-full bg-[#fee500] px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:brightness-95"
          >
            <ChatIcon className="h-4 w-4" />
            카카오톡으로 공유하기
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-toast-in pointer-events-none absolute inset-x-6 bottom-5 rounded-xl bg-slate-900 px-4 py-3 text-center text-xs font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </Modal>
  );
}
