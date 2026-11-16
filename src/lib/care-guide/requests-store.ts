"use client";

import { useCallback, useEffect, useState } from "react";
import { withBasePath } from "./base-path";
import { useSession } from "./session";
import type { ImprovementKind, ImprovementRequest, ImprovementStatus, SourceFile } from "./types";

export const KIND_LABEL: Record<ImprovementKind, string> = {
  error: "오류 또는 수정 요청",
  improvement: "개선 의견",
  inconvenience: "현재 안내에서 불편한 점",
};

export const REQUEST_STATUS_LABEL: Record<ImprovementStatus, string> = {
  received: "접수",
  reviewing: "검토 중",
  approved: "승인(수정 예정)",
  applied: "반영 완료",
  rejected: "반려",
};

export const REQUEST_STATUS_ORDER: ImprovementStatus[] = ["received", "reviewing", "approved", "applied", "rejected"];

/** 첨부 파일 최대 크기(서버도 같은 기준으로 다시 확인합니다) */
export const MAX_ATTACHMENT_BYTES = 1024 * 1024;
export const ACCEPTED_ATTACHMENT = "image/png,image/jpeg,application/pdf";

/**
 * 개선 요청은 서버(/api/requests)에 저장됩니다. 직원은 본인이 낸 요청만, 관리자는 모든 요청을 받습니다(서버가 판단).
 */
async function call<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(withBasePath(url), {
      cache: "no-store",
      credentials: "same-origin",
      ...init,
      headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
    const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!res.ok || !data) return { ok: false, error: data?.error ?? "처리하지 못했습니다." };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요." };
  }
}

export async function fetchRequests(): Promise<{ ok: true; requests: ImprovementRequest[] } | { ok: false; error: string }> {
  const r = await call<{ requests: ImprovementRequest[] }>("/api/requests");
  return r.ok ? { ok: true, requests: r.data.requests } : r;
}

export interface NewRequestInput {
  contentId: string;
  kind: ImprovementKind;
  message: string;
  requesterDepartment: string;
  attachment?: SourceFile;
}

/** 개선 요청 등록. 기존 안내 콘텐츠는 어떤 경우에도 수정하지 않습니다. 대상 안내의 제목·버전은 서버가 정합니다. */
export async function submitRequest(input: NewRequestInput): Promise<{ ok: true; request: ImprovementRequest } | { ok: false; error: string }> {
  const r = await call<{ request: ImprovementRequest }>("/api/requests", {
    method: "POST",
    body: JSON.stringify({
      contentId: input.contentId,
      kind: input.kind,
      message: input.message,
      requesterDepartment: input.requesterDepartment,
      attachment: input.attachment ? { name: input.attachment.name, dataUrl: input.attachment.dataUrl } : undefined,
    }),
  });
  return r.ok ? { ok: true, request: r.data.request } : r;
}

/** 개선 요청 상태 변경·답변은 관리자만 할 수 있습니다(서버가 확인). 실패하면 오류를 던집니다. */
export async function updateRequest(
  requestId: string,
  patch: Partial<Pick<ImprovementRequest, "status" | "adminNote" | "appliedVersion">>,
): Promise<ImprovementRequest> {
  const r = await call<{ request: ImprovementRequest }>(`/api/admin/requests/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    // adminNote 항목을 보냈는데 비어 있으면 서버가 메모를 지웁니다. 항목 자체를 보내지 않으면 기존 메모를 그대로 둡니다.
    body: JSON.stringify("adminNote" in patch ? { ...patch, adminNote: patch.adminNote ?? "" } : patch),
  });
  if (!r.ok) throw new Error(r.error);
  return r.data.request;
}

/** 서버의 개선 요청 목록을 받아 보여 주는 훅(로그인 상태가 바뀌면 다시 받아옵니다). */
export function useRequests() {
  const session = useSession();
  const userKey = session.user ? `${session.user.role}:${session.user.name}` : session.status;
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; requests: ImprovementRequest[]; error?: string }>({
    status: "loading",
    requests: [],
  });

  const refresh = useCallback(async () => {
    const r = await fetchRequests();
    setState(r.ok ? { status: "ready", requests: r.requests } : (prev) => ({ ...prev, status: prev.requests.length ? "ready" : "error", error: r.error }));
  }, []);

  useEffect(() => {
    if (session.status === "loading") return;
    if (!session.user) {
      // 로그인하지 않으면 서버가 요청을 주지 않습니다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "ready", requests: [] });
      return;
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  return { ...state, refresh };
}

/** 파일을 data URL로 읽어 첨부 객체로 만듭니다. 크기·형식 오류는 메시지로 돌려줍니다. */
export function readAttachment(file: File): Promise<{ ok: true; file: SourceFile } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      resolve({ ok: false, error: "파일은 1MB 이하만 첨부할 수 있습니다." });
      return;
    }
    if (!ACCEPTED_ATTACHMENT.split(",").includes(file.type)) {
      resolve({ ok: false, error: "PNG, JPG, PDF 파일만 첨부할 수 있습니다." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ ok: true, file: { name: file.name, type: file.type, size: file.size, dataUrl: String(reader.result) } });
    reader.onerror = () => resolve({ ok: false, error: "파일을 읽지 못했습니다. 다시 선택해 주세요." });
    reader.readAsDataURL(file);
  });
}
