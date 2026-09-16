"use client";

import { useState } from "react";
import Image from "next/image";
import { CloseIcon, MenuIcon } from "./icons";

const NAV_ITEMS = [
  { href: "#simulator", label: "환자용 큐레이션 체험" },
  { href: "#library", label: "교육자료 검색" },
  { href: "#about", label: "서비스 소개" },
  { href: "#emr", label: "EMR 연동 안내" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="한양큐어 HY-Cure 로고"
            width={1025}
            height={1004}
            priority
            className="h-9 w-9 object-contain"
          />
          <span className="text-lg font-extrabold text-brand-blue">
            한양큐어 <span className="font-medium text-slate-500">HY-Cure</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-brand-blue">
              {item.label}
            </a>
          ))}
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
        <nav className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-base font-semibold text-slate-700"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
