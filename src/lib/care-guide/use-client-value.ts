"use client";

import { useEffect, useState } from "react";

/**
 * localStorage 등 브라우저 전용 데이터 소스를 마운트 이후(또는 deps 변경 시)
 * 안전하게 읽어오는 훅입니다. 서버 렌더링 시에는 seed 값을 반환해 하이드레이션
 * 불일치를 피하고, 이후 loader() 결과로 갱신합니다.
 * (의도된 "마운트 후 외부 저장소 동기화" 패턴이라 set-state-in-effect 규칙을 비활성화합니다.)
 */
export function useClientValue<T>(loader: () => T, seed: T, deps: unknown[] = []): T {
  const [value, setValue] = useState<T>(seed);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(loader());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
