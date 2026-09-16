"use client";

import { useEffect, useState } from "react";
import { CopyIcon, MailIcon } from "./icons";

const CONTACT_EMAIL = "2162115@hyumc.com";

export default function Footer() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setToast("이메일 주소가 복사되었습니다!");
    } catch {
      setToast("복사에 실패했습니다. 직접 선택해 복사해주세요.");
    }
  }

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold text-white">한양 케어가이드 (HY-Cure)</p>
            <p className="mt-1 text-sm text-slate-400">서비스 문의 · 시스템 구축 가이드</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-cyan"
            >
              <MailIcon />
              이메일로 문의하기
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-600 px-5 py-2.5 text-sm font-bold text-slate-100 transition hover:-translate-y-0.5 hover:border-brand-cyan hover:text-brand-cyan"
            >
              <CopyIcon />
              이메일 복사
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-400">
          <p>
            본 콘텐츠는 의학적 진단 및 처방을 대체하지 않으며 참고용으로 제공됩니다. 정확한
            진단과 치료는 반드시 담당 의료진과 상담하시기 바랍니다.
          </p>
          <p className="mt-2">
            본 화면은 HY-Cure 서비스 컨셉을 소개하기 위한 데모 페이지이며, 실제 화면 및 수치와
            다를 수 있습니다.
          </p>
          <p className="mt-4">&copy; 2026 HY-Cure. All rights reserved.</p>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-toast-in fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-sm items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-lg ring-1 ring-slate-200 sm:inset-x-auto sm:right-6"
        >
          {toast}
        </div>
      )}
    </footer>
  );
}
