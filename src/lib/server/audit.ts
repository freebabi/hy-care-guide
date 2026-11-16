import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * 관리자 활동 기록(누가·언제·무엇을). 공지 작성·수정·삭제, 직원 등록 초기화처럼 관리자만 할 수 있는 동작을 남깁니다.
 * 환자 정보나 공지 본문은 기록하지 않고, 대상 ID와 동작 이름만 남깁니다.
 * 저장은 서버 데이터 폴더의 admin-audit.jsonl(한 줄에 한 건)입니다. DB로 옮기면 admin_audit_log 표가 됩니다.
 */
export interface AuditEntry {
  /** 관리자 사번 */
  actor: string;
  action: string;
  target?: string;
  at: string;
}

function auditFile(): string {
  const dir =
    process.env.APP_DATA_DIR ||
    process.env.LOGIN_LOG_DIR ||
    (process.env.VERCEL ? path.join(tmpdir(), "hycg-data") : path.join(process.cwd(), ".data"));
  return path.join(dir, "admin-audit.jsonl");
}

/** 기록에 실패해도 관리 동작 자체를 막지 않습니다. */
export async function audit(actor: string, action: string, target?: string): Promise<void> {
  try {
    const file = auditFile();
    await mkdir(path.dirname(file), { recursive: true });
    const entry: AuditEntry = { actor, action, ...(target ? { target } : {}), at: new Date().toISOString() };
    await appendFile(file, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // 감사 기록 실패는 무시(서버 로그 정책은 운영 환경에서 별도 설정)
  }
}
