"use client";

import { useEffect, useSyncExternalStore } from "react";
import { withBasePath } from "./base-path";
import { useSession } from "./session";
import type {
  ActivityItem,
  ActivityType,
  BundleItem,
  LibraryData,
  NoticeItem,
  NoticeRevision,
  NoticeStatus,
  NoticeType,
} from "./me-types";
import type { GuideContent } from "./types";

/**
 * 내 보관함·활용 이력·공지의 브라우저 쪽 창구. 모든 데이터는 서버(로그인 사용자 기준)에 저장되고,
 * 여기서는 서버 응답을 받아 화면에 나눠 줄 뿐입니다. (예전 localStorage 방식이 아닙니다.)
 */
type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function call<T>(url: string, init?: RequestInit): Promise<Result<{ data: T }>> {
  try {
    const res = await fetch(withBasePath(url), {
      cache: "no-store",
      credentials: "same-origin",
      ...init,
      headers: init?.body ? { "Content-Type": "application/json", ...(init.headers ?? {}) } : init?.headers,
    });
    const data = (await res.json()) as T & { error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? "요청을 처리하지 못했습니다." };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." };
  }
}

// ───────────── 내 보관함 상태 ─────────────
interface LibState {
  status: "idle" | "loading" | "ready" | "error";
  owner: string | null;
  data: LibraryData;
  durable: boolean;
  error: string;
}

const EMPTY_LIB: LibState = {
  status: "idle",
  owner: null,
  data: { favorites: [], recent: [], bundles: [] },
  durable: true,
  error: "",
};
let lib: LibState = EMPTY_LIB;
const libListeners = new Set<() => void>();

function setLib(next: LibState) {
  lib = next;
  libListeners.forEach((l) => l());
}
const patchData = (patch: Partial<LibraryData>) => setLib({ ...lib, data: { ...lib.data, ...patch } });

async function loadLibrary(owner: string) {
  setLib({ ...EMPTY_LIB, status: "loading", owner });
  const r = await call<LibraryData & { durable?: boolean }>("/api/me/library");
  if (lib.owner !== owner) return; // 그 사이 다른 사용자로 바뀐 경우 무시
  if (!r.ok) setLib({ ...EMPTY_LIB, status: "error", owner, error: r.error });
  else setLib({ status: "ready", owner, data: { favorites: r.data.favorites, recent: r.data.recent, bundles: r.data.bundles }, durable: r.data.durable ?? true, error: "" });
}

export function reloadLibrary() {
  if (lib.owner) void loadLibrary(lib.owner);
}

/** 내 보관함 데이터를 구독합니다. 로그인한 사용자가 바뀌면 서버에서 다시 불러옵니다. */
export function useLibrary(): LibState {
  const { user } = useSession();
  const owner = user?.name ?? null;
  useEffect(() => {
    if (!owner) {
      if (lib.owner) setLib(EMPTY_LIB);
      return;
    }
    if (lib.owner !== owner) void loadLibrary(owner);
  }, [owner]);
  return useSyncExternalStore(
    (l) => {
      libListeners.add(l);
      return () => libListeners.delete(l);
    },
    () => lib,
    () => EMPTY_LIB,
  );
}

export async function toggleFavorite(guide: Pick<GuideContent, "contentId" | "title">): Promise<Result> {
  const was = lib.data.favorites.some((f) => f.contentId === guide.contentId);
  const before = lib.data.favorites;
  // 별이 바로 바뀌도록 먼저 화면에 반영하고, 서버 저장에 실패하면 되돌립니다.
  patchData({
    favorites: was
      ? before.filter((f) => f.contentId !== guide.contentId)
      : [{ contentId: guide.contentId, title: guide.title, at: new Date().toISOString() }, ...before],
  });
  const r = await call<{ favorites: LibraryData["favorites"] }>("/api/me/favorites", {
    method: "POST",
    body: JSON.stringify({ contentId: guide.contentId, title: guide.title, on: !was }),
  });
  if (!r.ok) {
    patchData({ favorites: before });
    return { ok: false, error: r.error };
  }
  patchData({ favorites: r.data.favorites });
  return { ok: true };
}

const recentlySent = new Map<string, number>();

/** 자료를 열람했음을 서버에 알립니다(최근 본 자료 + 열람 이력). 같은 자료는 30초 안에 한 번만 보냅니다. */
export async function recordView(guide: Pick<GuideContent, "contentId" | "title">): Promise<void> {
  const now = Date.now();
  if (now - (recentlySent.get(guide.contentId) ?? 0) < 30_000) return;
  recentlySent.set(guide.contentId, now);
  const r = await call<{ recent: LibraryData["recent"] }>("/api/me/recent", {
    method: "POST",
    body: JSON.stringify({ contentId: guide.contentId, title: guide.title }),
  });
  if (r.ok && lib.status === "ready") patchData({ recent: r.data.recent });
}

export async function deleteRecent(contentId: string | "all"): Promise<Result> {
  const url = contentId === "all" ? "/api/me/recent?all=1" : `/api/me/recent?contentId=${encodeURIComponent(contentId)}`;
  const r = await call<{ recent: LibraryData["recent"] }>(url, { method: "DELETE" });
  if (!r.ok) return r;
  patchData({ recent: r.data.recent });
  return { ok: true };
}

export async function saveBundleApi(input: {
  id?: string;
  title: string;
  description: string;
  contentIds: string[];
  related: Array<{ contentId: string; title: string }>;
}): Promise<Result<{ bundle: BundleItem }>> {
  const r = await call<{ bundle: BundleItem }>("/api/me/bundles", { method: "POST", body: JSON.stringify(input) });
  if (!r.ok) return r;
  const bundle = r.data.bundle;
  patchData({ bundles: [bundle, ...lib.data.bundles.filter((b) => b.id !== bundle.id)] });
  return { ok: true, bundle };
}

export async function deleteBundleApi(id: string): Promise<Result> {
  const r = await call<{ ok: boolean }>(`/api/me/bundles?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!r.ok) return r;
  patchData({ bundles: lib.data.bundles.filter((b) => b.id !== id) });
  return { ok: true };
}

// ───────────── 활용 이력 ─────────────
export interface ActivityFilters {
  type?: ActivityType | "";
  from?: string;
  to?: string;
  q?: string;
  order?: "asc" | "desc";
}

export async function fetchActivity(f: ActivityFilters): Promise<Result<{ items: ActivityItem[]; durable: boolean }>> {
  const p = new URLSearchParams();
  if (f.type) p.set("type", f.type);
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (f.q?.trim()) p.set("q", f.q.trim());
  p.set("order", f.order ?? "desc");
  const r = await call<{ items: ActivityItem[]; durable?: boolean }>(`/api/me/activity?${p}`);
  if (!r.ok) return r;
  return { ok: true, items: r.data.items, durable: r.data.durable ?? true };
}

/** 인쇄 준비·다운로드·안내 제공 기록·안내 문구 준비처럼 화면에서 일어난 일을 이력으로 남깁니다. */
export async function postActivity(input: {
  type: "download" | "print" | "provided" | "message-prep";
  title: string;
  contentId?: string;
  bundleId?: string;
  related?: Array<{ contentId: string; title: string }>;
}): Promise<Result> {
  const r = await call<{ entry: ActivityItem | null }>("/api/me/activity", { method: "POST", body: JSON.stringify(input) });
  return r.ok ? { ok: true } : r;
}

export async function fetchUsageStats(days: number) {
  return call<{
    stats: {
      days: number;
      totals: Record<ActivityType, number>;
      activeUsers: number;
      topContents: Array<{ contentId: string; title: string; views: number }>;
      daily: Array<{ day: string; count: number }>;
    };
    durable: boolean;
  }>(`/api/admin/usage?days=${days}`);
}

// ───────────── 공지 ─────────────
export async function fetchNotices(all: boolean): Promise<Result<{ notices: NoticeItem[]; durable: boolean }>> {
  const r = await call<{ notices: NoticeItem[]; durable?: boolean }>(`/api/notices${all ? "?all=1" : ""}`);
  return r.ok ? { ok: true, notices: r.data.notices, durable: r.data.durable ?? true } : r;
}

export async function fetchNotice(id: string): Promise<Result<{ notice: NoticeItem }>> {
  const r = await call<{ notice: NoticeItem }>(`/api/notices/${encodeURIComponent(id)}`);
  return r.ok ? { ok: true, notice: r.data.notice } : r;
}

export interface NoticeDraft {
  type: NoticeType;
  title: string;
  body: string;
  important: boolean;
  pinned: boolean;
  status: NoticeStatus;
  relatedContentIds: string[];
  revision?: NoticeRevision;
}

export async function saveNotice(id: string | null, draft: NoticeDraft): Promise<Result<{ notice: NoticeItem }>> {
  const r = await call<{ notice: NoticeItem }>(id ? `/api/notices/${encodeURIComponent(id)}` : "/api/notices", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(draft),
  });
  return r.ok ? { ok: true, notice: r.data.notice } : r;
}

export async function deleteNoticeApi(id: string): Promise<Result> {
  const r = await call<{ ok: boolean }>(`/api/notices/${encodeURIComponent(id)}`, { method: "DELETE" });
  return r.ok ? { ok: true } : r;
}

// 읽지 않은 공지 개수(메뉴 표시용)
let unread = 0;
let unreadOwner: string | null = null;
const unreadListeners = new Set<() => void>();
function setUnread(n: number) {
  unread = n;
  unreadListeners.forEach((l) => l());
}

export async function refreshUnread(): Promise<void> {
  const r = await call<{ unread: number }>("/api/notices/unread");
  if (r.ok) setUnread(r.data.unread);
}

export async function markNoticeRead(id: string): Promise<void> {
  const r = await call<{ unread: number }>(`/api/notices/${encodeURIComponent(id)}/read`, { method: "POST" });
  if (r.ok) setUnread(r.data.unread);
}

export function useUnreadNotices(): number {
  const { user } = useSession();
  const owner = user?.name ?? null;
  useEffect(() => {
    if (!owner) {
      unreadOwner = null;
      setUnread(0);
      return;
    }
    if (unreadOwner !== owner) {
      unreadOwner = owner;
      void refreshUnread();
    }
  }, [owner]);
  return useSyncExternalStore(
    (l) => {
      unreadListeners.add(l);
      return () => unreadListeners.delete(l);
    },
    () => unread,
    () => 0,
  );
}
