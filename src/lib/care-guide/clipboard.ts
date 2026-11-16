/**
 * 클립보드 복사. 결과(성공 여부)를 정확히 돌려줍니다.
 * - HTTPS·localhost 에서는 Clipboard API를 씁니다.
 * - 사내망처럼 HTTP로 열면 브라우저가 Clipboard API를 막으므로, 숨겨진 입력칸을 선택해 복사하는 방법(execCommand)으로 대신합니다.
 * - 둘 다 실패하면 false 를 돌려주며, 화면은 "복사됨"이라고 표시하지 않고 직접 복사하도록 안내해야 합니다.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한 거부 등: 아래 대체 방법을 시도합니다.
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
  const active = document.activeElement as HTMLElement | null;
  document.body.appendChild(area);
  try {
    area.focus({ preventScroll: true });
    area.select();
    area.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
    active?.focus?.({ preventScroll: true });
  }
}
