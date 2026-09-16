"use client";

import { useState } from "react";
import type { GuideContent } from "@/lib/care-guide/types";
import GuideDetailView from "./GuideDetailView";
import Modal from "./modals/Modal";

export default function GuidePreviewModal({
  guide,
  allGuides,
  onClose,
}: {
  guide: GuideContent;
  allGuides: GuideContent[];
  onClose: () => void;
}) {
  const [activeId, setActiveId] = useState(guide.contentId);
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
      </div>
    </Modal>
  );
}
