"use client";

import { lazy, Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SocialStatsSettings } from "@/lib/data";
import type { Testimonial } from "@/lib/types";
import { Button } from "@/components/ui/button";

const LazyTestimonialsCarousel = lazy(async () => {
  const imported = await import("@/components/sections/TestimonialsCarousel");
  return { default: imported.TestimonialsCarousel };
});

const LazySocialStats = lazy(async () => {
  const imported = await import("@/components/sections/SocialStats");
  return { default: imported.SocialStats };
});

interface AboutBelowFoldProps {
  statsByKey: Record<string, string>;
  socialStats: SocialStatsSettings;
  testimonials: Testimonial[];
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="container space-y-4">
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      <div className="h-40 animate-pulse rounded-2xl border border-border/70 bg-card/70" />
    </section>
  );
}

export function AboutBelowFold({
  statsByKey,
  socialStats,
  testimonials,
}: AboutBelowFoldProps) {
  return (
    <Suspense
      fallback={
        <>
          <SectionSkeleton title="Testimonials" />
          <SectionSkeleton title="Social Presence" />
        </>
      }
    >
      <section className="container space-y-4">
        <h2 className="text-2xl font-semibold sm:text-3xl">Testimonials</h2>
        <LazyTestimonialsCarousel testimonials={testimonials} />
      </section>

      <section className="container">
        <LazySocialStats stats={statsByKey} social={socialStats} />
      </section>

      <section className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-brand/25 via-card to-card/70 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-brand/20 blur-2xl" />

          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.14em] text-brand">Social Universe</p>
            <h2 className="max-w-2xl text-2xl font-semibold sm:text-3xl">
              Social feed moved to a dedicated page with a bolder experience.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Explore platform highlights, post grids, and follow actions inside a custom
              social showcase built separately from the About page.
            </p>

            <Button asChild variant="brand">
              <Link href="/social" className="inline-flex items-center gap-2">
                Open Social Feed
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Suspense>
  );
}
