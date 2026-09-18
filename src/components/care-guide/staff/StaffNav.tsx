"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChartIcon, HistoryIcon, MenuIcon, CloseIcon, DocumentPlusIcon } from "../icons";

const NAV_ITEMS = [
  { href: "/", label: "환자 안내 콘텐츠" },
  { href: "/cms", label: "콘텐츠 관리" },
  { href: "/history", label: "발송 이력" },
  { href: "/dashboard", label: "통계" },
];

const NAV_ICON: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  "/history": HistoryIcon,
  "/cms": DocumentPlusIcon,
  "/dashboard": ChartIcon,
};

export default function StaffNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="한양대학교병원" width={1025} height={1004} className="h-7 w-7 object-contain" />
          <span className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold tracking-tight text-slate-900">HY CARE GUIDE</span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              직원용
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = NAV_ICON[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-soft font-semibold text-brand-blue-dark"
                    : "font-medium text-slate-500 hover:bg-blue-soft/60 hover:text-brand-blue-dark"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="rounded-md p-1.5 text-slate-500 md:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 pb-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-2.5 py-2.5 text-sm font-semibold ${
                pathname === item.href ? "text-brand-blue" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
