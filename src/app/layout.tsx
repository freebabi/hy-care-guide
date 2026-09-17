import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { FALLBACK_ORIGIN } from "@/lib/care-guide/constants";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  // 빌드 시점에 확정되는 값이라, Vercel처럼 VERCEL_URL을 자동 주입하는
  // 환경이 아니면 배포 시 NEXT_PUBLIC_SITE_URL 환경변수를 반드시 설정하세요.
  // /c/[slug]는 요청 시점의 실제 Host 헤더를 따로 사용하므로 이 값과 무관하게 정확합니다.
  metadataBase: new URL(FALLBACK_ORIGIN),
  title: "한양 케어가이드(HY Care Guide)",
  description: "필요한 환자 안내 콘텐츠를 빠르게 찾아 SMS·QR·카카오 알림톡으로 전달하는 서비스입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">{children}</body>
    </html>
  );
}
