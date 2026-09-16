import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "한양 케어가이드(HY-Cure) | EMR 기반 맞춤형 환자 교육자료 플랫폼",
  description:
    "EMR 진료 정보와 자동 연동되어 환자에게 꼭 필요한 맞춤형 교육자료를 추천하고 발송하는 스마트 헬스케어 플랫폼, 한양 케어가이드(HY-Cure)입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">{children}</body>
    </html>
  );
}
