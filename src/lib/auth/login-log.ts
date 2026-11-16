import "server-only";
import { appendFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { isDurable } from "@/lib/server/store";

/**
 * 직원 로그인 기록. 남기는 것은 ‘직원 이름’, ‘로그인 시각’, 그리고 구별용 ‘사번’뿐입니다(관리자 화면에는 이름·시간만 표시).
 * (IP·기기 정보·비밀번호 등은 저장하지 않습니다. 관리자 로그인은 기록하지 않습니다.)
 *
 * 저장 위치
 * - 내 컴퓨터/자체 서버: 프로젝트의 .data/login-log.jsonl (git에는 올라가지 않음)
 * - LOGIN_LOG_DIR 환경변수를 주면 그 폴더에 저장
 * - Vercel 같은 서버리스 환경: 파일이 영구 보관되지 않아(임시 폴더) 기록이 사라질 수 있습니다.
 *   운영에서 영구 보관이 필요하면 DB로 옮겨야 하며, 이 파일의 append/read 두 함수만 바꾸면 됩니다.
 */
export interface LoginLogEntry {
  name: string;
  /** 사번(같은 이름의 다른 직원을 구별하기 위한 값). 예전 기록에는 없을 수 있습니다. */
  employeeId?: string;
  /** 로그인 시각(ISO 8601, UTC). 화면에서 한국 시간으로 보여줍니다. */
  at: string;
}

const MAX_ENTRIES = 5000; // 이보다 많아지면 오래된 기록부터 지웁니다.
const TRIM_CHECK_BYTES = 400 * 1024;

/** 실제 저장 폴더 지정·쓰기 가능 여부 기준(서버 저장소와 같은 판단을 씁니다). */
export function isLogDurable(): boolean {
  return isDurable();
}

function logFile(): string {
  const dir =
    process.env.APP_DATA_DIR ||
    process.env.LOGIN_LOG_DIR ||
    (process.env.VERCEL ? path.join(tmpdir(), "hycg-data") : path.join(process.cwd(), ".data"));
  return path.join(dir, "login-log.jsonl");
}

function parse(text: string): LoginLogEntry[] {
  const out: LoginLogEntry[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line) as Partial<LoginLogEntry>;
      if (typeof e.name === "string" && typeof e.at === "string") {
        out.push(typeof e.employeeId === "string" ? { name: e.name, employeeId: e.employeeId, at: e.at } : { name: e.name, at: e.at });
      }
    } catch {
      // 깨진 줄은 건너뜁니다.
    }
  }
  return out;
}

/** 직원 로그인 한 건을 기록합니다. 실패해도 로그인 자체를 막지 않도록 예외를 던지지 않습니다. */
export async function recordEmployeeLogin(name: string, employeeId?: string): Promise<boolean> {
  try {
    const file = logFile();
    await mkdir(path.dirname(file), { recursive: true });
    const entry: LoginLogEntry = employeeId ? { name, employeeId, at: new Date().toISOString() } : { name, at: new Date().toISOString() };
    await appendFile(file, JSON.stringify(entry) + "\n", "utf8");
    // 파일이 커졌을 때만 오래된 기록을 정리합니다.
    const size = (await stat(file)).size;
    if (size > TRIM_CHECK_BYTES) {
      const all = parse(await readFile(file, "utf8"));
      if (all.length > MAX_ENTRIES) {
        await writeFile(file, all.slice(-MAX_ENTRIES).map((e) => JSON.stringify(e)).join("\n") + "\n", "utf8");
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** 최근 기록부터 돌려줍니다. */
export async function readLoginLog(limit = MAX_ENTRIES): Promise<LoginLogEntry[]> {
  try {
    const text = await readFile(logFile(), "utf8");
    return parse(text).reverse().slice(0, limit);
  } catch {
    return [];
  }
}
