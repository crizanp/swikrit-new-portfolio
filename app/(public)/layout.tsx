import type { ReactNode } from "react";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SectionReveal } from "@/components/layout/SectionReveal";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollProgress />
      <SectionReveal />
      <Navbar />
      <main id="main-content" className="flex-1 space-y-20 pb-16">
        {children}
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
