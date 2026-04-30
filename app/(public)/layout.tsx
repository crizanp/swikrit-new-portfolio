import type { ReactNode } from "react";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollProgress />
      <Navbar />
      <main id="main-content" className="flex-1 pb-16">
        {children}
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
