import ContentPageClient from "@/components/care-guide/patient/ContentPageClient";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentPageClient slug={slug} />;
}
