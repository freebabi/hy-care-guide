"use client";

import { useEffect, useSyncExternalStore } from "react";
import { withBasePath } from "./base-path";

/**
 * 브라우저 쪽 로그인 상태입니다. 진짜 판단은 서버(/api/auth/session의 서명된 쿠키)가 하고,
 * 여기서는 그 결과를 받아 화면에 보여주기만 합니다. (화면에서 역할을 바꿀 방법은 없습니다.)
 */
export type Role = "ADMIN" | "EMPLOYEE";

export interface SessionUser {
  name: string;
  role: Role;
}

export interface SessionState {
  status: "loading" | "anonymous" | "authenticated";
  user: SessionUser | null;
  /** 서버에 로그인 설정(SESSION_SECRET)이 되어 있는지 */
  authConfigured: boolean;
  /** 관리자 로그인을 쓸 수 있는지(ADMIN_PASSWORD 설정 여부) */
  adminLoginAvailable: boolean;
}

const LOADING: SessionState = { status: "loading", user: null, authConfigured: true, adminLoginAvailable: true };

let state: SessionState = LOADING;
let started = false;
const listeners = new Set<() => void>();

function set(next: SessionState) {
  state = next;
  listeners.forEach((l) => l());
}

export function getSessionState(): SessionState {
  return state;
}

/** 서버에 지금 세션을 물어 상태를 갱신합니다. */
export async function refreshSession(): Promise<SessionState> {
  try {
    const res = await fetch(withBasePath("/api/auth/session"), { cache: "no-store", credentials: "same-origin" });
    const data = (await res.json()) as { user: SessionUser | null; authConfigured?: boolean; adminLoginAvailable?: boolean };
    set({
      status: data.user ? "authenticated" : "anonymous",
      user: data.user,
      authConfigured: data.authConfigured ?? true,
      adminLoginAvailable: data.adminLoginAvailable ?? false,
    });
  } catch {
    // 서버에 연결하지 못하면 로그인하지 않은 것으로 처리합니다.
    set({ status: "anonymous", user: null, authConfigured: true, adminLoginAvailable: false });
  }
  return state;
}

export async function login(
  payload: { mode: "employee"; name: string; employeeId: string } | { mode: "admin"; name: string; employeeId: string; password: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(withBasePath("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? "로그인하지 못했습니다." };
    await refreshSession();
    return { ok: true };
  } catch {
    return { ok: false, error: "서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST", credentials: "same-origin" });
  } finally {
    set({ ...state, status: "anonymous", user: null });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 로그인 상태를 구독합니다. 처음 쓰일 때 한 번 서버에 물어봅니다. */
export function useSession(): SessionState {
  useEffect(() => {
    if (!started) {
      started = true;
      void refreshSession();
    }
  }, []);
  return useSyncExternalStore(subscribe, getSessionState, () => LOADING);
}
