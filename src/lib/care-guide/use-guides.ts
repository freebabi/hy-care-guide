"use client";

import { useCallback, useState } from "react";
import { GUIDES } from "./guides-data";
import { loadGuides } from "./cms-store";
import { useClientValue } from "./use-client-value";

/**
 * CMS에서 추가/수정한 내용까지 반영된 콘텐츠 목록을 제공하는 훅입니다.
 * 첫 렌더링은 서버와 동일한 시드 데이터로 시작해 하이드레이션 불일치를
 * 피하고, 마운트 이후 localStorage 내용으로 갱신합니다.
 */
export function useGuides() {
  const [reloadKey, setReloadKey] = useState(0);
  const guides = useClientValue(loadGuides, GUIDES, [reloadKey]);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return { guides, refresh };
}
