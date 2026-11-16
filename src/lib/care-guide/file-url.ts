import { withBasePath } from "./base-path";

/**
 * 첨부 파일 주소를 브라우저가 열 수 있는 값으로 바꿉니다.
 * 서버에 저장된 파일은 "/api/…" 주소(앱 하위 경로 접두어 필요), 아직 저장 전인 파일은 data: 주소(그대로 사용)입니다.
 */
export function fileHref(url: string): string {
  return url.startsWith("data:") ? url : withBasePath(url);
}
