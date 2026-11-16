import "server-only";
import { fileExists, newId, readJson, renameFile, updateJson } from "./store";
import type { ActivityItem, ActivityType, BundleItem, FavoriteItem, LibraryData, RecentItem } from "@/lib/care-guide/me-types";

/**
 * 사용자 한 명의 개인 데이터 파일(users/<사용자ID>.json).
 * 파일 이름이 사용자 ID이므로 다른 직원의 데이터는 읽을 수도, 섞일 수도 없습니다.
 */
interface UserDoc {
  uid: string;
  favorites: FavoriteItem[];
  recent: RecentItem[];
  bundles: BundleItem[];
  activity: ActivityItem[];
  /** 공지 ID → 읽은 시각 */
  noticeReads: Record<string, string>;
}

const MAX_RECENT = 100;
const MAX_ACTIVITY = 3000;
const MAX_BUNDLES = 100;
const MAX_FAVORITES = 500;
export const MAX_BUNDLE_ITEMS = 60;
/** 같은 자료를 이 시간(ms) 안에 다시 열면 한 번으로 셉니다(새로고침·중복 호출 방지). */
const VIEW_DEDUPE_MS = 30_000;
const EVENT_DEDUPE_MS = 10_000;

const empty = (uid: string): UserDoc => ({ uid, favorites: [], recent: [], bundles: [], activity: [], noticeReads: {} });
const file = (uid: string) => `users/${uid}.json`;

function mutate<R>(uid: string, fn: (doc: UserDoc) => R): Promise<R> {
  return updateJson<UserDoc, R>(file(uid), empty(uid), (doc) => {
    // 파일에 없는 필드가 있어도 안전하게 동작하도록 보정
    doc.favorites ??= [];
    doc.recent ??= [];
    doc.bundles ??= [];
    doc.activity ??= [];
    doc.noticeReads ??= {};
    return fn(doc);
  });
}

async function read(uid: string): Promise<UserDoc> {
  const doc = await readJson<UserDoc>(file(uid), empty(uid));
  return { ...empty(uid), ...doc };
}

/**
 * 예전 방식(관리자 고정 ID "admin")으로 저장된 관리자 데이터를 새 사용자 ID(사번 기준)로 한 번만 이어받습니다.
 * 관리자는 1명뿐이라 주인이 분명합니다. 원본은 admin.json.migrated 로 보존합니다.
 * (직원용 예전 파일은 이름 해시로 저장되어 사번을 알 수 없으므로 자동으로 이전하지 않습니다.)
 */
let legacyAdminChecked = false;
export async function claimLegacyAdminData(uid: string): Promise<void> {
  if (legacyAdminChecked) return;
  legacyAdminChecked = true;
  try {
    if (!(await fileExists("users/admin.json")) || (await fileExists(file(uid)))) return;
    const legacy = await readJson<UserDoc | null>("users/admin.json", null);
    if (!legacy) return;
    await updateJson<UserDoc, void>(file(uid), empty(uid), (doc) => {
      Object.assign(doc, { ...empty(uid), ...legacy, uid });
    });
    await renameFile("users/admin.json", "users/admin.json.migrated");
  } catch {
    // 이전에 실패해도 로그인·기능에는 영향이 없고, 다음 실행 때 다시 시도합니다.
    legacyAdminChecked = false;
  }
}

export async function getLibrary(uid: string): Promise<LibraryData> {
  const d = await read(uid);
  return { favorites: d.favorites, recent: d.recent, bundles: d.bundles };
}

function pushActivity(doc: UserDoc, item: Omit<ActivityItem, "id" | "at">, dedupe: boolean): ActivityItem | null {
  const now = Date.now();
  if (dedupe) {
    const dup = doc.activity.find(
      (a) =>
        a.type === item.type &&
        a.title === item.title &&
        a.contentId === item.contentId &&
        a.bundleId === item.bundleId &&
        now - new Date(a.at).getTime() < (item.type === "view" ? VIEW_DEDUPE_MS : EVENT_DEDUPE_MS),
    );
    if (dup) return null;
  }
  const entry: ActivityItem = { ...item, id: newId("act"), at: new Date(now).toISOString() };
  doc.activity.unshift(entry);
  if (doc.activity.length > MAX_ACTIVITY) doc.activity.length = MAX_ACTIVITY;
  return entry;
}

export function setFavorite(uid: string, contentId: string, title: string, on: boolean): Promise<FavoriteItem[]> {
  return mutate(uid, (doc) => {
    const exists = doc.favorites.some((f) => f.contentId === contentId);
    if (on && !exists) {
      if (doc.favorites.length >= MAX_FAVORITES) throw new Error("즐겨찾기는 최대 500개까지 저장할 수 있습니다.");
      doc.favorites.unshift({ contentId, title, at: new Date().toISOString() });
    }
    if (on && exists) doc.favorites = doc.favorites.map((f) => (f.contentId === contentId ? { ...f, title } : f));
    if (!on) doc.favorites = doc.favorites.filter((f) => f.contentId !== contentId);
    return doc.favorites;
  });
}

/** 자료를 열람했을 때: 최근 본 자료를 갱신하고 열람 이력을 남깁니다. */
export function recordView(uid: string, userName: string, contentId: string, title: string): Promise<RecentItem[]> {
  return mutate(uid, (doc) => {
    const now = new Date();
    const prev = doc.recent.find((r) => r.contentId === contentId);
    const recentlyCounted = prev && now.getTime() - new Date(prev.lastViewedAt).getTime() < VIEW_DEDUPE_MS;
    if (!recentlyCounted) {
      const next: RecentItem = { contentId, title, lastViewedAt: now.toISOString(), count: (prev?.count ?? 0) + 1 };
      doc.recent = [next, ...doc.recent.filter((r) => r.contentId !== contentId)].slice(0, MAX_RECENT);
      pushActivity(doc, { type: "view", title, contentId, user: userName }, true);
    }
    return doc.recent;
  });
}

export function removeRecent(uid: string, contentId: string | "all"): Promise<RecentItem[]> {
  return mutate(uid, (doc) => {
    doc.recent = contentId === "all" ? [] : doc.recent.filter((r) => r.contentId !== contentId);
    return doc.recent;
  });
}

export interface BundleInput {
  id?: string;
  title: string;
  description: string;
  contentIds: string[];
  /** 묶음 구성 이력에 함께 남길 관련 자료 제목 */
  related: Array<{ contentId: string; title: string }>;
}

export function saveBundle(uid: string, userName: string, input: BundleInput): Promise<BundleItem | null> {
  return mutate(uid, (doc) => {
    const now = new Date().toISOString();
    const ids = Array.from(new Set(input.contentIds)); // 중복 등록 방지
    let bundle: BundleItem;
    if (input.id) {
      const found = doc.bundles.find((b) => b.id === input.id);
      if (!found) return null; // 다른 사람의 묶음 ID로는 아무것도 바꿀 수 없음(내 파일에만 존재)
      bundle = { ...found, title: input.title, description: input.description, contentIds: ids, updatedAt: now };
      doc.bundles = doc.bundles.map((b) => (b.id === bundle.id ? bundle : b));
    } else {
      if (doc.bundles.length >= MAX_BUNDLES) throw new Error("자료 묶음은 최대 100개까지 저장할 수 있습니다.");
      bundle = {
        id: newId("bnd"),
        title: input.title,
        description: input.description,
        contentIds: ids,
        visibility: "private",
        createdAt: now,
        updatedAt: now,
        author: userName,
      };
      doc.bundles.unshift(bundle);
    }
    pushActivity(doc, { type: "compose", title: bundle.title, bundleId: bundle.id, related: input.related, user: userName }, false);
    return bundle;
  });
}

export function deleteBundle(uid: string, id: string): Promise<boolean> {
  return mutate(uid, (doc) => {
    const before = doc.bundles.length;
    doc.bundles = doc.bundles.filter((b) => b.id !== id);
    return doc.bundles.length < before;
  });
}

export function addActivity(
  uid: string,
  userName: string,
  item: { type: Exclude<ActivityType, "view" | "compose">; title: string; contentId?: string; bundleId?: string; related?: ActivityItem["related"] },
): Promise<ActivityItem | null> {
  return mutate(uid, (doc) =>
    // ‘안내 제공 완료 기록’은 직원이 의도적으로 남기는 기록이라 중복 제거하지 않습니다.
    pushActivity(doc, { ...item, user: userName }, item.type !== "provided"),
  );
}

export interface ActivityQuery {
  type?: ActivityType;
  from?: string;
  to?: string;
  q?: string;
  order?: "asc" | "desc";
}

export async function listActivity(uid: string, query: ActivityQuery): Promise<ActivityItem[]> {
  const d = await read(uid);
  const from = query.from ? new Date(query.from).getTime() : null;
  const to = query.to ? new Date(query.to).getTime() : null;
  const q = query.q?.trim().toLowerCase();
  const list = d.activity.filter((a) => {
    if (query.type && a.type !== query.type) return false;
    const t = new Date(a.at).getTime();
    if (from !== null && t < from) return false;
    if (to !== null && t > to) return false;
    if (q && !(a.title.toLowerCase().includes(q) || (a.related ?? []).some((r) => r.title.toLowerCase().includes(q)))) return false;
    return true;
  });
  return query.order === "asc" ? list.slice().reverse() : list;
}

export async function getNoticeReads(uid: string): Promise<Record<string, string>> {
  return (await read(uid)).noticeReads;
}

export function markNoticeRead(uid: string, noticeId: string): Promise<void> {
  return mutate(uid, (doc) => {
    if (!doc.noticeReads[noticeId]) doc.noticeReads[noticeId] = new Date().toISOString();
  });
}
