import StaffNav from "@/components/care-guide/staff/StaffNav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StaffNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}
