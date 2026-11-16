"use client";

import { Clock, Eye, ExternalLink, Layers, Pencil, Plus, Printer, Star, Trash2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GuidePreviewModal from "@/components/care-guide/GuidePreviewModal";
import MedicalReviewChip from "@/components/care-guide/MedicalReviewChip";
import ConfirmDialog from "@/components/care-guide/modals/ConfirmDialog";
import { formatDate, formatDateTime } from "@/lib/care-guide/format";
import { guidePath } from "@/lib/care-guide/slug";
import { deleteBundleApi, deleteRecent, reloadLibrary, toggleFavorite, useLibrary } from "@/lib/care-guide/me-api";
import { useRole } from "@/lib/care-guide/role";
import type { GuideContent } from "@/lib/care-guide/types";
import { useGuides } from "@/lib/care-guide/use-guides";

type TabId = "favorites" | "recent" | "bundles";

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "favorites", label: "즐겨찾기", icon: Star },
  { id: "recent", label: "최근 본 자료", icon: Clock },
  { id: "bundles", label: "나만의 자료 묶음", icon: Layers },
];

const btn =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40";
const btnDanger =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";

function Empty({ icon: Icon, title, hint, action }: { icon: LucideIcon; title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      </div>
      {action}
    </div>
  );
}

export default function LibraryPage() {
  const { data, status, error, durable } = useLibrary();
  const { guides } = useGuides();
  const role = useRole();
  const [tab, setTab] = useState<TabId>("favorites");
  const [favSort, setFavSort] = useState<"recent" | "name">("recent");
  const [recentSort, setRecentSort] = useState<"newest" | "oldest">("newest");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | { kind: "recent-all" } | { kind: "bundle"; id: string; title: string }>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t === "favorites" || t === "recent" || t === "bundles") setTab(t);
  }, []);

  function selectTab(id: TabId) {
    setTab(id);
    window.history.replaceState(null, "", id === "favorites" ? window.location.pathname : `?tab=${id}`);
  }

  const byId = useMemo(() => new Map(guides.map((g) => [g.contentId, g])), [guides]);
  /** 열람 가능한 자료만(비게시 자료는 관리자만) */
  const open = (id: string): GuideContent | undefined => {
    const g = byId.get(id);
    return g && (g.status === "게시" || role === "ADMIN") ? g : undefined;
  };

  const favorites = useMemo(() => {
    const list = data.favorites.slice();
    if (favSort === "name") list.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    else list.sort((a, b) => b.at.localeCompare(a.at));
    return list;
  }, [data.favorites, favSort]);

  const recent = useMemo(() => {
    const list = data.recent.slice().sort((a, b) => a.lastViewedAt.localeCompare(b.lastViewedAt));
    return recentSort === "newest" ? list.reverse() : list;
  }, [data.recent, recentSort]);

  const previewGuide = previewId ? byId.get(previewId) : undefined;
  const counts: Record<TabId, number> = { favorites: data.favorites.length, recent: data.recent.length, bundles: data.bundles.length };

  async function run(p: Promise<{ ok: boolean; error?: string }>) {
    const r = await p;
    setMessage(r.ok ? "" : (r.error ?? "처리하지 못했습니다."));
  }

  function titleBlock(id: string, title: string) {
    const g = open(id);
    return g ? (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link
          href={guidePath(g.slug)}
          className="text-[15px] font-bold leading-snug text-slate-900 hover:text-brand-blue-dark hover:underline [overflow-wrap:anywhere]"
        >
          {g.title}
        </Link>
        <MedicalReviewChip guide={g} />
      </div>
    ) : (
      <div>
        <p className="text-[15px] font-bold leading-snug text-slate-500 [overflow-wrap:anywhere]">{title}</p>
        <p className="mt-0.5 text-xs text-amber-800">현재 열람할 수 없는 자료입니다(비공개 또는 삭제됨).</p>
      </div>
    );
  }

  function relatedChips(id: string) {
    const g = open(id);
    const rel = (g?.relatedContentIds ?? []).map((rid) => open(rid)).filter((x): x is GuideContent => Boolean(x)).slice(0, 3);
    if (rel.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500">관련 자료</span>
        {rel.map((r) => (
          <button
            key={r.contentId}
            type="button"
            onClick={() => setPreviewId(r.contentId)}
            className="rounded-full bg-blue-soft px-2.5 py-1 text-xs font-semibold text-brand-blue-dark hover:bg-blue-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
          >
            {r.title}
          </button>
        ))}
      </div>
    );
  }

  const rowActions = (id: string) => {
    const g = open(id);
    return g ? (
      <>
        <button type="button" onClick={() => setPreviewId(id)} className={btn}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          미리보기
        </button>
        <Link href={guidePath(g.slug)} className={btn}>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          상세 보기
        </Link>
      </>
    ) : null;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">내 보관함</h1>
        <p className="mt-1 text-sm text-slate-600">자주 사용하는 안내자료와 최근 확인한 콘텐츠를 한곳에서 관리하세요.</p>
      </div>

      {!durable && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          현재 서버 환경에서는 보관함 데이터가 영구 보관되지 않아 서버가 다시 시작되면 사라질 수 있습니다.
        </p>
      )}

      <div role="tablist" aria-label="내 보관함 구분" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => selectTab(t.id)}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
              tab === t.id ? "bg-white text-brand-blue-dark shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
            <span className="rounded-full bg-slate-200/80 px-1.5 text-[11px] font-bold text-slate-700">{counts[t.id]}</span>
          </button>
        ))}
      </div>

      {message && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {message}
        </p>
      )}

      {status === "loading" || status === "idle" ? (
        <p className="py-10 text-center text-sm text-slate-600">불러오는 중입니다…</p>
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-rose-900">{error}</p>
          <button type="button" onClick={reloadLibrary} className={btn}>
            다시 불러오기
          </button>
        </div>
      ) : (
        <>
          {tab === "favorites" &&
            (favorites.length === 0 ? (
              <Empty
                icon={Star}
                title="아직 즐겨찾기한 안내자료가 없습니다."
                hint="안내 콘텐츠 카드의 별 모양 버튼을 누르면 이곳에 저장됩니다."
                action={
                  <Link href="/" className={btn}>
                    환자 안내 콘텐츠 보기
                  </Link>
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-slate-600">{favorites.length}건</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    정렬
                    <select
                      value={favSort}
                      onChange={(e) => setFavSort(e.target.value as "recent" | "name")}
                      className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-2.5 text-sm"
                    >
                      <option value="recent">최근 등록순</option>
                      <option value="name">가나다순</option>
                    </select>
                  </label>
                </div>
                <ul className="flex flex-col gap-3">
                  {favorites.map((f) => (
                    <li key={f.contentId} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {titleBlock(f.contentId, f.title)}
                          <p className="mt-1 text-xs text-slate-500">등록일 {formatDate(f.at)}</p>
                          {relatedChips(f.contentId)}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {rowActions(f.contentId)}
                          <button
                            type="button"
                            onClick={() => run(toggleFavorite({ contentId: f.contentId, title: f.title }))}
                            className={btnDanger}
                            aria-label={`${f.title} 즐겨찾기 해제`}
                          >
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                            해제
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {tab === "recent" &&
            (recent.length === 0 ? (
              <Empty
                icon={Clock}
                title="최근 본 자료가 없습니다."
                hint="안내 콘텐츠를 열어 보면 자동으로 이곳에 기록됩니다."
                action={
                  <Link href="/" className={btn}>
                    환자 안내 콘텐츠 보기
                  </Link>
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium text-slate-600">{recent.length}건</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      정렬
                      <select
                        value={recentSort}
                        onChange={(e) => setRecentSort(e.target.value as "newest" | "oldest")}
                        className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-2.5 text-sm"
                      >
                        <option value="newest">최근 열람순</option>
                        <option value="oldest">오래된 순</option>
                      </select>
                    </label>
                    <button type="button" onClick={() => setConfirm({ kind: "recent-all" })} className={btnDanger}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      전체 기록 삭제
                    </button>
                  </div>
                </div>
                <ul className="flex flex-col gap-3">
                  {recent.map((r) => (
                    <li key={r.contentId} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {titleBlock(r.contentId, r.title)}
                          <p className="mt-1 text-xs text-slate-500">
                            마지막 열람 {formatDateTime(r.lastViewedAt)} · 열람 {r.count}회
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {rowActions(r.contentId)}
                          <button
                            type="button"
                            onClick={() => run(deleteRecent(r.contentId))}
                            className={btnDanger}
                            aria-label={`${r.title} 기록 삭제`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            삭제
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500">
                  여기서 기록을 지워도 ‘발송·활용 이력’의 열람 기록은 남습니다. (활용 이력은 업무 기록이라 별도로 보관됩니다.)
                </p>
              </div>
            ))}

          {tab === "bundles" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-600">{data.bundles.length}개</p>
                <Link href="/compose" className={`${btn} border-brand-blue/40 text-brand-blue-dark`}>
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />새 자료 묶음 만들기
                </Link>
              </div>
              {data.bundles.length === 0 ? (
                <Empty
                  icon={Layers}
                  title="저장한 자료 묶음이 없습니다."
                  hint="‘안내자료 구성’에서 여러 안내자료를 골라 순서를 정하고 저장하면 이곳에 나타납니다."
                  action={
                    <Link href="/compose" className={btn}>
                      안내자료 구성하기
                    </Link>
                  }
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {data.bundles.map((b) => (
                    <li key={b.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="min-w-0">
                        <Link
                          href={`/compose?bundle=${encodeURIComponent(b.id)}`}
                          className="text-[15px] font-bold leading-snug text-slate-900 hover:text-brand-blue-dark hover:underline [overflow-wrap:anywhere]"
                        >
                          {b.title}
                        </Link>
                        {b.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-600">{b.description}</p>}
                        <p className="mt-2 text-xs text-slate-500">
                          자료 {b.contentIds.length}건 · 수정 {formatDate(b.updatedAt)} · 나만 보기
                        </p>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-1.5">
                        <Link href={`/compose?bundle=${encodeURIComponent(b.id)}`} className={btn}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          열어서 구성
                        </Link>
                        <Link href={`/compose/print?bundle=${encodeURIComponent(b.id)}`} className={btn}>
                          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                          인쇄용 화면
                        </Link>
                        <button type="button" onClick={() => setConfirm({ kind: "bundle", id: b.id, title: b.title })} className={btnDanger}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          삭제
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {previewGuide && <GuidePreviewModal guide={previewGuide} allGuides={guides} onClose={() => setPreviewId(null)} />}

      {confirm?.kind === "recent-all" && (
        <ConfirmDialog
          title="최근 본 자료 전체 삭제"
          message="최근 본 자료 기록을 모두 지웁니다. 즐겨찾기와 자료 묶음은 지워지지 않습니다."
          confirmLabel="전체 삭제"
          onClose={() => setConfirm(null)}
          onConfirm={() => run(deleteRecent("all"))}
        />
      )}
      {confirm?.kind === "bundle" && (
        <ConfirmDialog
          title="자료 묶음 삭제"
          message={`‘${confirm.title}’ 묶음을 삭제합니다. 묶음에 담긴 안내자료 자체는 지워지지 않습니다.`}
          confirmLabel="삭제"
          onClose={() => setConfirm(null)}
          onConfirm={() => run(deleteBundleApi(confirm.id))}
        />
      )}
    </div>
  );
}
