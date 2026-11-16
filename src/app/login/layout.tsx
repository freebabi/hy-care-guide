import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 | HY CARE GUIDE",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-blue-mist">{children}</div>;
}
