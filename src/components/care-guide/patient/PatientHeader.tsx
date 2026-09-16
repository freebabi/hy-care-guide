export default function PatientHeader({ patientName }: { patientName: string }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-slate-500">한양대학교병원</p>
      <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{patientName} 님</p>
    </div>
  );
}
