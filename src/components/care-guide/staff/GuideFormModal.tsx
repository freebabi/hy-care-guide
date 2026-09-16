"use client";

import { useState } from "react";
import type { Department, GuideCategory, GuideContent, StageCode } from "@/lib/care-guide/types";
import { STAGES } from "@/lib/care-guide/types";
import Modal from "../modals/Modal";

const CATEGORIES: GuideCategory[] = ["검사", "수술", "입원", "퇴원", "복약", "생활안내"];
const DEPARTMENTS: Department[] = ["영상의학과", "소화기내과", "외과", "정형외과", "내과", "순환기내과"];
const STAGE_LIST = Object.values(STAGES);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

export default function GuideFormModal({
  initialGuide,
  nextId,
  onClose,
  onSave,
}: {
  initialGuide: GuideContent | null;
  nextId: string;
  onClose: () => void;
  onSave: (guide: GuideContent) => void;
}) {
  const [form, setForm] = useState<GuideContent>(
    initialGuide ?? {
      contentId: nextId,
      title: "",
      category: "생활안내",
      departments: [],
      patientStages: [],
      recommendReason: "",
      summary: "",
      readMinutes: 2,
      status: "비게시",
      needsClinicalReview: true,
      version: 1,
    },
  );

  function toggleArrayValue<T extends string>(key: "departments" | "patientStages", value: T) {
    setForm((prev) => {
      const arr = prev[key] as unknown as T[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) return;
    onSave({
      ...form,
      version: initialGuide ? form.version + 1 : 1,
    });
  }

  return (
    <Modal onClose={onClose} ariaLabel={initialGuide ? "콘텐츠 수정" : "콘텐츠 등록"} maxWidthClassName="sm:max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-extrabold text-slate-900">
          {initialGuide ? "콘텐츠 수정" : "새 콘텐츠 등록"}
        </h2>

        <Field label="제목">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="대표 카테고리">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as GuideCategory })}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="예상 읽기 시간(분)">
            <input
              type="number"
              min={1}
              value={form.readMinutes}
              onChange={(e) => setForm({ ...form, readMinutes: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="진료과 (복수 선택 가능)">
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENTS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggleArrayValue("departments", d)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  form.departments.includes(d)
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>

        <Field label="대상 환자 여정 단계 (복수 선택 가능)">
          <div className="flex flex-wrap gap-1.5">
            {STAGE_LIST.map((s) => (
              <button
                type="button"
                key={s.code}
                onClick={() => toggleArrayValue("patientStages", s.code as StageCode)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  form.patientStages.includes(s.code)
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="추천 이유 문구">
          <input
            value={form.recommendReason}
            onChange={(e) => setForm({ ...form, recommendReason: e.target.value })}
            placeholder="예: CT 검사 예정"
            className={inputClass}
          />
        </Field>

        <Field label="한눈에 보는 안내(요약)">
          <textarea
            required
            rows={2}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="꼭 확인해주세요">
          <textarea
            rows={2}
            value={form.mustCheck ?? ""}
            onChange={(e) => setForm({ ...form, mustCheck: e.target.value || undefined })}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="위치">
            <input
              value={form.location ?? ""}
              onChange={(e) => setForm({ ...form, location: e.target.value || undefined })}
              className={inputClass}
            />
          </Field>
          <Field label="문의">
            <input
              value={form.contact ?? ""}
              onChange={(e) => setForm({ ...form, contact: e.target.value || undefined })}
              className={inputClass}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.needsClinicalReview}
            onChange={(e) => setForm({ ...form, needsClinicalReview: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300"
          />
          병원 공식 검토가 필요한 콘텐츠입니다
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.status === "게시"}
            onChange={(e) => setForm({ ...form, status: e.target.checked ? "게시" : "비게시" })}
            className="h-4 w-4 rounded border-slate-300"
          />
          바로 게시
        </label>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600"
          >
            취소
          </button>
          <button type="submit" className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white">
            저장
          </button>
        </div>
      </form>
    </Modal>
  );
}
