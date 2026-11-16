"use client";

import { useSyncExternalStore } from "react";

const BUILD_YEAR = new Date().getFullYear();

const subscribe = () => () => {};

/**
 * 현재 연도. 연도를 코드에 고정하지 않고 시스템 날짜에서 가져옵니다.
 * 정적으로 만들어진 페이지도 브라우저에서 열 때 그 시점의 연도로 바뀝니다.
 */
export default function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => BUILD_YEAR,
  );
  return <span suppressHydrationWarning>{year}</span>;
}
