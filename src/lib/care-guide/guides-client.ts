"use client";

import { useEffect, useSyncExternalStore } from "react";
import { withBasePath } from "./base-path";
import { GUIDES } from "./guides-data";
import { mergeGuides } from "./guide-merge";
import { useSession } from "./session";
import type { GuideContent } from "./types";

/**
 * 안내 콘텐츠의 브라우저 쪽 공유 캐시.
 *
 * 기본 안내 88건은 코드(guides-data.ts)에 들어 있고, 관리자가 수정·등록한 내용은 서버(/api/guides)에 있습니다.
 * 여기서는 서버가 보낸 변경분을 기본 안내와 합쳐 화면에 나눠 줍니다. 브라우저 저장소(localStorage)는 쓰지 않으므로
 * 어느 PC에서 열어도 모든 직원에게 같은 목록이 보입니다.
 *
 * - 로그인한 직원·관리자는 서버가 직원용 전체 변경분을, 로그인하지 않은 방문자(환자)는 공개 가능한 것만 줍니다.
 * - status가 "ready"가 되기 전에는 환자 화면이 내용을 보여 주지 않습니다(비게시로 바꾼 기존 안내가 잠깐 보이는 것을 막기 위해).
 */
export interface GuidesState {
  status: "loading" | "ready" | "error";
  /** 서버가 어느 쪽 목록을 줬는지(직원/공개). 아직 모르면 null */
  scope: "staff" | "public" | null;
  guides: GuideContent[];
  /** 코드의 기본 안내가 관리자 수정본보다 새 버전인 항목 */
  seedNewerIds: string[];
  error?: string;
  fetchedAt: number;
}

const INITIAL: GuidesState = { status: "loading", scope: null, guides: GUIDES, seedNewerIds: [], fetchedAt: 0 };

let state: GuidesState = INITIAL;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: GuidesState) {
  state = next;
  listeners.forEach((l) => l());
}

export function getGuidesState(): GuidesState {
  return state;
}

/** 지금 화면이 가진 콘텐츠 목록(서버 변경분 반영). 훅을 쓸 수 없는 곳에서만 사용하세요. */
export function getGuides(): GuideContent[] {
  return state.guides;
}

/** 서버에서 최신 변경분을 다시 받아옵니다. 동시에 여러 번 불러도 요청은 한 번만 나갑니다. */
export function refreshGuides(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(withBasePath("/api/guides"), { cache: "no-store", credentials: "same-origin" });
      const data = (await res.json().catch(() => null)) as
        | { scope: "staff" | "public"; records: GuideContent[]; hiddenIds?: string[]; seedNewerIds?: string[]; error?: string }
        | null;
      if (!res.ok || !data || !Array.isArray(data.records)) throw new Error(data?.error ?? "안내 콘텐츠를 불러오지 못했습니다.");
      set({
        status: "ready",
        scope: data.scope,
        guides: mergeGuides(GUIDES, data.records, data.hiddenIds ?? []),
        seedNewerIds: data.seedNewerIds ?? [],
        fetchedAt: Date.now(),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "안내 콘텐츠를 불러오지 못했습니다.";
      // 이미 받아 둔 목록이 있으면 그대로 두고, 처음부터 실패했다면 error 상태로 둡니다.
      set(state.status === "ready" ? { ...state, error: message } : { ...state, status: "error", error: message });
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let visibilityHooked = false;
const STALE_MS = 15_000;

function hookVisibility() {
  if (visibilityHooked || typeof document === "undefined") return;
  visibilityHooked = true;
  // 다른 탭·창에 갔다 돌아오면 다른 직원이 바꾼 내용을 다시 받아옵니다.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && listeners.size > 0 && Date.now() - state.fetchedAt > 30_000) void refreshGuides();
  });
}

/**
 * 서버 변경분이 반영된 콘텐츠 목록. 화면이 열릴 때마다(15초가 지났거나 로그인 상태가 바뀌었을 때) 서버에서 새로 받습니다.
 * 첫 렌더링은 서버·브라우저가 같도록 기본 안내로 시작하고, 받아오는 즉시 서버 내용으로 바뀝니다.
 */
export function useGuides() {
  const snap = useSyncExternalStore(subscribe, getGuidesState, () => INITIAL);
  const session = useSession();
  const wantedScope = session.status === "loading" ? null : session.user ? "staff" : "public";

  useEffect(() => {
    hookVisibility();
    const fresh = state.status === "ready" && Date.now() - state.fetchedAt < STALE_MS && (wantedScope === null || state.scope === wantedScope);
    if (!fresh) void refreshGuides();
  }, [wantedScope]);

  return {
    guides: snap.guides,
    status: snap.status,
    scope: snap.scope,
    error: snap.error,
    seedNewerIds: snap.seedNewerIds,
    refresh: refreshGuides,
  };
}
