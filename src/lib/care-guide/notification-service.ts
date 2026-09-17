import { readStorage, writeStorage } from "./storage";
import { HOSPITAL_NAME, getClientOrigin } from "./constants";
import type { DeliveryChannel, GuideContent, SendLogEntry } from "./types";

const STORAGE_KEY = "hycg.sendlog.v2";

/**
 * Phase 1에서는 실제 SMS/카카오 API를 연동하지 않습니다. 이 모듈은
 * "발송에 필요한 문구/링크를 만드는 것"까지만 담당하고, 실제 전송은
 * 병원의 기존 EHR(SMS)·향후 승인될 카카오 비즈메시지 API가 수행합니다.
 *
 * Phase 2에서 실제 발송 API를 연동할 때는 이 파일의 build*Message
 * 함수는 그대로 두고, "발송 실행" 함수만 추가하면 되도록 메시지 생성과
 * 실행을 분리해두었습니다.
 */

/**
 * 콘텐츠 고정 URL을 만듭니다. 이 함수는 클라이언트 컴포넌트(발송 어시스턴트)
 * 에서만 호출되므로, 항상 지금 실제로 접속 중인 origin을 사용합니다 —
 * 로컬 개발이면 localhost, 배포 후면 실제 배포 도메인이 자동으로 들어갑니다.
 */
export function buildContentUrl(slug: string): string {
  return `${getClientOrigin()}/c/${slug}`;
}

/** 한글 받침 유무에 따라 "을"/"를" 조사를 골라줍니다. */
function eulOrReul(word: string): "을" | "를" {
  const lastChar = word.trim().slice(-1);
  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "를";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
}

export interface SmsMessageParts {
  messageOnly: string;
  link: string;
  full: string;
}

export function buildSmsMessage(guide: GuideContent): SmsMessageParts {
  const messageOnly = `${HOSPITAL_NAME} ${guide.title}${eulOrReul(guide.title)} 안내드립니다.\n아래 링크에서 확인해주세요.`;
  const link = buildContentUrl(guide.slug);
  return { messageOnly, link, full: `${messageOnly}\n\n${link}` };
}

export interface KakaoMessagePreview {
  title: string;
  body: string;
  link: string;
  buttonLabel: string;
}

/**
 * 카카오 알림톡 미리보기 문구만 생성합니다. 실제 카카오 비즈메시지 API는
 * 호출하지 않습니다(발송 버튼이 없고 "복사"만 제공하는 이유). Phase 2에서
 * 병원이 카카오 발신 프로필/템플릿 심사를 마치면, 이 함수의 반환값을
 * 그대로 실제 발송 API 페이로드로 재사용하고 "발송 실행" 함수만
 * 새로 추가하면 됩니다.
 */
export function buildKakaoMessage(guide: GuideContent): KakaoMessagePreview {
  return {
    title: `[${HOSPITAL_NAME}] ${guide.title}`,
    body: guide.summary,
    link: buildContentUrl(guide.slug),
    buttonLabel: "안내 확인하기",
  };
}

export function buildKakaoMessageText(guide: GuideContent): string {
  const m = buildKakaoMessage(guide);
  return `${m.title}\n\n${m.body}\n\n${m.link}\n\n[${m.buttonLabel}]`;
}

function generateLogId(): string {
  return `log-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function getSendLog(): SendLogEntry[] {
  return readStorage<SendLogEntry[]>(STORAGE_KEY, []);
}

function saveSendLog(entries: SendLogEntry[]): void {
  writeStorage(STORAGE_KEY, entries);
}

export function recordSendPrep(guide: GuideContent, channel: DeliveryChannel): SendLogEntry {
  const entry: SendLogEntry = {
    logId: generateLogId(),
    contentId: guide.contentId,
    contentTitle: guide.title,
    channel,
    completed: true,
    performedAt: new Date().toISOString(),
  };
  saveSendLog([entry, ...getSendLog()]);
  return entry;
}
