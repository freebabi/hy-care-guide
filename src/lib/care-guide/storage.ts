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

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패(용량 초과 등)는 프로토타입에서 무시합니다.
  }
}
