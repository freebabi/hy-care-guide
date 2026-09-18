"use client";

import { useState } from "react";
import type { GuideContent } from "@/lib/care-guide/types";
import GuideDetailView from "./GuideDetailView";
import Modal from "./modals/Modal";
import SendAssistantModal from "./staff/SendAssistantModal";

export default function GuidePreviewModal({
  guide,
  allGuides,
  onClose,
  showSendAction = true,
}: {
  guide: GuideContent;
  allGuides: GuideContent[];
  onClose: () => void;
  showSendAction?: boolean;
}) {
  const [activeId, setActiveId] = useState(guide.contentId);
  const [showSend, setShowSend] = useState(false);
  const active = allGuides.find((g) => g.contentId === activeId) ?? guide;
  const related = (active.relatedContentIds ?? [])
    .map((id) => allGuides.find((g) => g.contentId === id))
    .filter((g): g is GuideContent => Boolean(g));

  return (
    <Modal onClose={onClose} ariaLabel={`${active.title} 미리보기`} maxWidthClassName="sm:max-w-2xl">
      {(requestClose) => (
        <>
          <div className="p-6 pb-0">
            <GuideDetailView
              guide={active}
              relatedGuides={related}
              variant="staff"
              onSelectRelated={setActiveId}
            />
          </div>

          <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={requestClose}
              className={`rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:ring-offset-2 active:translate-y-px ${
                showSendAction ? "" : "flex-1"
              }`}
            >
              닫기
            </button>
            {showSendAction && (
              <button
                type="button"
                onClick={() => setShowSend(true)}
                className="flex-1 rounded-full bg-brand-blue py-3 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px"
              >
                환자에게 보내기
              </button>
            )}
          </div>

          {showSend && <SendAssistantModal guide={active} onClose={() => setShowSend(false)} />}
        </>
      )}
    </Modal>
  );
}
