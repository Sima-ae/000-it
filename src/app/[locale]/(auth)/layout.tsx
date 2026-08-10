export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[18%] h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[12%] right-[18%] h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
