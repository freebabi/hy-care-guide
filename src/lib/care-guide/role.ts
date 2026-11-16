"use client";

import { getSessionState, useSession, type Role } from "./session";

/**
 * 사용자 역할은 두 가지뿐입니다.
 * - ADMIN: 서비스전략팀 계정 1개(관리자 비밀번호로만 로그인)
 * - EMPLOYEE: 그 외 모든 직원(기본값). 직원이 관리자 권한을 신청하거나 받는 기능은 없습니다.
 *
 * 역할은 서버가 서명한 세션에서만 오며, 화면에서 바꿀 수 없습니다. (이전의 ‘직원/관리자 선택 버튼’은 삭제됨)
 */
export type { Role } from "./session";

export const ROLE_LABEL: Record<Role, string> = { ADMIN: "관리자", EMPLOYEE: "일반 직원" };

/** 지금 로그인한 사용자의 역할. 로그인하지 않았거나 확인 전이면 항상 EMPLOYEE(권한 없음)로 봅니다. */
export function getRole(): Role {
  return getSessionState().user?.role ?? "EMPLOYEE";
}

export function useRole(): Role {
  return useSession().user?.role ?? "EMPLOYEE";
}
