"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ACCEPTED_ATTACHMENT,
  KIND_LABEL,
  readAttachment,
  submitRequest,
} from "@/lib/care-guide/requests-store";
import type { GuideContent, ImprovementKind, ImprovementRequest, SourceFile } from "@/lib/care-guide/types";
import { CheckIcon } from "../icons";
import Modal from "../modals/Modal";

const REQUEST_DEPARTMENTS = [
  "영상의학과",
  "소화기내과",
  "심장내과",
  "외과",
  "정형외과",
  "내과",
  "진단검사의학과",
  "핵의학과",
  "마취통증의학과",
  "재활의학과",
  "간호국",
  "감염관리실",
  "원무팀",
  "기타",
];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

function RequestForm({ guide, onClose }: { guide: GuideContent; onClose: () => void }) {
  const [kind, setKind] = useState<ImprovementKind>("error");
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState("");
  const [attachment, setAttachment] = useState<SourceFile | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<ImprovementRequest | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!message.trim()) {
      setError("요청 내용을 입력해 주세요.");
      return;
    }
    if (!department) {
      setError("요청 부서를 선택해 주세요.");
      return;
    }
    setSending(true);
    const result = await submitRequest({
      contentId: guide.contentId,
      kind,
      message: message.trim(),
      requesterDepartment: department,
      attachment,
    });
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setDone(result.request);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-extrabold text-slate-900">개선 요청이 접수되었습니다</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          요청 번호 <b>{done.requestId}</b> · 안내 내용은 바로 바뀌지 않습니다. 관리자와 담당 부서가 검토하고 승인한 뒤 반영됩니다.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-full border border-slate-300 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
          <Link
            href="/requests"
            className="inline-flex min-h-[44px] items-center rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark"
          >
            요청 진행 상황 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">수정·개선 요청 남기기</h2>
        <p className="mt-1 text-sm text-slate-700">
          대상 안내: <b>{guide.title}</b> (v{guide.version})
        </p>
      </div>

      <p className="rounded-lg bg-blue-soft px-3 py-2.5 text-xs leading-relaxed text-slate-700">
        이 요청은 안내 내용을 직접 고치지 않고 별도로 등록됩니다. 담당 부서의 검토·승인을 거쳐야 공식 자료가 바뀝니다.
        환자 이름·등록번호 같은 개인정보는 적지 마세요.
      </p>

      <fieldset>
        <legend className="mb-1.5 text-sm font-bold text-slate-800">요청 종류</legend>
        <div className="flex flex-col gap-1.5">
          {(Object.keys(KIND_LABEL) as ImprovementKind[]).map((k) => (
            <label key={k} className="flex min-h-[40px] items-center gap-2 text-sm text-slate-800">
              <input type="radio" name="kind" checked={kind === k} onChange={() => setKind(k)} className="h-4 w-4" />
              {KIND_LABEL[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-800">
          내용 <span className="text-rose-700">(필수)</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="어느 부분이 어떻게 잘못되었는지, 또는 어떻게 바뀌면 좋을지 적어 주세요."
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-800">
          요청 부서 <span className="text-rose-700">(필수)</span>
        </span>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
          <option value="">선택해 주세요</option>
          {REQUEST_DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <div>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-800">첨부자료 (선택 · PNG·JPG·PDF, 1MB 이하)</span>
          <input
            type="file"
            accept={ACCEPTED_ATTACHMENT}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const result = await readAttachment(file);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setError(null);
              setAttachment(result.file);
            }}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-blue-dark"
          />
        </label>
        {attachment && (
          <p className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <span className="truncate font-semibold">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(undefined)}
              className="shrink-0 font-bold text-rose-700 hover:underline"
            >
              제거
            </button>
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-full border border-slate-300 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={sending}
          className="min-h-[44px] rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "제출 중…" : "요청 제출"}
        </button>
      </div>
    </form>
  );
}

/** 상세 화면 하단의 개선 요청 안내 박스. 누르면 요청 작성 창이 열립니다. */
export default function ImprovementRequestPanel({ guide }: { guide: GuideContent }) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="improve-title" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <h3 id="improve-title" className="text-sm font-bold text-slate-900">
        이 안내자료에 수정 또는 개선이 필요한 부분이 있나요?
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-700">
        오류·개선 의견·불편한 점을 남겨 주세요. 안내 내용이 바로 바뀌지는 않으며, 담당 부서의 검토와 승인 후 반영됩니다.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 min-h-[40px] rounded-full border border-brand-blue/40 bg-white px-4 text-sm font-bold text-brand-blue-dark transition-colors hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
      >
        수정·개선 요청 남기기
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} ariaLabel="수정·개선 요청" maxWidthClassName="sm:max-w-lg">
          {(requestClose) => <RequestForm guide={guide} onClose={requestClose} />}
        </Modal>
      )}
    </section>
  );
}
