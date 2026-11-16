/**
 * 콘텐츠 주소(slug) 처리 도구.
 *
 * 왜 필요한가
 * - 한글 주소(예: /c/수술-안내)는 브라우저가 %EC%88%98… 처럼 인코딩해서 보내고, Next.js도 그 인코딩된 값을
 *   그대로 넘겨 줍니다. 저장된 slug(한글)와 그냥 비교하면 항상 달라서 상세 화면이 열리지 않았습니다.
 * - 그래서 비교할 때는 항상 "한 번만 디코딩 + 유니코드 정규화(NFC)"한 값끼리 비교합니다.
 * - 주소를 만들 때는 한 번만 인코딩합니다(이미 인코딩된 값을 다시 인코딩하지 않음).
 *
 * 기존 콘텐츠 88건의 slug는 모두 영문·숫자·하이픈이라 이 도구를 거쳐도 값과 주소가 바뀌지 않습니다.
 */

/** 인코딩된 주소 조각을 한 번만 디코딩합니다. 잘못된 인코딩이면 원래 값을 그대로 돌려줍니다. */
export function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** 비교용 기준 값: 한 번 디코딩 + 유니코드 정규화(NFC, 맥에서 입력한 한글 대응) + 앞뒤 공백 제거 */
export function normalizeSlug(raw: string): string {
  return safeDecode(raw).normalize("NFC").trim();
}

/** 두 주소가 같은 콘텐츠를 가리키는지(인코딩 여부·한글 정규화와 무관하게) */
export function slugEquals(a: string, b: string): boolean {
  return normalizeSlug(a) === normalizeSlug(b);
}

/**
 * 제목(또는 직접 입력한 값)에서 주소를 만듭니다.
 * 영문 소문자·숫자·한글만 남기고, 공백·밑줄은 하나의 하이픈으로, 연속·앞뒤 하이픈은 정리합니다.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s_-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** 이미 쓰고 있는 주소 목록과 겹치면 -2, -3 … 을 붙여 겹치지 않는 주소를 돌려줍니다. */
export function uniqueSlug(base: string, taken: string[]): string {
  const used = new Set(taken.map((s) => normalizeSlug(s)));
  if (!used.has(normalizeSlug(base))) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!used.has(normalizeSlug(candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/**
 * 저장할 주소를 정합니다(등록·수정 창과 테스트에서 같은 규칙을 씁니다).
 * - 직접 입력한 값이 있으면 그 값을 정리해서 쓰고, 이미 있는 주소와 겹치면 오류를 돌려줍니다.
 * - 비워 두면 제목에서 만들고, 겹치면 -2, -3 … 을 붙여 겹치지 않게 합니다.
 */
export function resolveSlug(
  typedRaw: string,
  title: string,
  existing: string[],
): { slug: string; adjusted: boolean; error?: undefined } | { slug?: undefined; adjusted?: undefined; error: string; base?: string } {
  const typed = typedRaw.trim();
  const base = slugify(typed || title);
  if (!base) return { error: "URL에 사용할 수 있는 문자가 없습니다. 영문/숫자/한글로 입력해주세요." };
  const taken = existing.some((s) => slugEquals(s, base));
  if (typed && taken) return { error: `이미 사용 중인 URL입니다: /c/${base}`, base };
  return typed ? { slug: base, adjusted: false } : { slug: uniqueSlug(base, existing), adjusted: taken };
}

/** 주소에 넣을 조각: 한 번만 인코딩합니다(영문·숫자·하이픈은 그대로). */
export function encodeSlug(slug: string): string {
  return encodeURIComponent(normalizeSlug(slug));
}

/** 환자용 상세 화면 경로 */
export function contentPath(slug: string): string {
  return `/c/${encodeSlug(slug)}`;
}

/** 직원용 상세 화면 경로 */
export function guidePath(slug: string): string {
  return `/guides/${encodeSlug(slug)}`;
}
