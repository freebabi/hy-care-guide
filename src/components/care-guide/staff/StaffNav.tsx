"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  ChevronDown,
  History,
  ImageIcon,
  ListChecks,
  LogOut,
  Menu,
  MessageSquarePlus,
  Megaphone,
  FileText,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUnreadNotices } from "@/lib/care-guide/me-api";
import { ROLE_LABEL, useRole } from "@/lib/care-guide/role";
import { logout, useSession } from "@/lib/care-guide/session";
import { withBasePath } from "@/lib/care-guide/base-path";

/** 직원용 상단 메뉴(6개). 일반 직원과 관리자가 같은 메뉴를 보며, 관리 기능은 ‘관리자 메뉴’에 따로 모읍니다. */
const NAV_ITEMS: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "환자 안내 콘텐츠", icon: BookOpen },
  { href: "/library", label: "내 보관함", icon: Bookmark },
  { href: "/compose", label: "안내자료 구성", icon: ListChecks },
  { href: "/requests", label: "개선 요청", icon: MessageSquarePlus },
  { href: "/history", label: "발송·활용 이력", icon: History },
  { href: "/notices", label: "공지 및 업데이트", icon: Bell },
];

/** 관리자 전용 메뉴 — 화면에도, 서버 세션에서도 ADMIN일 때만 나타납니다. */
const ADMIN_MENU: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/dashboard", label: "통계", icon: BarChart3 },
  { href: "/cms", label: "콘텐츠 관리", icon: FileText },
  { href: "/notices/manage", label: "공지 관리", icon: Megaphone },
  { href: "/cms#assets", label: "안내 이미지 관리", icon: ImageIcon },
  { href: "/access-log", label: "직원 접속 기록", icon: UserRound },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname.startsWith("/guides");
  if (href === "/notices") return pathname === "/notices" || (pathname.startsWith("/notices/") && !pathname.startsWith("/notices/manage"));
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 역할 표시 배지. 관리자는 차분한 네이비, 일반 직원은 옅은 회색. */
function RoleBadge({ admin }: { admin: boolean }) {
  return admin ? (
    <span className="rounded-md bg-[#26384D] px-1.5 py-0.5 text-[11px] font-bold tracking-wider text-white">ADMIN</span>
  ) : (
    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">{ROLE_LABEL.EMPLOYEE}</span>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold leading-[18px] text-white"
      aria-label={`읽지 않은 공지 ${count}건`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function useLogout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    await logout();
    router.replace("/login");
    setBusy(false);
  };
  return { busy, run };
}

/** 데스크톱 상단 오른쪽 프로필 영역. 직원: 이름·역할·로그아웃 / 관리자: 이름·ADMIN 하나의 메뉴(관리자 전용 메뉴·로그아웃 포함) */
function ProfileArea() {
  const { user } = useSession();
  const role = useRole();
  const { busy, run } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!user) return <div className="h-9 w-40" aria-hidden />;

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2.5" data-testid="profile-area">
        <div className="flex flex-col items-end leading-tight">
          <span className="max-w-[7rem] truncate text-sm font-semibold text-slate-900">{user.name}</span>
          <span className="mt-0.5">
            <RoleBadge admin={false} />
          </span>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="inline-flex min-h-[36px] items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:opacity-60"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapRef} data-testid="profile-area">
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white pl-3 pr-2 text-sm font-semibold text-slate-900 hover:bg-blue-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
      >
        <span className="max-w-[7rem] truncate">{user.name}</span>
        <RoleBadge admin />
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        <span className="sr-only">관리자 메뉴 열기</span>
      </button>
      {menuOpen && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-bold tracking-wide text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            관리자 전용 메뉴
          </p>
          {ADMIN_MENU.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-soft hover:text-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
            >
              <item.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={run}
            disabled={busy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 text-slate-500" aria-hidden="true" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

export default function StaffNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const role = useRole();
  const unread = useUnreadNotices();
  const { busy, run } = useLogout();
  const isAdmin = role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="HY CARE GUIDE 홈">
          <Image src={withBasePath("/logo.png")} alt="" width={1025} height={1004} unoptimized className="h-7 w-7 object-contain" />
          <span className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold tracking-tight text-slate-900">HY CARE GUIDE</span>
            <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600 min-[400px]:inline">직원용</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="주 메뉴">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-2 text-[13px] transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                  active
                    ? "bg-blue-soft font-semibold text-brand-blue-dark"
                    : "font-medium text-slate-600 hover:bg-blue-soft/60 hover:text-brand-blue-dark"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
                {item.href === "/notices" && <UnreadBadge count={unread} />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 xl:block">
          <ProfileArea />
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          {user && <RoleBadge admin={isAdmin} />}
          {unread > 0 && <UnreadBadge count={unread} />}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-50"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-3 pt-2 xl:hidden" aria-label="모바일 메뉴">
          {user && (
            <div className="mb-1 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="mt-0.5">
                  <RoleBadge admin={isAdmin} />
                </p>
              </div>
              <button
                type="button"
                onClick={run}
                disabled={busy}
                className="inline-flex min-h-[40px] shrink-0 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
              >
                로그아웃
              </button>
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[44px] items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold ${
                  active ? "bg-blue-soft text-brand-blue-dark" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {item.label}
                {item.href === "/notices" && <UnreadBadge count={unread} />}
              </Link>
            );
          })}
          {isAdmin && (
            <div className="mt-1 border-t border-slate-100 pt-2">
              <p className="px-2.5 pb-1 text-[11px] font-bold tracking-wide text-slate-500">관리자 전용 메뉴</p>
              {ADMIN_MENU.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
