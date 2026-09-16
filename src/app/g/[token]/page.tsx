import PatientMobileHome from "@/components/care-guide/patient/PatientMobileHome";

export default async function PatientHomePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PatientMobileHome token={token} />;
}
