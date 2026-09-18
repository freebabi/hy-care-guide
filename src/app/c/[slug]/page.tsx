import type { Metadata } from "next";
import { headers } from "next/headers";
import ContentPageClient from "@/components/care-guide/patient/ContentPageClient";
import { findGuideBySlug } from "@/lib/care-guide/guides-data";

/**
 * 배포 호스팅사(Vercel 등)에 종속되지 않도록, 지금 이 요청이 실제로 들어온
 * Host 헤더를 그대로 읽어 절대 URL을 만듭니다. 어디에 배포하든 정확합니다.
 */
async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return "";
  const forwardedProto = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProto || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

type Params = { slug: string };

/**
 * 카카오톡/문자 앱에서 링크를 눌렀을 때 보이는 미리보기 카드(OG 태그)를 만듭니다.
 *
 * 주의: 이 프로토타입은 CMS 편집 결과를 브라우저 localStorage에 저장하므로
 * 서버에서 실행되는 메타데이터 생성 시점에는 CMS 수정 내용을 알 수 없습니다.
 * 그래서 여기서는 항상 최초 배포된 시드 콘텐츠(guides-data.ts) 기준으로
 * 미리보기를 만듭니다. Phase 2에서 콘텐츠를 서버 DB로 옮기면 이 제약은 사라집니다.
 */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuideBySlug(slug);

  if (!guide || guide.status !== "게시") {
    return { title: "안내를 찾을 수 없습니다 | 한양 케어가이드" };
  }

  const title = `한양대학교병원 ${guide.title}`;
  const description = guide.summary;
  const origin = await getRequestOrigin();
  const imageUrl = origin ? `${origin}/logo.png` : "/logo.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "한양 케어가이드",
      locale: "ko_KR",
      type: "article",
      images: [imageUrl],
    },
  };
}

export default async function ContentPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <ContentPageClient slug={slug} />;
}
