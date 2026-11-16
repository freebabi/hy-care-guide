import StaffGuidePage from "@/components/care-guide/staff/StaffGuidePage";

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StaffGuidePage slug={slug} />;
}
