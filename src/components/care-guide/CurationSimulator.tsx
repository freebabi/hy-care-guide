"use client";

import { useEffect, useMemo, useState } from "react";
import { DEPARTMENTS, MATERIALS, NOTE_TYPES } from "@/lib/care-guide-data";
import MaterialCard from "./MaterialCard";
import AlimtalkPhoneMockup from "./AlimtalkPhoneMockup";
import MaterialPreviewModal from "./modals/MaterialPreviewModal";

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? "border-brand-blue bg-brand-blue text-white shadow-sm shadow-brand-blue/30"
          : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-brand-blue hover:text-brand-blue"
      }`}
    >
      {children}
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-bold text-slate-800">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function CurationSimulator() {
  const [deptId, setDeptId] = useState(DEPARTMENTS[0].id);
  const dept = DEPARTMENTS.find((d) => d.id === deptId) ?? DEPARTMENTS[0];
  const [diagnosis, setDiagnosis] = useState(dept.diagnoses[0]);
  const [noteTypes, setNoteTypes] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showPhoneMockup, setShowPhoneMockup] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  function handleDeptChange(id: string) {
    setDeptId(id);
    const nextDept = DEPARTMENTS.find((d) => d.id === id);
    setDiagnosis(nextDept?.diagnoses[0] ?? "");
  }

  function toggleNoteType(note: string) {
    setNoteTypes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note],
    );
  }

  const recommendations = useMemo(() => {
    const scored = MATERIALS.map((material) => {
      let score = 0;
      if (material.departments.includes(dept.label)) score += 3;
      if (diagnosis && material.diagnoses.includes(diagnosis)) score += 4;
      score += material.noteTypes.filter((n) => noteTypes.includes(n)).length * 2;
      return { material, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((s) => s.material);
  }, [dept, diagnosis, noteTypes]);

  // 선택 조건이 바뀔 때마다 결과 카드가 다시 Fade-in 되도록 하는 키
  const resultsKey = `${deptId}|${diagnosis}|${noteTypes.join(",")}`;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleSendTest() {
    setToast("카카오 알림톡으로 교육자료가 전송되었습니다.");
    setShowPhoneMockup(true);
  }

  const topRecommendation = recommendations[0];
  const previewMaterial = recommendations.find((m) => m.id === previewId) ?? null;

  return (
    <section id="simulator" className="scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            환자 맞춤형 큐레이션 시뮬레이터
          </h2>
          <p className="mt-2 text-slate-600">
            진료과와 진단명, 처방·주의사항을 선택하면 EMR 연동 로직에 따라 추천되는 맞춤형
            교육자료를 실시간으로 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <FieldGroup label="진료과">
              {DEPARTMENTS.map((d) => (
                <ChipButton key={d.id} active={d.id === deptId} onClick={() => handleDeptChange(d.id)}>
                  {d.label}
                </ChipButton>
              ))}
            </FieldGroup>

            <FieldGroup label="주요 질환·진단명">
              {dept.diagnoses.map((dx) => (
                <ChipButton key={dx} active={dx === diagnosis} onClick={() => setDiagnosis(dx)}>
                  {dx}
                </ChipButton>
              ))}
            </FieldGroup>

            <FieldGroup label="처방·주의사항 (복수 선택 가능)">
              {NOTE_TYPES.map((note) => (
                <ChipButton key={note} active={noteTypes.includes(note)} onClick={() => toggleNoteType(note)}>
                  {note}
                </ChipButton>
              ))}
            </FieldGroup>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                추천 교육자료 <span className="text-brand-teal">{recommendations.length}건</span>
              </h3>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={!topRecommendation}
                className="rounded-full bg-brand-teal px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
              >
                카카오 알림톡 전송 테스트
              </button>
            </div>

            <div key={resultsKey} className="mt-5 grid gap-4 sm:grid-cols-2">
              {recommendations.map((material, index) => (
                <div
                  key={material.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <MaterialCard material={material} onPreview={() => setPreviewId(material.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-toast-in fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-sm items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg sm:inset-x-auto sm:right-6"
        >
          {toast}
        </div>
      )}

      {showPhoneMockup && topRecommendation && (
        <AlimtalkPhoneMockup material={topRecommendation} onClose={() => setShowPhoneMockup(false)} />
      )}

      {previewMaterial && (
        <MaterialPreviewModal material={previewMaterial} onClose={() => setPreviewId(null)} />
      )}
    </section>
  );
}
