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
    <Modal onClose={onClose} ariaLabel={`${active.title} 미리보기`} maxWidthClassName="sm:max-w-xl">
      <div className="p-6">
        <GuideDetailView
          guide={active}
          relatedGuides={related}
          variant="staff"
          onSelectRelated={setActiveId}
        />

        {showSendAction && (
          <button
            type="button"
            onClick={() => setShowSend(true)}
            className="mt-5 w-full rounded-full bg-brand-blue py-3 text-sm font-bold text-white transition hover:bg-brand-blue-dark"
          >
            환자에게 보내기
          </button>
        )}
      </div>

      {showSend && <SendAssistantModal guide={active} onClose={() => setShowSend(false)} />}
    </Modal>
  );
}
