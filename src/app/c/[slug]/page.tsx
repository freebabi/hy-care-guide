import type { Metadata } from "next";
import ContentPageClient from "@/components/care-guide/patient/ContentPageClient";
import { findGuideBySlug } from "@/lib/care-guide/guides-data";

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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "한양 케어가이드",
      locale: "ko_KR",
      type: "article",
      images: ["/logo.png"],
    },
  };
}

export default async function ContentPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <ContentPageClient slug={slug} />;
}
