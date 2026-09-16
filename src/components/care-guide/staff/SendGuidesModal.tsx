"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DeliveryChannel, GuideContent, Patient, SentRecord } from "@/lib/care-guide/types";
import { CHANNEL_LABEL, buildPatientLink, sendGuidesToPatient } from "@/lib/care-guide/notification-service";
import { ChatIcon, PhoneIcon, QrIcon, SendCheckIcon } from "../icons";
import Modal from "../modals/Modal";
import Link from "next/link";

const CHANNEL_ICON: Record<DeliveryChannel, (props: { className?: string }) => React.JSX.Element> = {
  kakao: ChatIcon,
  sms: PhoneIcon,
  qr: QrIcon,
};

export default function SendGuidesModal({
  patient,
  guides,
  onClose,
  onSent,
}: {
  patient: Patient;
  guides: GuideContent[];
  onClose: () => void;
  onSent: (record: SentRecord) => void;
}) {
  const [channel, setChannel] = useState<DeliveryChannel>("kakao");
  const [record, setRecord] = useState<SentRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const link = record ? buildPatientLink(record.token) : null;

  useEffect(() => {
    if (!link) return;
    let cancelled = false;
    QRCode.toDataURL(link, { width: 176, margin: 1, color: { dark: "#003366" } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => setQrDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [link]);

  function handleSend() {
    const newRecord = sendGuidesToPatient(
      patient,
      guides.map((g) => g.contentId),
      channel,
    );
    setRecord(newRecord);
    onSent(newRecord);
  }

  return (
    <Modal onClose={onClose} ariaLabel="환자에게 안내 보내기" maxWidthClassName="sm:max-w-sm">
      <div className="p-6">
        {!record ? (
          <>
            <h2 className="text-lg font-extrabold text-slate-900">전달 방법 선택</h2>
            <p className="mt-1 text-sm text-slate-500">
              {patient.name}님에게 안내 {guides.length}건을 보냅니다.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {(Object.keys(CHANNEL_LABEL) as DeliveryChannel[]).map((c) => {
                const Icon = CHANNEL_ICON[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    aria-pressed={channel === c}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      channel === c
                        ? "border-brand-blue bg-cyan-50/60 ring-1 ring-brand-blue/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        channel === c ? "border-brand-blue" : "border-slate-300"
                      }`}
                    >
                      {channel === c && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                    </span>
                    <Icon className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-800">{CHANNEL_LABEL[c]}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSend}
              className="mt-5 w-full rounded-full bg-brand-blue py-3 text-sm font-bold text-white transition hover:bg-brand-blue-dark"
            >
              보내기
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                <SendCheckIcon className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">발송 완료</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {patient.name}님에게 안내 {guides.length}건을 <b>{CHANNEL_LABEL[record.channel]}</b>(으)로
              보냈습니다.
            </p>

            {record.channel === "qr" && (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="환자 안내 페이지 QR 코드" width={176} height={176} />
                ) : (
                  <div className="h-44 w-44 animate-pulse rounded-lg bg-slate-200" />
                )}
                <p className="text-center text-xs text-slate-500">
                  이 QR을 휴대폰 카메라로 촬영해주세요.
                </p>
              </div>
            )}

            <p className="mt-4 break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">{link}</p>

            <Link
              href={`/g/${record.token}`}
              target="_blank"
              className="mt-4 block w-full rounded-full border border-brand-blue py-2.5 text-center text-sm font-bold text-brand-blue transition hover:bg-cyan-50"
            >
              환자 모바일 화면 미리 보기
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              닫기
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
