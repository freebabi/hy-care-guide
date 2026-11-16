/**
 * 배포 플랫폼(HY AGENT PLACE)은 앱을 `/apps/앱이름/` 같은 하위 경로에서 실행합니다.
 * 그 앞부분(APP_BASE_PATH)은 플랫폼이 컨테이너 시작 때 환경변수로 넣어 주며, 코드에 적어 두지 않습니다.
 *
 * Next.js의 basePath는 빌드할 때 고정되므로, 도커 빌드에서는 자리표시 문구(/__APP_BASE_PATH__)로 빌드하고
 * 컨테이너 시작 스크립트(scripts/docker-start.sh)가 빌드 결과물의 그 문구를 실제 값으로 바꿉니다.
 *
 * 자동으로 앞부분이 붙는 것(손대지 않음):  <Link href>, router.push/replace, /_next/…(스크립트·CSS·글꼴), public 파일 자체
 * 직접 붙여야 하는 것(이 함수 사용):         fetch("/api/…"), <img>/<Image src="/…">, <a href="/…">처럼 Next를 거치지 않는 절대 경로,
 *                                          밖으로 공유하는 전체 주소(링크·QR)
 *
 * 주의: 같은 경로에 이 함수를 두 번 적용하면 앞부분이 두 번 붙습니다. Link·router에는 쓰지 마세요.
 */

/** 빌드 때 next.config.ts 가 넣어 둔 앞부분. 루트에서 실행하면 빈 문자열입니다. */
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** "/api/…"처럼 `/`로 시작하는 경로 앞에 앱의 하위 경로를 한 번 붙입니다. (`//`로 시작하거나 `/`로 시작하지 않으면 그대로) */
export function withBasePath(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  return `${BASE_PATH}${path}`;
}
