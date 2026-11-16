"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recordView } from "@/lib/care-guide/me-api";
import { isMedicalReviewPending } from "@/lib/care-guide/review";
import { guidePath } from "@/lib/care-guide/slug";
import type { GuideContent } from "@/lib/care-guide/types";
import FavoriteButton from "./FavoriteButton";
import GuideDetailView from "./GuideDetailView";
import Modal from "./modals/Modal";
import ImprovementRequestPanel from "./staff/ImprovementRequestPanel";
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
  // 미리보기로 자료를 열면 ‘최근 본 자료’와 열람 이력에 자동으로 남습니다.
  useEffect(() => {
    void recordView(active);
  }, [active]);
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
            <div className="mt-6">
              <ImprovementRequestPanel guide={active} />
            </div>
          </div>

          <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={requestClose}
              className={`min-h-[44px] rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:ring-offset-2 active:translate-y-px ${
                showSendAction ? "" : "flex-1"
              }`}
            >
              닫기
            </button>
            <FavoriteButton guide={active} withLabel className="hidden sm:inline-flex" />
            <Link
              href={guidePath(active.slug)}
              className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 px-4 text-sm font-bold text-brand-blue-dark transition-colors hover:bg-blue-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
            >
              전체 화면
            </Link>
            {showSendAction && (
              <button
                type="button"
                onClick={() => setShowSend(true)}
                disabled={isMedicalReviewPending(active)}
                title={isMedicalReviewPending(active) ? "의료진 검토 완료 후 환자에게 보낼 수 있습니다." : undefined}
                className="flex-1 rounded-full bg-brand-blue py-3 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:hover:bg-slate-300"
              >
                {isMedicalReviewPending(active) ? "검토 완료 후 전달 가능" : "환자에게 보내기"}
              </button>
            )}
          </div>

          {showSend && !isMedicalReviewPending(active) && <SendAssistantModal guide={active} onClose={() => setShowSend(false)} />}
        </>
      )}
    </Modal>
  );
}
