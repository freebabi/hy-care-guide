"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DeliveryChannel, GuideContent } from "@/lib/care-guide/types";
import { CHANNEL_LABEL } from "@/lib/care-guide/types";
import {
  buildContentUrl,
  buildKakaoMessage,
  buildKakaoMessageText,
  buildSmsMessage,
  recordSendPrep,
} from "@/lib/care-guide/notification-service";
import { ChatIcon, DownloadIcon, PhoneIcon, QrIcon, SendCheckIcon, WarningIcon } from "../icons";
import Modal from "../modals/Modal";

const CHANNEL_ICON: Record<DeliveryChannel, (props: { className?: string }) => React.JSX.Element> = {
  sms: PhoneIcon,
  qr: QrIcon,
  kakao: ChatIcon,
};

function CopyButton({
  label,
  text,
  onCopied,
  onFailed,
}: {
  label: string;
  text: string;
  onCopied: () => void;
  onFailed: () => void;
}) {
  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
      onCopied();
    } catch {
      onFailed();
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px"
    >
      {label}
    </button>
  );
}

export default function SendAssistantModal({
  guide,
  onClose,
}: {
  guide: GuideContent;
  onClose: () => void;
}) {
  const [channel, setChannel] = useState<DeliveryChannel>("sms");
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const link = buildContentUrl(guide.slug);
  const sms = buildSmsMessage(guide);
  const kakao = buildKakaoMessage(guide);
  const kakaoText = buildKakaoMessageText(guide);

  useEffect(() => {
    if (channel !== "qr") return;
    let cancelled = false;
    QRCode.toDataURL(link, { width: 512, margin: 1, color: { dark: "#003366" } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => setQrDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [channel, link]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  function notifyCopied(message: string) {
    setToast({ message: `✓ ${message}`, variant: "success" });
    recordSendPrep(guide, channel);
  }

  function notifyCopyFailed() {
    setToast({
      message: "복사에 실패했습니다. 화면에 표시된 내용을 직접 선택해 복사해주세요.",
      variant: "error",
    });
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${guide.slug}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setToast({ message: "✓ QR 이미지가 다운로드되었습니다.", variant: "success" });
    recordSendPrep(guide, "qr");
  }

  return (
    <Modal onClose={onClose} ariaLabel="환자에게 안내하기" maxWidthClassName="sm:max-w-md">
      <div className="p-6">
        <h2 className="text-lg font-extrabold text-slate-900">환자에게 안내하기</h2>
        <p className="mt-1 text-sm text-slate-500">
          선택 콘텐츠: <span className="font-semibold text-slate-800">{guide.title}</span>
        </p>
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
          환자 정보는 병원 기존 시스템에서 확인해주세요. HY CARE GUIDE는 전달할 안내문과 링크만
          제공합니다.
        </p>

        <p className="mb-2 mt-5 text-sm font-bold text-slate-800">전달 방법을 선택하세요</p>
        <div className="flex gap-2">
          {(Object.keys(CHANNEL_LABEL) as DeliveryChannel[]).map((c) => {
            const Icon = CHANNEL_ICON[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                aria-pressed={channel === c}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px ${
                  channel === c
                    ? "border-brand-blue bg-blue-soft ring-1 ring-brand-blue/30"
                    : "border-slate-200 hover:border-brand-blue/30 hover:bg-blue-soft/40"
                }`}
              >
                <Icon className="h-5 w-5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">{CHANNEL_LABEL[c]}</span>
              </button>
            );
          })}
        </div>

        {channel === "sms" && (
          <div className="mt-5">
            <p className="mb-1.5 text-xs font-bold text-slate-600">SMS 발송용 문구</p>
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3.5 font-sans text-sm leading-relaxed text-slate-700">
              {sms.full}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton
                label="문구 복사"
                text={sms.messageOnly}
                onCopied={() => notifyCopied("문구가 복사되었습니다.")}
                onFailed={notifyCopyFailed}
              />
              <CopyButton
                label="링크만 복사"
                text={sms.link}
                onCopied={() => notifyCopied("링크가 복사되었습니다.")}
                onFailed={notifyCopyFailed}
              />
              <CopyButton
                label="전체 내용 복사"
                text={sms.full}
                onCopied={() => notifyCopied("전체 내용이 복사되었습니다.")}
                onFailed={notifyCopyFailed}
              />
            </div>
          </div>
        )}

        {channel === "qr" && (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-800">{guide.title}</p>
            <p className="text-xs text-slate-500">휴대폰 카메라로 QR을 촬영해주세요.</p>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`${guide.title} 안내 페이지 QR 코드`}
                width={176}
                height={176}
              />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-lg bg-slate-200" />
            )}
            <p className="break-all text-center text-xs text-slate-400">{link}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <CopyButton
                label="링크 복사"
                text={link}
                onCopied={() => notifyCopied("링크가 복사되었습니다.")}
                onFailed={notifyCopyFailed}
              />
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!qrDataUrl}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0"
              >
                <DownloadIcon className="h-3.5 w-3.5" /> QR 이미지 다운로드
              </button>
            </div>
          </div>
        )}

        {channel === "kakao" && (
          <div className="mt-5">
            <p className="mb-1.5 text-xs font-bold text-slate-600">카카오 알림톡 발송 준비</p>
            <div className="rounded-xl border border-[#fee500]/60 bg-[#fffbe6] p-3.5">
              <p className="text-sm font-bold text-slate-900">{kakao.title}</p>
              <p className="mt-1.5 text-sm text-slate-700">{kakao.body}</p>
              <p className="mt-1.5 break-all text-xs text-brand-blue">{kakao.link}</p>
              <span className="mt-2 inline-block rounded-md bg-[#fee500] px-3 py-1.5 text-xs font-bold text-slate-900">
                {kakao.buttonLabel}
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
              현재는 실제 카카오 API가 연동되어 있지 않습니다. 병원의 비즈메시지 시스템 또는 향후
              승인된 API 연동을 전제로 합니다.
            </p>
            <div className="mt-3">
              <CopyButton
                label="내용 복사"
                text={kakaoText}
                onCopied={() => notifyCopied("내용이 복사되었습니다.")}
                onFailed={notifyCopyFailed}
              />
            </div>
          </div>
        )}

        <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
          환자 선택 및 전화번호 입력은 병원 기존 EHR에서 진행합니다.
        </p>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`animate-toast-in pointer-events-none absolute inset-x-6 bottom-5 flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-center text-xs font-semibold text-white shadow-lg ${
            toast.variant === "success" ? "bg-brand-blue-dark" : "bg-amber-600"
          }`}
        >
          {toast.variant === "success" ? (
            <SendCheckIcon className="h-3.5 w-3.5" />
          ) : (
            <WarningIcon className="h-3.5 w-3.5" />
          )}
          {toast.message}
        </div>
      )}
    </Modal>
  );
}
