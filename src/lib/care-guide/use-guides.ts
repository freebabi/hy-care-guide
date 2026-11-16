"use client";

/**
 * 서버에 저장된 변경분(관리자가 수정·등록한 내용)까지 반영된 콘텐츠 목록을 제공하는 훅입니다.
 * 구현은 guides-client.ts(서버에서 받아 오는 공유 캐시)에 있습니다.
 */
export { useGuides } from "./guides-client";
