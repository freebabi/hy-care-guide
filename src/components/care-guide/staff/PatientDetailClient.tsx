"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { findPatientById } from "@/lib/care-guide/patients-data";
import { recommendGuidesForPatient } from "@/lib/care-guide/recommendation-service";
import { STAGES } from "@/lib/care-guide/types";
import { useGuides } from "@/lib/care-guide/use-guides";
import GuideCard from "../GuideCard";
import GuidePreviewModal from "../GuidePreviewModal";
import { ChevronLeftIcon, UserIcon } from "../icons";
import SendGuidesModal from "./SendGuidesModal";

function formatScheduledAt(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function PatientDetailClient({ patientId }: { patientId: string }) {
  const patient = findPatientById(patientId);
  const { guides } = useGuides();
  const recommendations = useMemo(
    () => (patient ? recommendGuidesForPatient(patient, guides) : []),
    [patient, guides],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(recommendations.map((r) => r.guide.contentId)),
  );
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showSend, setShowSend] = useState(false);
  const [justSent, setJustSent] = useState(false);

  if (!patient) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        환자 정보를 찾을 수 없습니다.{" "}
        <Link href="/" className="font-semibold text-brand-blue">
          환자 안내로 돌아가기
        </Link>
      </div>
    );
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedGuides = recommendations
    .map((r) => r.guide)
    .filter((g) => selectedIds.has(g.contentId));
  const previewGuide = previewId ? guides.find((g) => g.contentId === previewId) : null;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800">
        <ChevronLeftIcon className="h-4 w-4" /> 환자 안내
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-lg font-extrabold text-slate-900">
            <UserIcon className="h-5 w-5 text-slate-400" />
            {patient.name} 님
          </p>
          <span className="text-sm font-semibold text-brand-teal">{patient.department}</span>
        </div>
        <p className="mt-2 text-sm text-slate-700">현재 진료 단계: ● {STAGES[patient.stage].label}</p>
        {patient.scheduledAt && (
          <p className="mt-0.5 text-sm text-slate-400">예정일: {formatScheduledAt(patient.scheduledAt)}</p>
        )}
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">지금 환자에게 필요한 안내</h2>
        {recommendations.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
            현재 단계에 매칭되는 게시 콘텐츠가 없습니다. 콘텐츠 관리에서 새 안내를 등록해보세요.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {recommendations.map(({ guide, reason }) => (
              <GuideCard
                key={guide.contentId}
                guide={guide}
                reason={reason}
                selected={selectedIds.has(guide.contentId)}
                onToggleSelect={() => toggle(guide.contentId)}
                onPreview={() => setPreviewId(guide.contentId)}
              />
            ))}
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-semibold text-slate-600">선택 {selectedGuides.length}건</span>
          <button
            type="button"
            disabled={selectedGuides.length === 0}
            onClick={() => {
              setShowSend(true);
              setJustSent(false);
            }}
            className="rounded-full bg-brand-blue px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            선택한 안내 보내기
          </button>
        </div>
      )}

      {justSent && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          발송이 발송 이력에 기록되었습니다.
        </p>
      )}

      {previewGuide && (
        <GuidePreviewModal guide={previewGuide} allGuides={guides} onClose={() => setPreviewId(null)} />
      )}

      {showSend && (
        <SendGuidesModal
          patient={patient}
          guides={selectedGuides}
          onClose={() => setShowSend(false)}
          onSent={() => setJustSent(true)}
        />
      )}
    </div>
  );
}
