"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { MEDICAL_REVIEW_PENDING_NOTE, isMedicalReviewPending, isOfficial } from "@/lib/care-guide/review";
import type { DeliveryChannel, GuideContent } from "@/lib/care-guide/types";
import { CHANNEL_LABEL } from "@/lib/care-guide/types";
import { postActivity } from "@/lib/care-guide/me-api";
import {
  buildContentUrl,
  buildKakaoMessage,
  buildKakaoMessageText,
  buildSmsMessage,
} from "@/lib/care-guide/notification-service";
import { ChatIcon, DownloadIcon, PhoneIcon, QrIcon, SendCheckIcon, WarningIcon } from "../icons";
import Modal from "../modals/Modal";
import { copyText } from "@/lib/care-guide/clipboard";

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
    // 실제로 복사된 경우에만 성공으로 알립니다(HTTP 등에서 막히면 실패로 알리고 직접 복사하도록 안내).
    if (await copyText(text)) onCopied();
    else onFailed();
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

function SendAssistantContent({
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
    // 문구·링크를 복사한 것은 ‘전송’이 아니라 ‘준비’입니다. 실제 발송 완료로 기록하지 않습니다.
    void postActivity({ type: "message-prep", title: guide.title, contentId: guide.contentId });
  }

  function notifyCopyFailed() {
    setToast({
      message: "복사하지 못했습니다(이 주소에서는 브라우저가 복사를 막을 수 있습니다). 화면의 내용을 눌러 전체를 선택한 뒤 직접 복사해 주세요.",
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
    void postActivity({ type: "download", title: `${guide.title} (QR 이미지)`, contentId: guide.contentId });
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
        {!isOfficial(guide) && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-900">
            이 콘텐츠는 아직 담당 부서의 승인을 받지 않았습니다. 환자에게 전달하기 전에 반드시 담당 부서의 확인을 받으세요.
          </p>
        )}

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
            <pre className="select-all whitespace-pre-wrap rounded-xl bg-slate-50 p-3.5 font-sans text-sm leading-relaxed text-slate-700">
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
            <p className="select-all break-all text-center text-xs text-slate-500">{link}</p>
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
              <p className="select-all mt-1.5 break-all text-xs text-brand-blue">{kakao.link}</p>
              <span className="mt-2 inline-block rounded-md bg-[#fee500] px-3 py-1.5 text-xs font-bold text-slate-900">
                {kakao.buttonLabel}
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
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

        <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
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

/** 환자 안내 창. 의료진 검토 대기 자료는 문구·링크·QR을 만들지 않고 안내만 보여 줍니다. */
export default function SendAssistantModal(props: { guide: GuideContent; onClose: () => void }) {
  if (isMedicalReviewPending(props.guide)) {
    return (
      <Modal onClose={props.onClose} ariaLabel="환자 안내 불가" maxWidthClassName="sm:max-w-md">
        {(requestClose) => (
          <div className="p-6">
            <h2 className="text-lg font-extrabold text-slate-900">검토 완료 후 안내할 수 있습니다</h2>
            <p className="mt-1 text-sm text-slate-600">
              선택 콘텐츠: <span className="font-semibold text-slate-800">{props.guide.title}</span>
            </p>
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-700">{MEDICAL_REVIEW_PENDING_NOTE}</p>
            <button
              type="button"
              onClick={requestClose}
              className="mt-5 min-h-[44px] w-full rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              닫기
            </button>
          </div>
        )}
      </Modal>
    );
  }
  return <SendAssistantContent {...props} />;
}
