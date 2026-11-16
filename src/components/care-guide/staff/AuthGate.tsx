"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/care-guide/session";

/** 직원용 화면 보호막: 로그인하지 않았으면 로그인 화면으로 보냅니다. (환자용 /c/… 페이지에는 쓰지 않습니다.) */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, authConfigured } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "anonymous") return;
    const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/login${next}`);
  }, [status, pathname, router]);

  if (status === "authenticated") return <>{children}</>;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-slate-600" role="status">
      {status === "anonymous" && !authConfigured ? "로그인 설정이 아직 되어 있지 않습니다. 관리자에게 문의해 주세요." : "로그인 확인 중입니다…"}
    </div>
  );
}
