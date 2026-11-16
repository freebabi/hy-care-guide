import "server-only";
import { createHash, randomBytes } from "node:crypto";
import {
  access,
  copyFile,
  mkdir,
  open,
  readFile,
  rename,
  unlink,
} from "node:fs/promises";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * 서버 쪽 저장소(JSON 파일). 이 프로젝트에는 아직 데이터베이스가 없어서,
 * 사용자별 보관함·활용 이력·공지·CMS 콘텐츠·개선 요청을 서버의 데이터 폴더에 파일로 저장합니다.
 *
 * - 저장 위치: APP_DATA_DIR(없으면 LOGIN_LOG_DIR, 그것도 없으면 프로젝트의 .data/).
 * - 같은 파일에 동시에 쓰는 요청은 한 줄로 세워서(직렬화) 처리하고, 임시 파일에 쓴 뒤 교체해 깨짐을 막습니다.
 *   ※ 이 직렬화는 "서버 프로세스 1개" 안에서만 유효합니다. 인스턴스를 여러 개 띄우면 서로의 쓰기를 막지 못하므로
 *     단일 인스턴스 운영이 전제입니다(getStorageStatus().singleInstanceAssumed 참고).
 * - 운영 전에는 이 파일의 readJson/updateJson만 DB 구현으로 바꾸면 나머지 코드는 그대로 쓸 수 있습니다.
 */
function baseDir(): string {
  const configured = process.env.APP_DATA_DIR || process.env.LOGIN_LOG_DIR;
  if (configured) return configured;
  return process.env.VERCEL ? path.join(tmpdir(), "hycg-data") : path.join(process.cwd(), ".data");
}

// ───────────────────────── 저장 상태(실제 폴더·쓰기 가능 여부 기준) ─────────────────────────

export interface StorageStatus {
  /** 데이터가 재배포·재시작 뒤에도 남는다고 말할 수 있는지(경로가 지정되어 있고, 실제로 쓸 수 있고, 임시 폴더가 아님) */
  durable: boolean;
  /** 지금 이 폴더에 실제로 쓸 수 있는지(쓰기 시험 결과) */
  writable: boolean;
  /** APP_DATA_DIR(또는 LOGIN_LOG_DIR)이 지정되어 있는지 */
  configured: boolean;
  /** 시작 스크립트가 임시 폴더로 대체했거나 서버리스 임시 폴더인지(재배포하면 사라짐) */
  temporary: boolean;
  /** 파일 저장은 서버 프로세스 1개만 안전합니다. 플랫폼이 이를 보장하는지는 이 앱이 확인할 수 없습니다. */
  singleInstanceAssumed: true;
  /** 사람이 읽는 한 줄 설명(경로 자체는 노출하지 않음) */
  message: string;
  checkedAt: string;
}

let statusCache: { at: number; value: StorageStatus } | null = null;

/** 쓰기 시험은 몇 초 동안만 재사용합니다(요청마다 디스크를 건드리지 않기 위해). 시험용으로 캐시를 비웁니다. */
export function resetStorageStatusCache(): void {
  statusCache = null;
}

export function getStorageStatus(): StorageStatus {
  const now = Date.now();
  if (statusCache && now - statusCache.at < 10_000) return statusCache.value;

  const dir = baseDir();
  const configured = Boolean(process.env.APP_DATA_DIR || process.env.LOGIN_LOG_DIR);
  const temporary = process.env.HYCG_DATA_DIR_TEMP === "1" || (!configured && Boolean(process.env.VERCEL));
  let writable = false;
  try {
    mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, `.write-test-${process.pid}`);
    writeFileSync(probe, "ok", "utf8");
    unlinkSync(probe);
    writable = true;
  } catch {
    writable = false;
  }
  const durable = configured && writable && !temporary;
  const message = !writable
    ? "저장 폴더에 쓸 수 없어 데이터가 저장되지 않습니다. 폴더 경로와 권한을 확인하세요."
    : temporary
      ? "임시 폴더에 저장 중입니다. 서버를 다시 배포하면 저장한 데이터가 사라집니다."
      : !configured
        ? "저장 폴더(APP_DATA_DIR)가 지정되지 않아 개발용 폴더에 저장 중입니다. 운영 환경에서는 영구 저장이 보장되지 않습니다."
        : "지정된 저장 폴더에 쓸 수 있습니다. (플랫폼의 백업·단일 인스턴스 운영 여부는 이 화면에서 확인할 수 없습니다.)";
  const value: StorageStatus = {
    durable,
    writable,
    configured,
    temporary,
    singleInstanceAssumed: true,
    message,
    checkedAt: new Date(now).toISOString(),
  };
  statusCache = { at: now, value };
  return value;
}

/** 저장 상태 배너용: 데이터가 안전하게 남는다고 말할 수 있을 때만 true. */
export function isDurable(): boolean {
  return getStorageStatus().durable;
}

// ───────────────────────── 파일 읽기·쓰기 ─────────────────────────

function resolve(rel: string): string {
  const root = path.resolve(baseDir());
  const full = path.resolve(root, rel);
  // 상대 경로로 폴더 밖을 가리키는 것을 막습니다.
  if (full !== root && !full.startsWith(root + path.sep)) throw new Error("invalid path");
  return full;
}

export async function readJson<T>(rel: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(resolve(rel), "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** 저장된 파일이 깨졌거나 읽을 수 없을 때 던지는 오류. 이 경우 어떤 데이터도 새로 쓰거나 초기화하지 않습니다. */
export class StoreCorruptError extends Error {
  constructor(
    public readonly file: string,
    detail: string,
  ) {
    super(`저장 데이터(${file})를 읽을 수 없습니다: ${detail}`);
    this.name = "StoreCorruptError";
  }
}

/**
 * 엄격한 읽기: 파일이 "없을 때만" 기본값을 돌려줍니다.
 * 파일은 있는데 JSON이 깨졌거나 권한 오류 등으로 읽지 못하면 오류를 던져, 호출한 쪽이 빈 데이터로 덮어쓰지 못하게 합니다.
 */
export async function readJsonStrict<T>(rel: string, fallback: T): Promise<T> {
  let raw: string;
  try {
    raw = await readFile(resolve(rel), "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw new StoreCorruptError(rel, (e as NodeJS.ErrnoException).code ?? "읽기 실패");
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new StoreCorruptError(rel, "JSON 형식이 올바르지 않습니다");
  }
}

export async function fileExists(rel: string): Promise<boolean> {
  try {
    await access(resolve(rel));
    return true;
  } catch {
    return false;
  }
}

/** 파일 이름 바꾸기(원본을 지우지 않고 보존용으로 옮길 때 사용) */
export async function renameFile(rel: string, newRel: string): Promise<void> {
  await rename(resolve(rel), resolve(newRel));
}

/** 폴더 안의 파일 이름 목록(폴더가 없으면 빈 목록) */
export async function listFiles(relDir: string): Promise<string[]> {
  try {
    const { readdir } = await import("node:fs/promises");
    return await readdir(resolve(relDir));
  } catch {
    return [];
  }
}

const RENAME_RETRY_CODES = new Set(["EPERM", "EBUSY", "EACCES"]);

/**
 * 원자적 파일 저장: 같은 폴더의 임시 파일에 끝까지 쓰고(디스크에 반영한 뒤) 이름을 바꿔 교체합니다.
 * 도중에 오류가 나도 기존 파일은 그대로입니다. 교체 직전의 기존 파일은 `<파일>.bak`으로 한 벌 남깁니다.
 * (Windows 등에서 백신·인덱서가 파일을 잠깐 잡고 있어 이름 바꾸기가 거절되면 몇 번 다시 시도합니다.)
 */
export async function writeFileAtomic(rel: string, data: string | Buffer, options: { backup?: boolean } = {}): Promise<void> {
  const file = resolve(rel);
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  try {
    const handle = await open(tmp, "w");
    try {
      await handle.writeFile(data);
      await handle.sync();
    } finally {
      await handle.close();
    }
    if (options.backup) {
      try {
        await copyFile(file, `${file}.bak`);
      } catch {
        // 처음 저장이라 기존 파일이 없으면 건너뜁니다.
      }
    }
    let lastError: unknown;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        await rename(tmp, file);
        return;
      } catch (e) {
        lastError = e;
        if (!RENAME_RETRY_CODES.has((e as NodeJS.ErrnoException).code ?? "")) break;
        await new Promise((r) => setTimeout(r, 25 * (attempt + 1)));
      }
    }
    throw lastError;
  } catch (e) {
    await unlink(tmp).catch(() => undefined);
    throw e;
  }
}

/** 이진 파일(첨부) 읽기. 없으면 null. */
export async function readFileBuffer(rel: string): Promise<Buffer | null> {
  try {
    return await readFile(resolve(rel));
  } catch {
    return null;
  }
}

export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

const queues = new Map<string, Promise<unknown>>();

/** 읽고-고치고-쓰기를 파일마다 한 번에 하나씩 실행합니다. mutator가 돌려준 값을 반환합니다. */
export function updateJson<T, R>(rel: string, fallback: T, mutator: (data: T) => R | Promise<R>): Promise<R> {
  const prev = queues.get(rel) ?? Promise.resolve();
  const run = prev
    .catch(() => undefined)
    .then(async () => {
      const data = await readJson<T>(rel, fallback);
      const result = await mutator(data);
      await writeFileAtomic(rel, JSON.stringify(data));
      return result;
    });
  queues.set(rel, run);
  return run;
}

/**
 * CMS 콘텐츠·개선 요청처럼 "잃으면 안 되는" 데이터용 읽고-고치고-쓰기.
 * - 저장 파일이 깨져 있으면(StoreCorruptError) 아무것도 쓰지 않고 오류를 던집니다(빈 데이터로 덮어쓰기 금지).
 * - mutator가 오류를 던지면 저장하지 않습니다(검증 실패·충돌 등).
 * - 저장할 때마다 직전 파일을 .bak으로 한 벌 남깁니다.
 */
export function updateJsonStrict<T, R>(rel: string, fallback: T, mutator: (data: T) => R | Promise<R>): Promise<R> {
  const prev = queues.get(rel) ?? Promise.resolve();
  const run = prev
    .catch(() => undefined)
    .then(async () => {
      const data = await readJsonStrict<T>(rel, fallback);
      const result = await mutator(data);
      await writeFileAtomic(rel, JSON.stringify(data), { backup: true });
      return result;
    });
  queues.set(rel, run);
  return run;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
