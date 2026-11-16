import AuthGate from "@/components/care-guide/staff/AuthGate";
import StaffNav from "@/components/care-guide/staff/StaffNav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-blue-mist print:bg-white">
      <AuthGate>
        <StaffNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 print:max-w-none print:p-0">{children}</main>
      </AuthGate>
    </div>
  );
}
