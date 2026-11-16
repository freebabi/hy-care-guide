/**
 * 브라우저 localStorage 기반의 임시 저장소 유틸입니다.
 * 프로토타입 단계에서 "로컬 DB" 역할을 하며, 실제 서비스에서는
 * 백엔드 API + 실제 데이터베이스로 대체되어야 합니다.
 */
export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 저장에 성공하면 true, 실패(용량 초과 등)하면 false를 돌려줍니다. 호출하는 쪽에서 사용자에게 알려야 합니다. */
export function writeStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
