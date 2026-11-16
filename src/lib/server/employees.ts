import "server-only";
import { normalizeName } from "@/lib/auth/server";
import { readJson, updateJson } from "./store";

/**
 * 직원 등록부(사번 → 이름). 병원 인사 명부와 연결되기 전까지의 임시 장치입니다.
 * - 처음 로그인하는 사번은 입력한 이름으로 등록됩니다(먼저 등록한 사람의 이름이 기준).
 * - 이후 같은 사번은 같은 이름으로만 로그인할 수 있습니다.
 * - 잘못 등록된 경우 관리자가 해당 사번의 등록을 초기화할 수 있습니다.
 * 주의: 사번·이름은 본인 확인 수단이 아니라 ‘구별’하는 값입니다. 인사 명부/SSO 연동 전에는 타인의 사번·이름을 아는 사람이 로그인할 수 있습니다.
 */
export interface EmployeeRecord {
  name: string;
  firstLoginAt: string;
  lastLoginAt: string;
  loginCount: number;
}

interface Registry {
  employees: Record<string, EmployeeRecord>;
}

const FILE = "employees.json";
const empty = (): Registry => ({ employees: {} });

export type RegisterResult = { ok: true; isNew: boolean } | { ok: false; reason: "name-mismatch" };

export function registerLogin(employeeId: string, name: string): Promise<RegisterResult> {
  return updateJson<Registry, RegisterResult>(FILE, empty(), (reg) => {
    reg.employees ??= {};
    const now = new Date().toISOString();
    const existing = reg.employees[employeeId];
    if (!existing) {
      reg.employees[employeeId] = { name, firstLoginAt: now, lastLoginAt: now, loginCount: 1 };
      return { ok: true, isNew: true };
    }
    if (normalizeName(existing.name) !== normalizeName(name)) return { ok: false, reason: "name-mismatch" };
    existing.lastLoginAt = now;
    existing.loginCount += 1;
    return { ok: true, isNew: false };
  });
}

export async function listEmployees(): Promise<Array<{ employeeId: string } & EmployeeRecord>> {
  const reg = await readJson<Registry>(FILE, empty());
  return Object.entries(reg.employees ?? {})
    .map(([employeeId, r]) => ({ employeeId, ...r }))
    .sort((a, b) => b.lastLoginAt.localeCompare(a.lastLoginAt));
}

/** 잘못 등록된 사번의 이름 연결을 지웁니다. 그 직원의 보관함·이력 데이터는 삭제하지 않습니다(사번 기준이라 다시 로그인하면 이어집니다). */
export function resetEmployee(employeeId: string): Promise<boolean> {
  return updateJson<Registry, boolean>(FILE, empty(), (reg) => {
    if (!reg.employees?.[employeeId]) return false;
    delete reg.employees[employeeId];
    return true;
  });
}
