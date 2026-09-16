import { readStorage, writeStorage } from "./storage";
import type { DeliveryChannel, Patient, SentRecord } from "./types";

const STORAGE_KEY = "hycg.history.v1";

/**
 * 실제 카카오 알림톡/SMS API는 연동하지 않은 Mock 발송 서비스입니다.
 * 발송 "성공"을 흉내내고, 환자가 열어볼 모바일 웹 링크(token)를 생성해
 * 로컬 저장소에 이력으로 남깁니다.
 *
 * 실 서비스 전환 시 이 모듈은 백엔드의 알림톡/SMS 발송 API 호출과
 * 보안 토큰 발급(만료시간 포함)으로 교체되어야 합니다.
 */
function generateToken(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function getHistory(): SentRecord[] {
  return readStorage<SentRecord[]>(STORAGE_KEY, []);
}

function saveHistory(records: SentRecord[]): void {
  writeStorage(STORAGE_KEY, records);
}

export function sendGuidesToPatient(
  patient: Patient,
  contentIds: string[],
  channel: DeliveryChannel,
  sentBy = "서비스전략팀 담당자",
): SentRecord {
  const record: SentRecord = {
    recordId: `r-${generateToken()}`,
    token: generateToken(),
    patientId: patient.patientId,
    patientName: patient.name,
    contentIds,
    channel,
    sentAt: new Date().toISOString(),
    sentBy,
  };
  const history = getHistory();
  saveHistory([record, ...history]);
  return record;
}

export function getRecordByToken(token: string): SentRecord | undefined {
  return getHistory().find((r) => r.token === token);
}

export function getHistoryForPatient(patientId: string): SentRecord[] {
  return getHistory()
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export function buildPatientLink(token: string): string {
  if (typeof window === "undefined") return `/g/${token}`;
  return `${window.location.origin}/g/${token}`;
}

export const CHANNEL_LABEL: Record<DeliveryChannel, string> = {
  kakao: "카카오 알림톡",
  sms: "문자(SMS)",
  qr: "QR 코드",
};
