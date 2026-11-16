export const HOSPITAL_NAME = "한양대학교병원";

/**
 * 아직 실제 서비스 도메인이 정해지지 않았을 때 쓰는 최후 폴백입니다.
 * 실제로는 클라이언트에서 `window.location.origin`을, 서버에서는
 * 요청의 Host 헤더(`getServerOrigin`)를 우선 사용하므로, 이 값은
 * "어느 쪽도 알 수 없는" 극히 예외적인 상황에서만 쓰입니다.
 *
 * 중요: 이전 버전에서는 이 값이 `https://guide.hanyang.ac.kr`(존재하지
 * 않는 가상 도메인)으로 고정되어 있었습니다. 그 상태로 배포하면 SMS
 * 문구·QR·카카오 링크가 배포된 실제 주소가 아니라 그 가짜 도메인을
 * 가리키는 채로 나가는 심각한 문제가 있어, 배포 검증 과정에서 발견해
 * 동적 origin 해석 방식으로 교체했습니다.
 */
const FALLBACK_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/** 브라우저(클라이언트 컴포넌트)에서 현재 접속 중인 origin을 가져옵니다. */
export function getClientOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return FALLBACK_ORIGIN;
}

export { FALLBACK_ORIGIN };
