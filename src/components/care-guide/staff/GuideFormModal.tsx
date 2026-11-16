"use client";

import { useState } from "react";
import { JOURNEY_STAGES, TOPICS } from "@/lib/care-guide/taxonomy";
import { ACCEPTED_ATTACHMENT, readAttachment } from "@/lib/care-guide/requests-store";
import { resolveSlug, slugify } from "@/lib/care-guide/slug";
import {
  NEW_CONTENT_MEDICAL_REVIEW,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_ORDER,
  SOURCE_KIND_LABEL,
  approvalBlockers,
  medicalReviewOnSave,
  reviewStatusOf,
} from "@/lib/care-guide/review";
import type {
  Audience,
  Department,
  FaqItem,
  GuideCategory,
  GuideContent,
  JourneyStageId,
  MedicalReviewStatus,
  ReviewStatus,
  SourceDocument,
  SourceKind,
  TopicId,
} from "@/lib/care-guide/types";
import { PHASE_LABELS } from "../GuideDetailView";
import Modal from "../modals/Modal";

const CATEGORIES: GuideCategory[] = ["검사", "수술", "입원", "퇴원", "기타"];
const DEPARTMENTS: Department[] = [
  "영상의학과",
  "소화기내과",
  "외과",
  "정형외과",
  "내과",
  "심장내과",
  "진단검사의학과",
  "핵의학과",
  "마취통증의학과",
  "재활의학과",
  "원무팀",
  "치과",
  "산부인과",
  "응급의료센터",
  "비뇨의학과",
  "이비인후과",
  "심장혈관흉부외과",
  "전과공통",
];
const AUDIENCE_LABEL: Record<Audience, string> = { patient: "환자", guardian: "보호자", both: "환자·보호자" };

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
  existingSlugs,
  otherGuides,
  onClose,
  onSave,
}: {
  initialGuide: GuideContent | null;
  nextId: string;
  existingSlugs: string[];
  otherGuides: GuideContent[];
  onClose: () => void;
  /** 서버에 저장하는 동안 기다리고, 실패하면 오류를 던집니다(창이 열린 채로 오류가 표시됩니다). */
  onSave: (guide: GuideContent, changeNote?: string) => void | Promise<void>;
}) {
  const [slugError, setSlugError] = useState<string | null>(null);
  const [form, setForm] = useState<GuideContent>(
    initialGuide ?? {
      contentId: nextId,
      slug: "",
      title: "",
      category: "기타",
      subcategory: "",
      departments: [],
      patientStages: [],
      journeyStages: [],
      topicCategories: [],
      keywords: [],
      audience: "both",
      reviewStatus: "draft",
      approvalStatus: "unapproved",
      summary: "",
      estimatedReadMinutes: 2,
      status: "비게시",
      // 새로 등록하는 콘텐츠는 의료진 검토 대기로 시작합니다(기존 승인 상태와 별개의 필드).
      medicalReview: NEW_CONTENT_MEDICAL_REVIEW,
      needsClinicalReview: true,
      version: 1,
      createdAt: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
    },
  );
  const [keywordsText, setKeywordsText] = useState((initialGuide?.keywords ?? []).join(", "));
  const [changeNote, setChangeNote] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleDepartment(value: Department) {
    setForm((prev) => ({
      ...prev,
      departments: prev.departments.includes(value)
        ? prev.departments.filter((v) => v !== value)
        : [...prev.departments, value],
    }));
  }

  function toggleJourney(value: JourneyStageId) {
    setForm((prev) => {
      const cur = prev.journeyStages ?? [];
      return { ...prev, journeyStages: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  }

  function toggleTopic(value: TopicId) {
    setForm((prev) => {
      const cur = prev.topicCategories ?? [];
      return { ...prev, topicCategories: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  }

  // 승인 상태는 검토 상태에서 자동으로 정해집니다. "승인 완료"가 아니면 공식 안내로 표시되지 않습니다.
  function changeReviewStatus(status: ReviewStatus) {
    setForm((prev) => ({
      ...prev,
      reviewStatus: status,
      approvalStatus: status === "approved" ? "approved" : "unapproved",
      needsClinicalReview: status !== "approved",
    }));
  }

  // 의료진 검토 상태는 CMS 승인 상태와 별개입니다. 실제 의료진 검토가 끝났을 때만 관리자가 ‘검토 완료’로 바꿉니다.
  function changeMedicalReview(status: MedicalReviewStatus) {
    setForm((prev) => ({ ...prev, medicalReview: status }));
  }

  function updateSource(index: number, patch: Partial<SourceDocument>) {
    setForm((prev) => ({
      ...prev,
      sourceDocuments: (prev.sourceDocuments ?? []).map((src, i) => (i === index ? { ...src, ...patch } : src)),
    }));
  }

  function addSource() {
    setForm((prev) => ({
      ...prev,
      sourceDocuments: [...(prev.sourceDocuments ?? []), { title: "", kind: "official-web" as SourceKind }],
    }));
  }

  function removeSource(index: number) {
    setForm((prev) => {
      const next = (prev.sourceDocuments ?? []).filter((_, i) => i !== index);
      return { ...prev, sourceDocuments: next.length > 0 ? next : undefined };
    });
  }

  function toggleRelated(contentId: string) {
    setForm((prev) => {
      const current = prev.relatedContentIds ?? [];
      const next = current.includes(contentId)
        ? current.filter((id) => id !== contentId)
        : [...current, contentId];
      return { ...prev, relatedContentIds: next.length > 0 ? next : undefined };
    });
  }

  function addFaqItem() {
    setForm((prev) => ({ ...prev, faq: [...(prev.faq ?? []), { question: "", answer: "" }] }));
  }

  function updateFaqItem(index: number, patch: Partial<FaqItem>) {
    setForm((prev) => ({
      ...prev,
      faq: (prev.faq ?? []).map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeFaqItem(index: number) {
    setForm((prev) => {
      const next = (prev.faq ?? []).filter((_, i) => i !== index);
      return { ...prev, faq: next.length > 0 ? next : undefined };
    });
  }

  const phaseLabels = { ...PHASE_LABELS[form.category], ...form.phaseLabelOverride };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !form.title.trim() || !form.summary.trim()) return;

    // 주소는 직접 입력한 값을 우선하고, 비워 두면 제목에서 만듭니다. 겹치면 입력값은 오류, 자동 생성값은 번호를 붙입니다.
    const resolved = resolveSlug(form.slug, form.title, existingSlugs);
    if (resolved.error !== undefined) {
      setSlugError(resolved.error);
      return;
    }
    const slug = resolved.slug;
    setSlugError(null);

    if (reviewStatusOf(form) === "approved") {
      const blockers = approvalBlockers(form);
      if (blockers.length > 0) {
        setSaveErrors(["‘승인 완료’로 저장할 수 없습니다.", ...blockers]);
        return;
      }
    }
    setSaveErrors([]);

    const today = new Date().toISOString().slice(0, 10);
    const keywords = keywordsText
      .split(/[,\n]/)
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      await onSave(
        {
          ...form,
          slug,
          keywords,
          sourceDocuments: (form.sourceDocuments ?? []).filter((src) => src.title.trim()).length
            ? (form.sourceDocuments ?? []).filter((src) => src.title.trim())
            : undefined,
          lastReviewedAt: reviewStatusOf(form) === "approved" ? today : form.lastReviewedAt,
          ...medicalReviewOnSave(initialGuide, form, today),
          version: initialGuide ? form.version + 1 : 1,
          lastUpdated: today,
        },
        changeNote,
      );
    } catch (err) {
      setSaveErrors([err instanceof Error ? err.message : "저장하지 못했습니다."]);
    } finally {
      setSaving(false);
    }
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

        <div className="grid gap-3 sm:grid-cols-2">
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
          <Field label="세부 분류(subcategory)">
            <input
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              placeholder="예: CT"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="콘텐츠 URL(/c/[slug]) — 비워두면 제목에서 자동 생성">
          <input
            value={form.slug}
            onChange={(e) => {
              setForm({ ...form, slug: e.target.value });
              setSlugError(null);
            }}
            placeholder="예: ct-prep"
            className={inputClass}
          />
          {(() => {
            if (!slugify(form.slug.trim() || form.title)) return null;
            const r = resolveSlug(form.slug, form.title, existingSlugs);
            return (
              <p className={`mt-1 text-xs ${r.error !== undefined ? "font-semibold text-amber-800" : "text-slate-500"}`}>
                사용할 주소: /c/{r.error !== undefined ? r.base : r.slug}
                {r.error !== undefined ? " — 이미 사용 중입니다. 다른 주소를 입력해 주세요." : ""}
                {r.error === undefined && r.adjusted ? " (같은 주소가 있어 번호를 붙였습니다)" : ""}
              </p>
            );
          })()}
          {slugError && <p className="mt-1 text-xs font-semibold text-red-600">{slugError}</p>}
        </Field>

        <Field label="진료과 (복수 선택 가능)">
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENTS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggleDepartment(d)}
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

        <fieldset className="rounded-xl border border-slate-200 p-3">
          <legend className="px-1 text-xs font-bold text-slate-600">분류 (메인 화면 검색·필터에 사용)</legend>

          <p className="mb-1 mt-1 text-xs font-bold text-slate-600">환자 여정 단계 (복수 선택)</p>
          <div className="flex flex-wrap gap-1.5">
            {JOURNEY_STAGES.map((s) => (
              <button
                type="button"
                key={s.id}
                aria-pressed={(form.journeyStages ?? []).includes(s.id)}
                onClick={() => toggleJourney(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  (form.journeyStages ?? []).includes(s.id)
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <p className="mb-1 mt-4 text-xs font-bold text-slate-600">주제 (복수 선택, 여정 단계와 별도)</p>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((t) => (
              <button
                type="button"
                key={t.id}
                aria-pressed={(form.topicCategories ?? []).includes(t.id)}
                onClick={() => toggleTopic(t.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  (form.topicCategories ?? []).includes(t.id)
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="키워드 (쉼표로 구분, 검색에 사용)">
              <input
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="예: CT, 씨티, 조영제"
                className={inputClass}
              />
            </Field>
            <Field label="대상">
              <select
                value={form.audience ?? "both"}
                onChange={(e) => setForm({ ...form, audience: e.target.value as Audience })}
                className={inputClass}
              >
                {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
                  <option key={a} value={a}>
                    {AUDIENCE_LABEL[a]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {form.classificationReview && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
              <p className="font-bold">분류 검토 대상</p>
              <p className="mt-0.5">{form.classificationReview.reason}</p>
              <label className="mt-2 flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => setForm({ ...form, classificationReview: undefined })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                분류를 확인했으므로 검토 표시를 해제합니다
              </label>
            </div>
          )}
        </fieldset>

        <Field label="예상 읽기 시간(분)">
          <input
            type="number"
            min={1}
            value={form.estimatedReadMinutes}
            onChange={(e) => setForm({ ...form, estimatedReadMinutes: Number(e.target.value) })}
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
            value={form.importantNotice ?? ""}
            onChange={(e) => setForm({ ...form, importantNotice: e.target.value || undefined })}
            className={inputClass}
          />
        </Field>

        <Field label={phaseLabels.before}>
          <textarea
            rows={2}
            value={form.before ?? ""}
            onChange={(e) => setForm({ ...form, before: e.target.value || undefined })}
            className={inputClass}
          />
        </Field>

        <Field label={phaseLabels.during}>
          <textarea
            rows={2}
            value={form.during ?? ""}
            onChange={(e) => setForm({ ...form, during: e.target.value || undefined })}
            className={inputClass}
          />
        </Field>

        <Field label={phaseLabels.after}>
          <textarea
            rows={2}
            value={form.after ?? ""}
            onChange={(e) => setForm({ ...form, after: e.target.value || undefined })}
            className={inputClass}
          />
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">자주 묻는 질문</span>
            <button
              type="button"
              onClick={addFaqItem}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              + 질문 추가
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {(form.faq ?? []).map((item, index) => (
              <div key={index} className="flex flex-col gap-1.5 rounded-lg border border-slate-200 p-2.5">
                <div className="flex gap-1.5">
                  <input
                    value={item.question}
                    onChange={(e) => updateFaqItem(index, { question: e.target.value })}
                    placeholder="질문"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeFaqItem(index)}
                    className="shrink-0 rounded-lg border border-slate-300 px-2.5 text-xs font-bold text-slate-500 hover:border-red-300 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.answer}
                  onChange={(e) => updateFaqItem(index, { answer: e.target.value })}
                  placeholder="답변"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

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

        <Field label="관련 안내 (복수 선택 가능)">
          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {otherGuides.length === 0 ? (
              <p className="px-1 py-1 text-xs text-slate-500">선택할 수 있는 다른 콘텐츠가 없습니다.</p>
            ) : (
              otherGuides.map((g) => (
                <label key={g.contentId} className="flex items-center gap-2 px-1 py-1 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={(form.relatedContentIds ?? []).includes(g.contentId)}
                    onChange={() => toggleRelated(g.contentId)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {g.title}
                </label>
              ))
            )}
          </div>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="검토 상태">
            <select
              value={reviewStatusOf(form)}
              onChange={(e) => changeReviewStatus(e.target.value as ReviewStatus)}
              className={inputClass}
            >
              {REVIEW_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {REVIEW_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="승인 상태">
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {form.approvalStatus === "approved" ? "승인" : "미승인 (공식 안내로 표시되지 않음)"}
            </p>
          </Field>
          <Field label="의료진 검토 (환자용 공개 조건)">
            <select
              value={form.medicalReview ?? "completed"}
              onChange={(e) => changeMedicalReview(e.target.value as MedicalReviewStatus)}
              className={inputClass}
            >
              <option value="pending">검토 대기 (환자용 화면 비공개)</option>
              <option value="completed">{initialGuide && !initialGuide.medicalReview ? "검토 완료 (기존 콘텐츠)" : "검토 완료"}</option>
            </select>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500">
              새 콘텐츠는 ‘검토 대기’로 시작합니다. 실제 의료진 검토가 끝났을 때만 ‘검토 완료’로 바꿔 주세요. 위의 승인 상태와는 별개입니다.
            </span>
          </Field>
          <Field label="담당 부서">
            <input
              value={form.ownerDepartment ?? ""}
              onChange={(e) => setForm({ ...form, ownerDepartment: e.target.value || undefined })}
              placeholder="예: 영상의학과"
              className={inputClass}
            />
          </Field>
          <Field label="내용 확인 담당 부서">
            <input
              value={form.reviewerDepartment ?? ""}
              onChange={(e) => setForm({ ...form, reviewerDepartment: e.target.value || undefined })}
              placeholder="예: 심장내과"
              className={inputClass}
            />
          </Field>
        </div>
        <p className="-mt-2 text-xs text-slate-500">
          ‘승인 완료’를 선택하면 승인 상태가 ‘승인’으로 바뀌고 최종 검토일이 오늘로 기록됩니다. 그 전에는 환자 화면에 ‘공식 안내 아님’ 표시가 나갑니다.
        </p>

        <fieldset className="rounded-lg border border-slate-200 p-3">
          <legend className="px-1 text-xs font-bold text-slate-600">내용의 출처 (승인 전 근거 확인용)</legend>
          {(form.sourceDocuments ?? []).length === 0 && (
            <p className="mb-2 text-xs text-slate-600">등록된 출처가 없습니다. 병원 홈페이지·부서 자료·직원 제공 문구 중 근거를 추가해 주세요.</p>
          )}
          <div className="flex flex-col gap-3">
            {(form.sourceDocuments ?? []).map((src, i) => (
              <div key={i} className="grid gap-2 rounded-lg bg-slate-50 p-2.5 sm:grid-cols-[150px_1fr]">
                <select
                  aria-label={`출처 ${i + 1} 종류`}
                  value={src.kind ?? "official-web"}
                  onChange={(e) => updateSource(i, { kind: e.target.value as SourceKind })}
                  className={inputClass}
                >
                  {(Object.keys(SOURCE_KIND_LABEL) as SourceKind[]).map((k) => (
                    <option key={k} value={k}>
                      {SOURCE_KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={`출처 ${i + 1} 제목`}
                  value={src.title}
                  onChange={(e) => updateSource(i, { title: e.target.value })}
                  placeholder="자료 이름 (예: 영상의학과 CT실 검사 안내)"
                  className={inputClass}
                />
                <input
                  aria-label={`출처 ${i + 1} 주소`}
                  value={src.url ?? ""}
                  onChange={(e) => updateSource(i, { url: e.target.value || undefined })}
                  placeholder="주소(선택)"
                  className={`${inputClass} sm:col-start-2`}
                />
                <div className="flex items-center gap-2 sm:col-start-2">
                  <input
                    aria-label={`출처 ${i + 1} 메모`}
                    value={src.note ?? ""}
                    onChange={(e) => updateSource(i, { note: e.target.value || undefined })}
                    placeholder="메모(선택, 어느 부분의 근거인지)"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeSource(i)}
                    className="min-h-[40px] shrink-0 rounded-lg px-2 text-xs font-bold text-rose-700 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSource}
            className="mt-2 min-h-[36px] rounded-full border border-brand-blue/40 bg-white px-3 text-xs font-bold text-brand-blue-dark hover:bg-blue-soft"
          >
            + 출처 추가
          </button>
        </fieldset>

        <Field label="원본 파일 첨부 (PNG·JPG·PDF, 파일당 1MB 이하)">
          <input
            type="file"
            accept={ACCEPTED_ATTACHMENT}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const result = await readAttachment(file);
              if (!result.ok) {
                setFileError(result.error);
                return;
              }
              setFileError(null);
              setForm((prev) => ({ ...prev, sourceFiles: [...(prev.sourceFiles ?? []), result.file] }));
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-blue-dark"
          />
        </Field>
        {fileError && (
          <p role="alert" className="-mt-2 text-xs font-semibold text-rose-700">
            {fileError}
          </p>
        )}
        {(form.sourceFiles ?? []).length > 0 && (
          <ul className="-mt-2 flex flex-col gap-1.5">
            {(form.sourceFiles ?? []).map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <span className="truncate font-semibold">{f.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => {
                      const next = (prev.sourceFiles ?? []).filter((_, idx) => idx !== i);
                      return { ...prev, sourceFiles: next.length > 0 ? next : undefined };
                    })
                  }
                  className="shrink-0 font-bold text-rose-700 hover:underline"
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        )}

        <Field label="이번 변경 내용 요약 (버전 이력에 기록됩니다)">
          <input
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder={initialGuide ? "예: 금식 시간 안내 문구 수정" : "예: 신규 등록"}
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.status === "게시"}
            onChange={(e) => setForm({ ...form, status: e.target.checked ? "게시" : "비게시" })}
            className="h-4 w-4 rounded border-slate-300"
          />
          바로 게시
        </label>

        {saveErrors.length > 0 && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {saveErrors.map((m, i) => (
              <p key={m} className={i === 0 ? "font-bold" : "mt-1"}>
                {m}
              </p>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:ring-offset-2 active:translate-y-px"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
