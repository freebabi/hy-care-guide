import "server-only";
import { newId, readJson, updateJson } from "./store";
import type { NoticeItem, NoticeRevision, NoticeStatus, NoticeType } from "@/lib/care-guide/me-types";

/** 공지 저장소. 운영 화면에 보이는 공지는 관리자가 직접 등록한 것뿐이며, 샘플 공지는 만들지 않습니다. */
interface NoticeDoc {
  notices: NoticeItem[];
}

const FILE = "notices.json";
const empty = (): NoticeDoc => ({ notices: [] });

export async function listNotices(options: { includeAll: boolean; reads: Record<string, string> }): Promise<NoticeItem[]> {
  const doc = await readJson<NoticeDoc>(FILE, empty());
  const list = (doc.notices ?? []).filter((n) => options.includeAll || n.status === "published");
  return sortNotices(list).map((n) => ({ ...n, read: Boolean(options.reads[n.id]) }));
}

/** 고정 공지 → 중요 공지 → 최신 게시순 */
function sortNotices(list: NoticeItem[]): NoticeItem[] {
  const when = (n: NoticeItem) => new Date(n.publishedAt ?? n.createdAt).getTime();
  return list.slice().sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.important) - Number(a.important) || when(b) - when(a));
}

export async function getNotice(id: string, includeAll: boolean, reads: Record<string, string>): Promise<NoticeItem | null> {
  const doc = await readJson<NoticeDoc>(FILE, empty());
  const n = (doc.notices ?? []).find((x) => x.id === id);
  if (!n || (!includeAll && n.status !== "published")) return null;
  return { ...n, read: Boolean(reads[n.id]) };
}

export async function unreadCount(reads: Record<string, string>): Promise<number> {
  const doc = await readJson<NoticeDoc>(FILE, empty());
  return (doc.notices ?? []).filter((n) => n.status === "published" && !reads[n.id]).length;
}

export interface NoticeInput {
  type: NoticeType;
  title: string;
  body: string;
  important: boolean;
  pinned: boolean;
  status: NoticeStatus;
  relatedContentIds: string[];
  revision?: NoticeRevision;
}

function applyStatus(n: NoticeItem, status: NoticeStatus, now: string) {
  if (status === "published" && !n.publishedAt) n.publishedAt = now;
  if (status === "ended") n.endedAt = now;
  if (status === "published") n.endedAt = undefined;
  n.status = status;
}

export function createNotice(input: NoticeInput): Promise<NoticeItem> {
  return updateJson<NoticeDoc, NoticeItem>(FILE, empty(), (doc) => {
    doc.notices ??= [];
    const now = new Date().toISOString();
    const n: NoticeItem = { ...input, id: newId("ntc"), createdAt: now, updatedAt: now, status: "draft" };
    applyStatus(n, input.status, now);
    doc.notices.unshift(n);
    return n;
  });
}

export function updateNotice(id: string, input: Partial<NoticeInput>): Promise<NoticeItem | null> {
  return updateJson<NoticeDoc, NoticeItem | null>(FILE, empty(), (doc) => {
    const n = (doc.notices ?? []).find((x) => x.id === id);
    if (!n) return null;
    const now = new Date().toISOString();
    const { status, ...rest } = input;
    Object.assign(n, rest, { updatedAt: now });
    if (status) applyStatus(n, status, now);
    if (n.type !== "revision") n.revision = undefined;
    return n;
  });
}

export function deleteNotice(id: string): Promise<boolean> {
  return updateJson<NoticeDoc, boolean>(FILE, empty(), (doc) => {
    const before = (doc.notices ?? []).length;
    doc.notices = (doc.notices ?? []).filter((n) => n.id !== id);
    return doc.notices.length < before;
  });
}
