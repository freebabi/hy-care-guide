export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-full w-full max-w-md bg-slate-50 px-4 py-6">{children}</main>
  );
}
