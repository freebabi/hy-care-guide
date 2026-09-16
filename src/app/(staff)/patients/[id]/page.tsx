import PatientDetailClient from "@/components/care-guide/staff/PatientDetailClient";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientDetailClient patientId={id} />;
}
