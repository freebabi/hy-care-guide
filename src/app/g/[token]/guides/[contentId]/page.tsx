import GuideDetailClient from "@/components/care-guide/patient/GuideDetailClient";

export default async function PatientGuideDetailPage({
  params,
}: {
  params: Promise<{ token: string; contentId: string }>;
}) {
  const { token, contentId } = await params;
  return <GuideDetailClient token={token} contentId={contentId} />;
}
