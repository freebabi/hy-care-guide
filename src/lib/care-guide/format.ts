/** 화면에 보이는 날짜·시간은 항상 한국 시간(KST)으로 통일합니다. */
const KST = "Asia/Seoul";
const dateFmt = new Intl.DateTimeFormat("sv-SE", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("sv-SE", { timeZone: KST, hour: "2-digit", minute: "2-digit", hour12: false });

/** 2026-11-10 */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** 2026-11-10 16:49 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${dateFmt.format(d)} ${timeFmt.format(d)}`;
}

/** 오늘 날짜(KST) 2026-11-10 */
export function todayKst(): string {
  return dateFmt.format(new Date());
}

/** KST 기준 YYYY-MM-DD의 하루 시작/끝을 ISO 시각으로 바꿉니다. */
export function kstDayStart(day: string): string {
  return new Date(`${day}T00:00:00+09:00`).toISOString();
}
export function kstDayEnd(day: string): string {
  return new Date(`${day}T23:59:59.999+09:00`).toISOString();
}

/** n일 전 날짜(KST) */
export function daysAgoKst(n: number): string {
  return dateFmt.format(new Date(Date.now() - n * 86_400_000));
}
