"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, useSession } from "@/lib/care-guide/session";
import { withBasePath } from "@/lib/care-guide/base-path";

type Mode = "employee" | "admin";

/** 이동할 주소를 같은 사이트 안의 경로로만 제한합니다(외부 주소로 보내는 것을 막기 위해). */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\") || raw.startsWith("/login")) return "/";
  return raw;
}

const inputClass =
  "mt-1.5 block min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30";

export default function LoginPage() {
  const router = useRouter();
  const { status, adminLoginAvailable, authConfigured } = useSession();
  const [mode, setMode] = useState<Mode>("employee");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    }
  }, [status, router]);

  const idOk = /^\d{5,10}$/.test(employeeId.trim());
  const canSubmit = !busy && name.trim().length >= 2 && idOk && (mode === "employee" || password.length > 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setBusy(true);
    const result =
      mode === "employee"
        ? await login({ mode: "employee", name, employeeId: employeeId.trim() })
        : await login({ mode: "admin", name, employeeId: employeeId.trim(), password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      if (mode === "admin") setPassword("");
    }
  };

  const tab = (value: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => {
        setMode(value);
        setError("");
      }}
      className={`min-h-[44px] flex-1 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
        mode === value ? "bg-white text-brand-blue-dark shadow-sm" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-center gap-2.5">
        <Image src={withBasePath("/logo.png")} alt="한양대학교병원" width={1025} height={1004} unoptimized className="h-9 w-9 object-contain" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">HY CARE GUIDE</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-center text-sm text-slate-600">직원용 화면입니다. 이름과 사번으로 로그인해 주세요.</p>

        <div role="tablist" aria-label="로그인 방식" className="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1">
          {tab("employee", "직원 로그인")}
          {tab("admin", "관리자 로그인")}
        </div>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="login-name" className="text-sm font-semibold text-slate-800">
              이름
            </label>
            <input
              id="login-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요"
              maxLength={20}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="login-employee-id" className="text-sm font-semibold text-slate-800">
              사번
            </label>
            <input
              id="login-employee-id"
              name="employeeId"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ""))}
              placeholder="숫자로 된 사번"
              maxLength={10}
              className={inputClass}
            />
            {mode === "employee" && (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                처음 로그인하면 입력한 이름이 사번에 등록되고, 이후에는 같은 이름으로만 로그인할 수 있습니다. 보관함·이력은 사번 기준으로 저장됩니다.
              </p>
            )}
          </div>

          {mode === "admin" && (
            <div>
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-800">
                관리자 비밀번호
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              {!adminLoginAvailable && status !== "loading" && (
                <p className="mt-2 text-xs leading-relaxed text-amber-800">관리자 로그인이 서버에 아직 설정되지 않았습니다. 설정 후 로그인할 수 있습니다.</p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-900">
              {error}
            </p>
          )}
          {status !== "loading" && !authConfigured && (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              로그인 설정(SESSION_SECRET)이 서버에 없어 로그인할 수 없습니다.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-[48px] rounded-full bg-brand-blue px-5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "확인 중…" : mode === "employee" ? "직원으로 로그인" : "관리자로 로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
