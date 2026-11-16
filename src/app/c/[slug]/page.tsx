import type { Metadata } from "next";
import { headers } from "next/headers";
import ContentPageClient from "@/components/care-guide/patient/ContentPageClient";
import { withBasePath } from "@/lib/care-guide/base-path";
import { findPublicGuideBySlug } from "@/lib/server/guides";

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
 * CMS에서 수정·등록한 콘텐츠는 서버 저장소에 있으므로 여기서도 그 내용을 반영합니다.
 * 환자에게 공개할 수 없는 콘텐츠(비게시·의료진 검토 대기)는 미리보기에서도 제목·요약을 보여 주지 않습니다.
 * 서버 저장소를 읽지 못하면 안전하게 일반 제목만 보여 줍니다(관리자가 비게시로 바꾼 기존 안내가 노출되지 않도록).
 */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await findPublicGuideBySlug(slug);

  if (!guide) {
    return { title: "안내를 찾을 수 없습니다 | 한양 케어가이드" };
  }

  const title = `한양대학교병원 ${guide.title}`;
  const description = guide.summary;
  const origin = await getRequestOrigin();
  const logoPath = withBasePath("/logo.png");
  const imageUrl = origin ? `${origin}${logoPath}` : logoPath;

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
