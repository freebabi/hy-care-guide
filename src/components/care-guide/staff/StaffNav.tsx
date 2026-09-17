"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChartIcon, HistoryIcon, MenuIcon, CloseIcon, DocumentPlusIcon } from "../icons";

const NAV_ITEMS = [
  { href: "/", label: "환자 안내" },
  { href: "/library", label: "환자 안내 콘텐츠" },
  { href: "/history", label: "발송 이력" },
  { href: "/cms", label: "콘텐츠 관리" },
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="한양대학교병원" width={1025} height={1004} className="h-7 w-7 object-contain" />
          <span className="text-sm font-extrabold text-slate-800">
            HY CARE GUIDE <span className="font-medium text-slate-400">직원용</span>
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
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-slate-100 text-brand-blue" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
          className="rounded-md p-1.5 text-slate-700 md:hidden"
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
              className={`block rounded-lg px-2 py-2.5 text-sm font-semibold ${
                pathname === item.href ? "text-brand-blue" : "text-slate-700"
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
