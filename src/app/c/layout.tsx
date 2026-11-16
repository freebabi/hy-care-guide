export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full flex-1 max-w-md bg-slate-50 px-4 py-6">{children}</main>
  );
}
