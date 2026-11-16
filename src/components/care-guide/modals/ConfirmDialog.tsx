"use client";

import { useState } from "react";
import Modal from "./Modal";

/** 삭제처럼 되돌리기 어려운 동작 전에 한 번 더 확인하는 대화상자 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger = true,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal onClose={onClose} ariaLabel={title} maxWidthClassName="sm:max-w-sm">
      {(requestClose) => (
        <div className="p-6">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">{message}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={requestClose}
              className="min-h-[44px] rounded-full border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onConfirm();
                requestClose();
              }}
              className={`min-h-[44px] rounded-full px-5 text-sm font-bold text-white disabled:opacity-60 ${
                danger ? "bg-rose-600 hover:bg-rose-700" : "bg-brand-blue hover:bg-brand-blue-dark"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
