import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AboutSection } from "@/components/sections/about-section";
import { FeaturedWorkSection } from "@/components/sections/featured-work-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { Button } from "@/components/ui/button";
import { getPortfolioItems, getServices, getSiteStats } from "@/lib/data";

export default async function HomePage() {
  const [stats, portfolioItems, services] = await Promise.all([
    getSiteStats(),
    getPortfolioItems({ featuredOnly: true, limit: 3 }),
    getServices(true),
  ]);

  return (
    <>
      <HeroSection stats={stats} />
      <FeaturedWorkSection items={portfolioItems} />
      <ServicesSection services={services.slice(0, 3)} />
      <AboutSection compact />

      <section className="container">
        <div className="rounded-3xl border border-border bg-card/75 px-6 py-10 text-center sm:px-10">
          <p className="text-sm uppercase tracking-[0.12em] text-brand">Ready to Collaborate</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Let us make your next release impossible to ignore.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Share your footage, goals, and timeline. I will propose a production plan
            that fits your scope and delivery cadence.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="brand" size="lg">
              <Link href="/contact">
                Book a Call
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
