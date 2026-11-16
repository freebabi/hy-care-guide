"use client";

import { Archive, Eye, Pencil, Pin, PinOff, Plus, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/care-guide/modals/ConfirmDialog";
import Modal from "@/components/care-guide/modals/Modal";
import { FlagBadges, RevisionBox, TypeBadge, summarize } from "@/components/care-guide/notices";
import { formatDateTime, todayKst } from "@/lib/care-guide/format";
import { deleteNoticeApi, fetchNotices, refreshUnread, saveNotice, type NoticeDraft } from "@/lib/care-guide/me-api";
import { NOTICE_TYPES, NOTICE_TYPE_LABEL, type NoticeItem, type NoticeStatus, type NoticeType } from "@/lib/care-guide/me-types";
import { useRole } from "@/lib/care-guide/role";
import type { GuideContent } from "@/lib/care-guide/types";
import { useGuides } from "@/lib/care-guide/use-guides";

const input =
  "min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30";
const iconBtn =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:opacity-50";

const blank = (): NoticeDraft => ({
  type: "other",
  title: "",
  body: "",
  important: false,
  pinned: false,
  status: "draft",
  relatedContentIds: [],
});

function toDraft(n: NoticeItem): NoticeDraft {
  return {
    type: n.type,
    title: n.title,
    body: n.body,
    important: n.important,
    pinned: n.pinned,
    status: n.status,
    relatedContentIds: n.relatedContentIds,
    revision: n.revision,
  };
}

function Editor({
  editing,
  guides,
  onClose,
  onSaved,
}: {
  editing: NoticeItem | null;
  guides: GuideContent[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<NoticeDraft>(editing ? toDraft(editing) : blank());
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof NoticeDraft>(k: K, v: NoticeDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const byId = useMemo(() => new Map(guides.map((g) => [g.contentId, g])), [guides]);
  const candidates = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return guides.filter((g) => !q || g.title.toLowerCase().includes(q)).slice(0, 30);
  }, [guides, filter]);

  function toggleRelated(id: string) {
    set("relatedContentIds", draft.relatedContentIds.includes(id) ? draft.relatedContentIds.filter((x) => x !== id) : [...draft.relatedContentIds, id]);
  }

  function pickRevisionContent(contentId: string) {
    if (!contentId) return set("revision", undefined);
    const g = byId.get(contentId);
    set("revision", {
      contentId,
      toVersion: g?.version,
      fromVersion: g && g.version > 1 ? g.version - 1 : undefined,
      revisedAt: todayKst(),
      changes: draft.revision?.changes,
    });
    if (!draft.relatedContentIds.includes(contentId)) set("relatedContentIds", [contentId, ...draft.relatedContentIds]);
  }

  async function submit(status: NoticeStatus) {
    setError("");
    setBusy(true);
    const r = await saveNotice(editing?.id ?? null, { ...draft, status });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    await refreshUnread();
    onSaved();
  }

  const isRevision = draft.type === "revision";
  const revGuide = draft.revision ? byId.get(draft.revision.contentId) : undefined;
  const previewNotice: NoticeItem | null = draft.revision
    ? { ...draft, id: "preview", createdAt: "", updatedAt: "", read: true }
    : null;

  return (
    <Modal onClose={onClose} ariaLabel={editing ? "공지 수정" : "공지 작성"} maxWidthClassName="sm:max-w-2xl">
      {(requestClose) => (
        <div className="p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-slate-900">{editing ? "공지 수정" : "새 공지 작성"}</h2>

          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
              공지 유형
              <select value={draft.type} onChange={(e) => set("type", e.target.value as NoticeType)} className={input}>
                {NOTICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {NOTICE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
              제목
              <input value={draft.title} onChange={(e) => set("title", e.target.value)} maxLength={120} className={input} placeholder="공지 제목" />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
              내용
              <textarea
                value={draft.body}
                onChange={(e) => set("body", e.target.value)}
                rows={7}
                maxLength={8000}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal leading-relaxed focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                placeholder="공지 내용을 입력하세요. 환자 개인정보는 쓰지 마세요."
              />
            </label>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex min-h-[40px] items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.important || draft.type === "important"}
                  disabled={draft.type === "important"}
                  onChange={(e) => set("important", e.target.checked)}
                  className="h-4 w-4"
                />
                중요 공지로 표시
              </label>
              <label className="flex min-h-[40px] items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={draft.pinned} onChange={(e) => set("pinned", e.target.checked)} className="h-4 w-4" />
                목록 상단에 고정
              </label>
            </div>

            {isRevision && (
              <fieldset className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                <legend className="px-1 text-xs font-bold text-indigo-900">개정 정보</legend>
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                  개정된 콘텐츠
                  <select value={draft.revision?.contentId ?? ""} onChange={(e) => pickRevisionContent(e.target.value)} className={input}>
                    <option value="">선택하세요</option>
                    {guides.map((g) => (
                      <option key={g.contentId} value={g.contentId}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </label>
                {draft.revision && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                        개정 전 버전
                        <input
                          type="number"
                          min={0}
                          value={draft.revision.fromVersion ?? ""}
                          onChange={(e) => set("revision", { ...draft.revision!, fromVersion: e.target.value === "" ? undefined : Number(e.target.value) })}
                          className={input}
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                        개정 후 버전
                        <input
                          type="number"
                          min={0}
                          value={draft.revision.toVersion ?? ""}
                          onChange={(e) => set("revision", { ...draft.revision!, toVersion: e.target.value === "" ? undefined : Number(e.target.value) })}
                          className={input}
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                        개정일
                        <input
                          type="date"
                          value={draft.revision.revisedAt ?? ""}
                          onChange={(e) => set("revision", { ...draft.revision!, revisedAt: e.target.value || undefined })}
                          className={input}
                        />
                      </label>
                    </div>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                      주요 변경사항
                      <textarea
                        value={draft.revision.changes ?? ""}
                        onChange={(e) => set("revision", { ...draft.revision!, changes: e.target.value })}
                        rows={3}
                        maxLength={1500}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
                      />
                    </label>
                    {revGuide && previewNotice && <RevisionBox notice={previewNotice} guides={guides} />}
                  </>
                )}
              </fieldset>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-700">관련 안내자료 연결 ({draft.relatedContentIds.length}건)</p>
              {draft.relatedContentIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {draft.relatedContentIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleRelated(id)}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-soft px-2.5 py-1 text-xs font-semibold text-brand-blue-dark hover:bg-blue-soft/70"
                      aria-label={`${byId.get(id)?.title ?? id} 연결 해제`}
                    >
                      {byId.get(id)?.title ?? id} ✕
                    </button>
                  ))}
                </div>
              )}
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="안내자료 제목으로 찾기" className={input} />
              <ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200">
                {candidates.map((g) => (
                  <li key={g.contentId} className="border-b border-slate-100 last:border-0">
                    <label className="flex min-h-[40px] cursor-pointer items-center gap-2 px-3 text-sm text-slate-800 hover:bg-slate-50">
                      <input type="checkbox" checked={draft.relatedContentIds.includes(g.contentId)} onChange={() => toggleRelated(g.contentId)} className="h-4 w-4" />
                      <span className="[overflow-wrap:anywhere]">{g.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-900">
                {error}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={requestClose} className="min-h-[44px] rounded-full border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              닫기
            </button>
            {(!editing || editing.status === "draft") && (
              <button
                type="button"
                disabled={busy}
                onClick={() => submit("draft")}
                className="min-h-[44px] rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                임시 저장
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => submit(editing?.status === "ended" ? "ended" : "published")}
              className="min-h-[44px] rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {busy ? "저장 중…" : editing?.status === "published" ? "변경 내용 저장" : editing?.status === "ended" ? "수정 저장" : "게시하기"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function NoticeManagePage() {
  const role = useRole();
  const { guides } = useGuides();
  const [notices, setNotices] = useState<NoticeItem[] | null>(null);
  const [error, setError] = useState("");
  const [durable, setDurable] = useState(true);
  const [editor, setEditor] = useState<{ notice: NoticeItem | null } | null>(null);
  const [deleting, setDeleting] = useState<NoticeItem | null>(null);

  const load = useCallback(async () => {
    const r = await fetchNotices(true);
    if (!r.ok) return setError(r.error);
    setError("");
    setNotices(r.notices);
    setDurable(r.durable);
  }, []);

  useEffect(() => {
    if (role !== "ADMIN") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [role, load]);

  async function change(n: NoticeItem, patch: Partial<NoticeDraft>) {
    const r = await saveNotice(n.id, { ...toDraft(n), ...patch });
    if (!r.ok) setError(r.error);
    else {
      await load();
      await refreshUnread();
    }
  }

  if (role !== "ADMIN") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <h1 className="text-lg font-extrabold text-slate-900">관리자 전용 화면입니다</h1>
        <p className="text-sm leading-relaxed text-slate-700">공지 작성과 관리는 관리자만 할 수 있습니다.</p>
        <Link href="/notices" className="mt-1 inline-flex min-h-[44px] items-center rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark">
          공지 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">공지 관리</h1>
          <p className="mt-1 text-sm text-slate-600">공지를 작성·수정하고 게시하거나 게시를 종료합니다. 임시 저장한 공지는 직원에게 보이지 않습니다.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ notice: null })}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />새 공지 작성
        </button>
      </div>

      {!durable && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          현재 서버 환경에서는 공지가 영구 보관되지 않아 서버가 다시 시작되면 사라질 수 있습니다.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {error}
        </p>
      )}

      {notices === null ? (
        <p className="py-10 text-center text-sm text-slate-600">불러오는 중입니다…</p>
      ) : notices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-700">
          등록된 공지가 없습니다. ‘새 공지 작성’으로 첫 공지를 등록해 보세요.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {notices.map((n) => (
            <li key={n.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <TypeBadge type={n.type} />
                <FlagBadges notice={n} showStatus />
                <span className="ml-auto text-xs text-slate-500">수정 {formatDateTime(n.updatedAt)}</span>
              </div>
              <p className="mt-2 font-bold text-slate-900 [overflow-wrap:anywhere]">{n.title || "(제목 없음)"}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{summarize(n.body, 140)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => setEditor({ notice: n })} className={iconBtn}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  수정
                </button>
                {n.status !== "published" ? (
                  <button type="button" onClick={() => change(n, { status: "published" })} className={`${iconBtn} border-brand-blue/40 text-brand-blue-dark`}>
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    {n.status === "ended" ? "다시 게시" : "게시"}
                  </button>
                ) : (
                  <button type="button" onClick={() => change(n, { status: "ended" })} className={iconBtn}>
                    <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                    게시 종료
                  </button>
                )}
                <button type="button" onClick={() => change(n, { pinned: !n.pinned })} className={iconBtn}>
                  {n.pinned ? <PinOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Pin className="h-3.5 w-3.5" aria-hidden="true" />}
                  {n.pinned ? "고정 해제" : "상단 고정"}
                </button>
                <Link href={`/notices/${encodeURIComponent(n.id)}`} className={iconBtn}>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  보기
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleting(n)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editor && (
        <Editor
          editing={editor.notice}
          guides={guides}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            void load();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="공지 삭제"
          message={`‘${deleting.title || "제목 없음"}’ 공지를 삭제합니다. 삭제하면 되돌릴 수 없습니다. 내용을 보존하려면 삭제 대신 ‘게시 종료’를 사용하세요.`}
          confirmLabel="삭제"
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            const r = await deleteNoticeApi(deleting.id);
            if (!r.ok) setError(r.error);
            await load();
            await refreshUnread();
          }}
        />
      )}
    </div>
  );
}
