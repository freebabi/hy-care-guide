"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GuideFormModal from "@/components/care-guide/staff/GuideFormModal";
import { nextContentId, upsertGuide } from "@/lib/care-guide/cms-store";
import {
  KIND_LABEL,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_ORDER,
  updateRequest,
  useRequests,
} from "@/lib/care-guide/requests-store";
import { useRole } from "@/lib/care-guide/role";
import type { ImprovementRequest, ImprovementStatus, SourceFile } from "@/lib/care-guide/types";
import { fileHref } from "@/lib/care-guide/file-url";
import { guidePath } from "@/lib/care-guide/slug";
import { useGuides } from "@/lib/care-guide/use-guides";

const STATUS_BADGE: Record<ImprovementStatus, string> = {
  received: "bg-slate-100 text-slate-800 ring-slate-300",
  reviewing: "bg-amber-50 text-amber-900 ring-amber-200",
  approved: "bg-blue-soft text-brand-blue-dark ring-brand-blue/30",
  applied: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

/** 첨부 파일 미리보기: 이미지는 바로 보여주고, PDF는 눌러서 이 화면 안에서 확인합니다. */
function AttachmentPreview({ file }: { file: SourceFile }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  async function openPdf() {
    const blob = await (await fetch(fileHref(file.dataUrl), { credentials: "same-origin" })).blob();
    setPdfUrl(URL.createObjectURL(blob));
  }

  return (
    <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
      <p className="font-bold">
        첨부자료 · {file.name} ({Math.max(1, Math.round(file.size / 1024))}KB)
      </p>
      {file.type.startsWith("image/") ? (
        // 직원이 올린 임의 크기의 이미지를 data URL로 보여주므로 next/image 최적화 대상이 아닙니다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fileHref(file.dataUrl)} alt={`${file.name} 미리보기`} className="mt-2 max-h-56 w-auto max-w-full rounded border border-slate-200" />
      ) : pdfUrl ? (
        <iframe title={`${file.name} PDF 미리보기`} src={pdfUrl} className="mt-2 h-72 w-full rounded border border-slate-200 bg-white" />
      ) : (
        <button
          type="button"
          onClick={openPdf}
          className="mt-2 min-h-[36px] rounded-full border border-brand-blue/40 bg-white px-3 font-bold text-brand-blue-dark hover:bg-blue-soft"
        >
          PDF 미리보기
        </button>
      )}
      <a href={fileHref(file.dataUrl)} download={file.name} className="ml-0 mt-2 inline-block font-semibold text-brand-blue underline underline-offset-2">
        파일 내려받기
      </a>
    </div>
  );
}

export default function RequestsPage() {
  const role = useRole();
  const { guides } = useGuides();
  const { requests, status: requestsStatus, error: requestsError, refresh: refreshRequests } = useRequests();
  const [filter, setFilter] = useState<ImprovementStatus | "all">("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(() => requests.filter((r) => filter === "all" || r.status === filter), [requests, filter]);
  const counts = useMemo(() => {
    const map = new Map<ImprovementStatus, number>();
    requests.forEach((r) => map.set(r.status, (map.get(r.status) ?? 0) + 1));
    return map;
  }, [requests]);

  const applying = applyingId ? requests.find((r) => r.requestId === applyingId) : undefined;
  const applyingGuide = applying ? guides.find((g) => g.contentId === applying.contentId) : undefined;

  async function setStatus(r: ImprovementRequest, status: ImprovementStatus) {
    try {
      await updateRequest(r.requestId, { status, adminNote: (notes[r.requestId] ?? r.adminNote ?? "").trim() || undefined });
      setError(null);
      await refreshRequests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리하지 못했습니다.");
    }
  }

  const isAdmin = role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">개선 요청</h1>
        <p className="mt-1 text-sm text-slate-700">
          {isAdmin
            ? "직원이 남긴 수정·개선 요청을 검토하고 처리합니다. 승인한 요청만 안내 내용에 반영하세요."
            : "내가 남긴 요청의 진행 상황을 확인합니다. (다른 직원의 요청은 보이지 않습니다.) 요청은 관리자와 담당 부서가 검토·승인한 뒤 반영됩니다. 처리는 관리자만 할 수 있습니다."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="처리 상태">
        {(["all", ...REQUEST_STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={`min-h-[36px] rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
              filter === s
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-blue-soft/60"
            }`}
          >
            {s === "all" ? `전체 ${requests.length}` : `${REQUEST_STATUS_LABEL[s]} ${counts.get(s) ?? 0}`}
          </button>
        ))}
      </div>

      {(error || (requestsStatus === "error" && requestsError)) && (
        <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error ?? requestsError}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-700">
          {requests.length === 0 ? (
            <>
              아직 등록된 개선 요청이 없습니다. 안내 상세 화면 아래 ‘수정·개선 요청 남기기’에서 등록할 수 있습니다.
              <div className="mt-4">
                <Link href="/" className="inline-flex min-h-[36px] items-center font-bold text-brand-blue underline underline-offset-2">
                  안내 목록 보기
                </Link>
              </div>
            </>
          ) : (
            "이 상태의 요청이 없습니다."
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {shown.map((r) => {
            const guide = guides.find((g) => g.contentId === r.contentId);
            return (
              <li key={r.requestId} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">{r.requestId}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_BADGE[r.status]}`}>
                    {REQUEST_STATUS_LABEL[r.status]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                    {KIND_LABEL[r.kind]}
                  </span>
                  <span className="text-xs text-slate-600">
                    {r.requesterDepartment} · {formatDate(r.createdAt)}
                  </span>
                </div>
                <h2 className="mt-2 text-base font-bold text-slate-900">
                  {guide ? (
                    <Link href={guidePath(guide.slug)} className="hover:underline">
                      {r.contentTitle}
                    </Link>
                  ) : (
                    r.contentTitle
                  )}
                  <span className="ml-2 text-xs font-medium text-slate-600">
                    요청 당시 v{r.contentVersion}
                    {guide && guide.version !== r.contentVersion ? ` · 현재 v${guide.version}` : ""}
                  </span>
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">{r.message}</p>
                {r.attachment && <AttachmentPreview file={r.attachment} />}

                {r.adminNote && !isAdmin && (
                  <p className="mt-3 rounded-lg bg-blue-soft px-3 py-2 text-sm text-slate-800">
                    <b>관리자 답변</b> · {r.adminNote}
                  </p>
                )}
                {r.status === "applied" && (
                  <p className="mt-3 text-xs font-semibold text-emerald-800">
                    반영 완료{r.appliedVersion ? ` · v${r.appliedVersion}로 변경` : ""} · {formatDate(r.updatedAt)}
                  </p>
                )}

                {isAdmin && r.status !== "applied" && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-slate-700">관리자 메모 · 답변</span>
                      <textarea
                        value={notes[r.requestId] ?? r.adminNote ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [r.requestId]: e.target.value }))}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {r.status === "received" && (
                        <button type="button" onClick={() => setStatus(r, "reviewing")} className="min-h-[40px] rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-800 hover:bg-slate-50">
                          검토 시작
                        </button>
                      )}
                      {(r.status === "received" || r.status === "reviewing") && (
                        <button type="button" onClick={() => setStatus(r, "approved")} className="min-h-[40px] rounded-full bg-brand-blue px-4 text-sm font-bold text-white hover:bg-brand-blue-dark">
                          승인 (담당 부서 확인 후)
                        </button>
                      )}
                      {r.status === "approved" && (
                        <button type="button" onClick={() => setApplyingId(r.requestId)} className="min-h-[40px] rounded-full bg-brand-blue px-4 text-sm font-bold text-white hover:bg-brand-blue-dark">
                          안내 내용 수정하고 반영
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button type="button" onClick={() => setStatus(r, "rejected")} className="min-h-[40px] rounded-full border border-rose-300 px-4 text-sm font-bold text-rose-800 hover:bg-rose-50">
                          반려
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {applying && applyingGuide && isAdmin && (
        <GuideFormModal
          initialGuide={applyingGuide}
          nextId={nextContentId(guides)}
          existingSlugs={guides.filter((g) => g.contentId !== applyingGuide.contentId).map((g) => g.slug)}
          otherGuides={guides.filter((g) => g.contentId !== applyingGuide.contentId)}
          onClose={() => setApplyingId(null)}
          onSave={async (saved, note) => {
            const result = await upsertGuide(saved, note || `개선 요청 ${applying.requestId} 반영`, applying.requestId);
            await updateRequest(applying.requestId, {
              status: "applied",
              appliedVersion: result.version,
              adminNote: (notes[applying.requestId] ?? applying.adminNote ?? "").trim() || undefined,
            });
            await refreshRequests();
            setApplyingId(null);
          }}
        />
      )}
    </div>
  );
}
