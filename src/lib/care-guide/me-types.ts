/**
 * 내 보관함·활용 이력·공지에서 서버와 화면이 함께 쓰는 타입과 문구입니다.
 * 환자를 식별하는 정보(이름·등록번호·생년월일·연락처 등)는 어떤 항목에도 두지 않습니다.
 */

export interface FavoriteItem {
  contentId: string;
  title: string;
  /** 등록 시각(ISO) */
  at: string;
}

export interface RecentItem {
  contentId: string;
  title: string;
  lastViewedAt: string;
  count: number;
}

export interface BundleItem {
  id: string;
  title: string;
  description: string;
  contentIds: string[];
  /** 지금은 본인만 볼 수 있는 개인 묶음만 지원합니다. */
  visibility: "private";
  createdAt: string;
  updatedAt: string;
  /** 작성자 표시 이름 */
  author: string;
}

export interface LibraryData {
  favorites: FavoriteItem[];
  recent: RecentItem[];
  bundles: BundleItem[];
}

/**
 * 활용 이력 유형. 서로 다른 이벤트로 구분해서 저장합니다.
 * - view: 자료를 열어 봄(자동)
 * - download: 구성 목록 파일을 내려받음
 * - print: 인쇄용 화면을 열어 인쇄를 준비함
 * - compose: 안내자료 묶음을 저장함
 * - provided: 직원이 ‘현장에서 직접 안내했다’고 손으로 남긴 기록(자동 기록 아님)
 * - message-prep: 안내 문구·QR을 만들거나 복사함 — 전송이 아니라 준비 단계일 뿐입니다.
 */
export type ActivityType = "view" | "download" | "print" | "compose" | "provided" | "message-prep";

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  view: "자료 열람",
  download: "자료 다운로드",
  print: "인쇄 준비",
  compose: "안내자료 구성",
  provided: "안내 제공 완료 기록",
  "message-prep": "안내 문구·QR 준비",
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_LABEL) as ActivityType[];

export interface ActivityItem {
  id: string;
  type: ActivityType;
  /** 콘텐츠 제목 또는 자료 묶음명 */
  title: string;
  contentId?: string;
  bundleId?: string;
  /** 함께 사용된 관련 자료(묶음에 포함된 콘텐츠 등) */
  related?: Array<{ contentId: string; title: string }>;
  /** 실행한 사용자 표시 이름 */
  user: string;
  at: string;
}

export type NoticeType = "important" | "new" | "revision" | "retired" | "other";

export const NOTICE_TYPE_LABEL: Record<NoticeType, string> = {
  important: "중요 공지",
  new: "신규 자료 등록",
  revision: "콘텐츠 개정",
  retired: "사용 종료",
  other: "기타 업데이트",
};

export const NOTICE_TYPES = Object.keys(NOTICE_TYPE_LABEL) as NoticeType[];

export type NoticeStatus = "draft" | "published" | "ended";

export const NOTICE_STATUS_LABEL: Record<NoticeStatus, string> = {
  draft: "임시 저장",
  published: "게시 중",
  ended: "게시 종료",
};

export interface NoticeRevision {
  contentId: string;
  fromVersion?: number;
  toVersion?: number;
  /** 개정일(YYYY-MM-DD) */
  revisedAt?: string;
  /** 주요 변경사항 */
  changes?: string;
}

export interface NoticeItem {
  id: string;
  type: NoticeType;
  title: string;
  body: string;
  important: boolean;
  pinned: boolean;
  status: NoticeStatus;
  relatedContentIds: string[];
  revision?: NoticeRevision;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  endedAt?: string;
  /** 현재 사용자가 읽었는지(서버가 사용자별로 계산해서 내려줍니다) */
  read?: boolean;
}
