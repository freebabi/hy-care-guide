import MyGuidesClient from "@/components/care-guide/patient/MyGuidesClient";

export default async function MyGuidesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <MyGuidesClient token={token} />;
}
