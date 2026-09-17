import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { SITE_ORIGIN } from "@/lib/care-guide/constants";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  // 아직 실제 배포 도메인이 없어 SMS/카카오 문구와 같은 예정 도메인을 씁니다.
  // OG 이미지 등 상대 경로를 절대 URL로 만드는 데만 쓰이고, 로컬 개발에는 영향이 없습니다.
  metadataBase: new URL(SITE_ORIGIN),
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
