import { Navigation } from "@/components/shared/Navigation";
import { Footer } from "@/components/shared/Footer";
import { ContentTransition } from "@/components/shared/ContentTransition";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 pt-(--nav-offset)">
        <ContentTransition>{children}</ContentTransition>
      </main>
      <Footer />
    </div>
  );
}
