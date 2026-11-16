"use client";

import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { postActivity } from "@/lib/care-guide/me-api";
import Modal from "./modals/Modal";

/**
 * ‘안내 제공 완료 기록’. 직원이 현장에서 환자·보호자에게 이 자료를 직접 안내했다고 확인하고 눌렀을 때만 저장합니다.
 * 자료를 열람하거나 문구를 복사하는 것만으로는 절대 기록되지 않으며, 환자 정보는 받지도 저장하지도 않습니다.
 */
export default function ProvidedRecordButton({
  title,
  contentId,
  bundleId,
  related,
  label = "안내 제공 기록",
  className = "",
}: {
  title: string;
  contentId?: string;
  bundleId?: string;
  related?: Array<{ contentId: string; title: string }>;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setBusy(true);
    setError("");
    const r = await postActivity({ type: "provided", title, contentId, bundleId, related });
    setBusy(false);
    if (r.ok) setDone(true);
    else setError(r.error);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(false);
          setError("");
        }}
        className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${className}`}
      >
        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} ariaLabel="안내 제공 기록" maxWidthClassName="sm:max-w-md">
          {(requestClose) => (
            <div className="p-6">
              <h2 className="text-lg font-extrabold text-slate-900">안내 제공 기록</h2>
              <p className="mt-2 text-sm font-semibold text-slate-800 [overflow-wrap:anywhere]">{title}</p>
              {done ? (
                <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-900">
                  기록했습니다. ‘발송·활용 이력’에서 확인할 수 있습니다.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    현장에서 환자·보호자에게 이 안내자료를 <b>직접 안내했을 때</b>만 기록해 주세요. 자료를 열어 보거나 문구를 복사한 것만으로는
                    기록되지 않습니다.
                  </p>
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                    환자 이름·등록번호·연락처 등은 입력하지도 저장하지도 않습니다. 기록되는 것은 자료 이름, 시각, 기록한 직원뿐입니다.
                  </p>
                  {error && (
                    <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-900">
                      {error}
                    </p>
                  )}
                </>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={requestClose}
                  className="min-h-[44px] rounded-full border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {done ? "닫기" : "취소"}
                </button>
                {!done && (
                  <button
                    type="button"
                    onClick={confirm}
                    disabled={busy}
                    className="min-h-[44px] rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark disabled:opacity-60"
                  >
                    {busy ? "기록 중…" : "직접 안내했습니다. 기록"}
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
