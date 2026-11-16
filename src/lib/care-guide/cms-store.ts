import { withBasePath } from "./base-path";
import { getGuides, refreshGuides } from "./guides-client";
import type { GuideContent } from "./types";

export { nextContentId } from "./guide-merge";

/**
 * CMS 콘텐츠 변경(관리자 전용). 모든 변경은 서버 API(/api/admin/guides)가 받아 서버의 데이터 폴더에 저장합니다.
 * 권한 확인·검토 상태 규칙·버전 이력은 서버가 정하며, 이 파일은 요청을 보내고 결과를 화면 캐시에 반영할 뿐입니다.
 * (예전 브라우저 localStorage 방식은 더 이상 쓰지 않습니다.)
 */
async function send(body: Record<string, unknown>): Promise<GuideContent> {
  let res: Response;
  try {
    res = await fetch(withBasePath("/api/admin/guides"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
  }
  const data = (await res.json().catch(() => null)) as { guide?: GuideContent; error?: string } | null;
  if (!res.ok || !data?.guide) throw new Error(data?.error ?? "저장하지 못했습니다.");
  // 서버 기준 최신 목록으로 화면을 맞춥니다(다른 변경이 함께 반영될 수 있음).
  await refreshGuides();
  return data.guide;
}

/**
 * 콘텐츠 등록·수정. 같은 contentId가 이미 있으면 수정, 없으면 새 등록입니다.
 * 새 콘텐츠의 최종 ID·버전 이력·의료 검토 기본값(검토 대기)은 서버가 정해 돌려줍니다.
 * @param note 이번 변경의 요약(이력에 기록)
 * @param requestId 이 수정이 반영한 개선 요청 번호
 */
export function upsertGuide(guide: GuideContent, note?: string, requestId?: string): Promise<GuideContent> {
  const exists = getGuides().some((g) => g.contentId === guide.contentId);
  return send(exists ? { op: "update", guide, note, requestId } : { op: "create", guide, note });
}

export function toggleGuideStatus(contentId: string): Promise<GuideContent> {
  return send({ op: "toggle", contentId });
}

/** 사용 종료(폐기): 검토 상태를 "사용 종료"로, 게시 상태를 "비게시"로 바꾸고 이력을 남깁니다. 데이터는 지우지 않습니다. */
export function retireGuide(contentId: string): Promise<GuideContent> {
  return send({ op: "retire", contentId });
}

/** 폐기(사용 종료)한 콘텐츠를 "작성 중 · 미승인 · 비게시" 상태로 되돌립니다. 다시 게시하려면 검토·승인을 다시 거쳐야 합니다. */
export function restoreGuide(contentId: string): Promise<GuideContent> {
  return send({ op: "restore", contentId });
}
