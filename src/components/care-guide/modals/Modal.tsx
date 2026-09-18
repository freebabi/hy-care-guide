"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "../icons";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 닫히는 순간 즉시 사라지지 않고, 짧은 fade-out이 끝난 뒤 실제 onClose를 호출한다. */
const CLOSE_ANIMATION_MS = 150;

export default function Modal({
  onClose,
  children,
  ariaLabel,
  maxWidthClassName = "sm:max-w-lg",
}: {
  onClose: () => void;
  /** 보통은 그대로 JSX를 넘기면 되지만, 버튼에서 직접 애니메이션 포함 닫기를
   * 트리거해야 할 때는 함수 형태로 넘겨 `requestClose`를 전달받을 수 있다. */
  children: React.ReactNode | ((requestClose: () => void) => React.ReactNode);
  ariaLabel: string;
  maxWidthClassName?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  function requestClose() {
    setIsClosing(true);
    setTimeout(onClose, CLOSE_ANIMATION_MS);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-brand-blue-dark/30 backdrop-blur-[2px] sm:items-center sm:p-4 ${
        isClosing ? "animate-overlay-out" : "animate-overlay-in"
      }`}
      onClick={requestClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px] ${maxWidthClassName} ${
          isClosing ? "animate-modal-out" : "animate-modal-in"
        }`}
      >
        <button
          type="button"
          onClick={requestClose}
          aria-label="닫기"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {typeof children === "function" ? children(requestClose) : children}
        </div>
      </div>
    </div>
  );
}
