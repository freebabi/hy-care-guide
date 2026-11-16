"use client";

import { useCallback, useEffect, useState } from "react";
import { withBasePath } from "@/lib/care-guide/base-path";
import { GUIDES } from "@/lib/care-guide/guides-data";
import { refreshGuides, useGuides } from "@/lib/care-guide/guides-client";
import { slugEquals } from "@/lib/care-guide/slug";

/**
 * 관리자 전용: 서버 저장 상태, 백업 내려받기, 백업 복구, 예전(브라우저 저장) 데이터 옮기기.
 * 서버 저장소(APP_DATA_DIR)는 플랫폼의 자동 백업이 없으므로, 관리자가 주기적으로 백업 파일을 내려받아 보관해야 합니다.
 */
interface StorageInfo {
  status: { durable: boolean; writable: boolean; configured: boolean; temporary: boolean; message: string };
  counts: { guideChanges: number; requests: number } | null;
  dataOk: boolean;
  dataMessage?: string;
}

interface PlanGuide {
  contentId: string;
  title: string;
  kind: "seed-modified" | "added";
  state: "new" | "same" | "differs" | "conflict";
  detail?: string;
  current?: { version: number; lastUpdated: string; status: string };
  incoming: { version: number; lastUpdated: string; status: string; medicalReview?: string };
}

interface Plan {
  source: "backup" | "legacy";
  omittedRequestAttachments: number;
  guides: PlanGuide[];
  requests: Array<{ requestId: string; title: string; state: "new" | "same" | "differs" }>;
  skipped: Array<{ type: "guide" | "request"; label: string; reason: string }>;
  summary: { guidesNew: number; guidesSame: number; guidesDiffer: number; guidesConflict: number; requestsNew: number; requestsExisting: number; skipped: number };
  revisions: { guides: number; requests: number };
}

const LEGACY_GUIDES_KEY = "hycg.guides.v5";
const LEGACY_REQUESTS_KEY = "hycg.requests.v1";

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(withBasePath(url), { cache: "no-store", credentials: "same-origin", ...init });
    const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!res.ok || !data) return { ok: false, error: data?.error ?? "처리하지 못했습니다." };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "서버에 연결하지 못했습니다." };
  }
}

interface LegacyData {
  guides: unknown[];
  requests: unknown[];
  /** 서버로 옮길 후보 콘텐츠 수(수정하지 않은 기존 안내는 제외, 서버와 같은 기준) */
  candidates: number;
  untouched: number;
}

/** 서버(backup.ts의 parseImport)와 같은 기준: 새로 등록한 콘텐츠이거나, 기존 안내를 실제로 고친 것만 옮깁니다. */
function isLegacyCandidate(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return true;
  const o = raw as { contentId?: unknown; slug?: unknown; status?: unknown; versionHistory?: unknown };
  const seed = GUIDES.find((g) => g.contentId === o.contentId);
  if (!seed) return true;
  if (typeof o.slug === "string" && !slugEquals(seed.slug, o.slug)) return true;
  return (Array.isArray(o.versionHistory) && o.versionHistory.length > 0) || o.status !== seed.status;
}

function readLegacy(): LegacyData | null {
  try {
    const g = JSON.parse(window.localStorage.getItem(LEGACY_GUIDES_KEY) ?? "null");
    const r = JSON.parse(window.localStorage.getItem(LEGACY_REQUESTS_KEY) ?? "null");
    const guides = Array.isArray(g) ? g : [];
    const requests = Array.isArray(r) ? r : [];
    const candidates = guides.filter(isLegacyCandidate).length;
    // 옮길 것이 하나도 없으면(수정하지 않은 기존 안내뿐) 안내 상자를 보이지 않습니다.
    return candidates || requests.length ? { guides, requests, candidates, untouched: guides.length - candidates } : null;
  } catch {
    return null;
  }
}

const STATE_LABEL: Record<PlanGuide["state"], string> = { new: "새로 추가", same: "현재와 같음", differs: "현재와 다름", conflict: "충돌(가져올 수 없음)" };

export default function ServerDataPanel() {
  const { status: loadStatus, error: loadError, seedNewerIds } = useGuides();
  const [info, setInfo] = useState<StorageInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [payload, setPayload] = useState<unknown>(null);
  const [payloadName, setPayloadName] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [overwrite, setOverwrite] = useState<Set<string>>(new Set());
  const [addNew, setAddNew] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [legacy, setLegacy] = useState<LegacyData | null>(null);

  const loadInfo = useCallback(async () => {
    const r = await api<StorageInfo>("/api/admin/storage");
    if (r.ok) {
      setInfo(r.data);
      setInfoError(null);
    } else setInfoError(r.error);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInfo();
    setLegacy(readLegacy());
  }, [loadInfo]);

  function resetRestore() {
    setPayload(null);
    setPayloadName("");
    setPlan(null);
    setOverwrite(new Set());
    setConfirmed(false);
  }

  async function startPreview(data: unknown, name: string) {
    setBusy(true);
    setMessage(null);
    const r = await api<{ plan: Plan }>("/api/admin/backup/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backup: data }),
    });
    setBusy(false);
    if (!r.ok) {
      setMessage({ tone: "error", text: r.error });
      resetRestore();
      return;
    }
    setPayload(data);
    setPayloadName(name);
    setPlan(r.data.plan);
    setOverwrite(new Set());
    setAddNew(true);
    setConfirmed(false);
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 40 * 1024 * 1024) {
      setMessage({ tone: "error", text: "파일이 너무 큽니다(최대 40MB)." });
      return;
    }
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      setMessage({ tone: "error", text: "JSON 파일이 아닙니다. 이 화면에서 내려받은 백업 파일을 선택해 주세요." });
      return;
    }
    await startPreview(data, file.name);
  }

  async function apply() {
    if (!plan || !payload) return;
    setBusy(true);
    setMessage(null);
    const r = await api<{ result: { guidesAdded: number; guidesOverwritten: number; guidesSkipped: number; requestsAdded: number; requestsSkipped: number } }>("/api/admin/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backup: payload, confirm: true, addNew, overwriteContentIds: Array.from(overwrite), expectedRevisions: plan.revisions }),
    });
    setBusy(false);
    if (!r.ok) {
      setMessage({ tone: "error", text: r.error });
      return;
    }
    const x = r.data.result;
    setMessage({
      tone: "ok",
      text: `복구했습니다. 콘텐츠 추가 ${x.guidesAdded}건 · 덮어쓰기 ${x.guidesOverwritten}건 · 건너뜀 ${x.guidesSkipped}건 / 개선 요청 추가 ${x.requestsAdded}건. 적용 직전 데이터는 서버에 자동으로 복사해 두었습니다.`,
    });
    const wasLegacy = plan.source === "legacy";
    resetRestore();
    await Promise.all([refreshGuides(), loadInfo()]);
    if (wasLegacy) setLegacy(readLegacy());
  }

  function clearLegacy() {
    if (!window.confirm("이 브라우저에 남아 있는 예전 방식의 콘텐츠·개선 요청 데이터를 삭제할까요? 서버로 옮긴 내용은 삭제되지 않습니다.")) return;
    try {
      window.localStorage.removeItem(LEGACY_GUIDES_KEY);
      window.localStorage.removeItem(LEGACY_REQUESTS_KEY);
    } catch {
      // 저장소를 쓸 수 없는 환경이면 건너뜁니다.
    }
    setLegacy(readLegacy());
  }

  const st = info?.status;
  const badge = !st
    ? "bg-slate-100 text-slate-700 ring-slate-300"
    : st.durable && info?.dataOk
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : "bg-rose-50 text-rose-800 ring-rose-200";

  return (
    <section aria-labelledby="server-data-title" className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="server-data-title" className="text-base font-extrabold text-slate-900">
          서버 저장 상태와 백업
        </h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${badge}`}>
          {!st ? "확인 중" : !st.writable ? "저장 불가" : !info?.dataOk ? "데이터 오류" : st.durable ? "저장 폴더 확인됨" : "임시 저장"}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        {infoError ?? (info?.dataOk === false ? info.dataMessage : st?.message) ?? "저장 상태를 확인하는 중입니다."}
      </p>
      {info?.counts && (
        <p className="mt-1 text-xs text-slate-600">
          서버에 저장된 콘텐츠 변경 {info.counts.guideChanges}건 · 개선 요청 {info.counts.requests}건 (기본 안내 88건은 코드에 포함되어 있어 이 숫자에 들어가지 않습니다)
        </p>
      )}
      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
        이 저장소는 플랫폼의 자동 백업이 없고, 서버가 1대(단일 인스턴스)로 운영된다는 전제입니다. 이 화면은 그 두 가지를 확인할 수 없으니,
        콘텐츠를 등록·수정한 뒤에는 아래 ‘백업 파일 내려받기’로 따로 보관해 주세요.
      </p>

      {loadStatus === "error" && (
        <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          서버에서 콘텐츠 변경분을 불러오지 못했습니다. {loadError}
        </p>
      )}
      {seedNewerIds.length > 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          관리자가 수정한 기존 안내 {seedNewerIds.length}건({seedNewerIds.join(", ")})보다 코드에 포함된 기본 안내가 더 새 버전입니다. 수정본이 화면에 계속 쓰이므로,
          기본 안내의 새 내용이 필요한지 확인해 주세요.
        </p>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900">백업 파일 내려받기</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            관리자가 등록·수정한 콘텐츠와 개선 요청을 JSON 파일로 저장합니다. 비밀번호·비밀키·직원 명단·접속 기록·개인 보관함은 들어 있지 않고,
            기본 안내 88건과 관리자가 추가한 데이터는 구분되어 담깁니다. 개선 요청의 첨부 파일(환자 정보가 있을 수 있음)은 항상 제외됩니다.
          </p>
          <label className="mt-2 flex items-start gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={includeFiles} onChange={(e) => setIncludeFiles(e.target.checked)} className="mt-0.5 h-4 w-4" />
            안내문 원본 첨부 파일도 포함(파일이 커질 수 있음)
          </label>
          <a
            href={withBasePath(`/api/admin/backup${includeFiles ? "?files=1" : ""}`)}
            className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-brand-blue px-4 text-sm font-bold text-white hover:bg-brand-blue-dark"
          >
            백업 파일 내려받기
          </a>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900">백업에서 복구</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            파일을 고르면 먼저 <b>미리보기</b>만 보여 주며, 아무것도 바뀌지 않습니다. 기본은 ‘서버에 없는 것만 추가’이고, 현재와 다른 기존 콘텐츠는 직접 고른 것만 덮어씁니다.
          </p>
          <input
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void onPickFile(f);
            }}
            className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-blue-dark"
          />
        </div>
      </div>

      {legacy && !plan && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
          <h3 className="text-sm font-bold text-slate-900">이 브라우저에 예전 방식으로 저장된 데이터가 있습니다</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            예전에는 콘텐츠 수정과 개선 요청이 이 PC의 브라우저에만 저장되었습니다. 서버로 옮기면 모든 직원에게 공유됩니다.
            <b>옮길 대상: 콘텐츠 {legacy.candidates}건 · 개선 요청 {legacy.requests.length}건</b>
            {legacy.untouched > 0 ? ` (수정하지 않은 기존 안내 ${legacy.untouched}건은 옮기지 않습니다)` : ""}.
            옮기기 전에 서버 데이터와 겹치는 항목을 미리보기로 확인하며, 서버의 기존 콘텐츠는 덮어쓰지 않습니다.
            새로 등록했던 콘텐츠는 안전을 위해 ‘의료진 검토 대기’로 옮겨집니다. 옮기다 실패하거나 취소해도 이 브라우저의 데이터는 지워지지 않으며, 아래 ‘삭제’ 버튼을 눌렀을 때만 지워집니다.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void startPreview({ format: "hycg-browser-legacy", guides: legacy.guides, requests: legacy.requests }, "이 브라우저의 예전 데이터")}
              className="min-h-[40px] rounded-full border border-brand-blue/40 bg-white px-4 text-sm font-bold text-brand-blue-dark hover:bg-blue-soft disabled:opacity-60"
            >
              서버로 옮기기 (미리보기)
            </button>
            <button type="button" onClick={clearLegacy} className="min-h-[40px] rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              이 브라우저의 예전 데이터 삭제
            </button>
          </div>
        </div>
      )}

      {message && (
        <p role="status" className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${message.tone === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {message.text}
        </p>
      )}

      {plan && (
        <div className="mt-4 rounded-lg border border-brand-blue/30 bg-blue-soft/40 p-4">
          <h3 className="text-sm font-bold text-slate-900">복구 미리보기 · {payloadName}</h3>
          {plan.source === "backup" && (
            <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-900">
              개선 요청의 첨부 파일은 환자 정보가 있을 수 있어 백업에 포함되지 않으므로 복구되지 않습니다
              {plan.omittedRequestAttachments > 0 ? ` (이 백업을 만들 때 제외된 첨부 ${plan.omittedRequestAttachments}건)` : ""}. 요청 본문과 처리 상태만 복구됩니다.
            </p>
          )}
          <p className="mt-1 text-xs text-slate-700">
            콘텐츠: 새로 추가 {plan.summary.guidesNew} · 현재와 같음 {plan.summary.guidesSame} · 현재와 다름 {plan.summary.guidesDiffer} · 충돌 {plan.summary.guidesConflict} / 개선 요청: 새로 추가{" "}
            {plan.summary.requestsNew} · 이미 있음 {plan.summary.requestsExisting} (이미 있는 요청은 덮어쓰지 않습니다) / 가져올 수 없는 항목 {plan.summary.skipped}
          </p>

          {plan.guides.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">제목</th>
                    <th className="px-3 py-2">구분</th>
                    <th className="px-3 py-2">상태</th>
                    <th className="px-3 py-2">현재 → 백업</th>
                    <th className="px-3 py-2">덮어쓰기</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.guides.map((g) => (
                    <tr key={g.contentId} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {g.title}
                        <span className="ml-1 font-normal text-slate-500">({g.contentId})</span>
                      </td>
                      <td className="px-3 py-2">{g.kind === "seed-modified" ? "기본 안내 수정본" : "관리자 추가"}</td>
                      <td className="px-3 py-2">
                        {STATE_LABEL[g.state]}
                        {g.detail && <span className={`block ${g.state === "conflict" ? "text-rose-700" : "text-slate-500"}`}>{g.detail}</span>}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {g.current ? `v${g.current.version} · ${g.current.lastUpdated} · ${g.current.status}` : "—"} → v{g.incoming.version} · {g.incoming.lastUpdated} · {g.incoming.status}
                        {g.incoming.medicalReview === "pending" ? " · 검토 대기" : ""}
                      </td>
                      <td className="px-3 py-2">
                        {g.state === "differs" ? (
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={overwrite.has(g.contentId)}
                              onChange={(e) =>
                                setOverwrite((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(g.contentId);
                                  else next.delete(g.contentId);
                                  return next;
                                })
                              }
                              className="h-4 w-4"
                            />
                            백업 내용으로 덮어쓰기
                          </label>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {plan.skipped.length > 0 && (
            <details className="mt-3 text-xs text-slate-700">
              <summary className="cursor-pointer font-bold">가져오지 않는 항목 {plan.skipped.length}건 보기</summary>
              <ul className="mt-1 list-disc pl-5">
                {plan.skipped.map((s, i) => (
                  <li key={`${s.label}-${i}`}>
                    {s.type === "guide" ? "콘텐츠" : "요청"} {s.label}: {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <label className="mt-3 flex items-start gap-2 text-xs text-slate-800">
            <input type="checkbox" checked={addNew} onChange={(e) => setAddNew(e.target.checked)} className="mt-0.5 h-4 w-4" />
            서버에 없는 콘텐츠·개선 요청을 추가합니다(새로 추가 {plan.summary.guidesNew + plan.summary.requestsNew}건)
          </label>
          <label className="mt-2 flex items-start gap-2 text-xs font-semibold text-slate-900">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4" />
            위 내용을 확인했으며, 선택한 {overwrite.size}건은 현재 내용을 백업 내용으로 덮어쓰는 것에 동의합니다. (적용 직전 데이터는 서버에 자동으로 복사됩니다.)
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !confirmed || (!addNew && overwrite.size === 0)}
              onClick={() => void apply()}
              className="min-h-[40px] rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "처리 중…" : "복구 적용"}
            </button>
            <button type="button" disabled={busy} onClick={resetRestore} className="min-h-[40px] rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
