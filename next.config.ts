import type { NextConfig } from "next";

/**
 * HY AGENT PLACE 배포 대응
 *
 * - APP_BASE_PATH: 앱이 서비스되는 하위 경로(예: /apps/앱이름). 값이 없으면 루트("/")에서 실행합니다.
 *   Next.js의 basePath는 빌드 때 고정되므로, 도커 이미지는 APP_BASE_PATH=/__APP_BASE_PATH__ (자리표시)로 빌드하고
 *   컨테이너가 시작될 때 scripts/docker-start.sh 가 그 자리표시를 플랫폼이 넣어 준 실제 값으로 바꿉니다.
 *   (실제 값을 코드에 적어 두지 않습니다.)
 * - NEXT_OUTPUT=standalone: 도커 이미지용 최소 실행 묶음을 만듭니다. 로컬 개발·`npm run start`에는 영향이 없습니다.
 */
function resolveBasePath(): string {
  const raw = (process.env.APP_BASE_PATH ?? "").trim();
  if (!raw || raw === "/") return "";
  const normalized = `/${raw.replace(/^\/+|\/+$/g, "")}`;
  if (!/^\/[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/.test(normalized)) {
    throw new Error("APP_BASE_PATH 형식이 올바르지 않습니다. 영문·숫자·점·밑줄·하이픈과 /만 쓸 수 있습니다.");
  }
  return normalized;
}

const basePath = resolveBasePath();

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" as const, outputFileTracingRoot: process.cwd() } : {}),
  // 도커/standalone 묶음에 서버 데이터(.data)와 비밀값 파일(.env*)이 따라 들어가지 않게 합니다.
  // (서버 저장소가 파일 경로를 동적으로 다뤄서 소스 폴더(src)까지 따라 들어오는 것도 막습니다. 실행에는 필요 없습니다.)
  outputFileTracingExcludes: { "/*": [".data/**/*", ".env", ".env.*", "src/**/*"] },
  // 화면 코드(fetch·이미지 경로)가 같은 값을 쓰도록 빌드 결과물에 넣어 둡니다(src/lib/care-guide/base-path.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
