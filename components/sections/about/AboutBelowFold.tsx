"use client";

import { lazy, Suspense } from "react";
import type { SocialPost, Testimonial } from "@/lib/types";
import type { SocialStatsSettings } from "@/lib/data";

const LazyTestimonialsCarousel = lazy(async () => {
  const imported = await import("@/components/sections/TestimonialsCarousel");
  return { default: imported.TestimonialsCarousel };
});

const LazySocialStats = lazy(async () => {
  const imported = await import("@/components/sections/SocialStats");
  return { default: imported.SocialStats };
});

const LazySocialFeed = lazy(async () => {
  const imported = await import("@/components/sections/SocialFeed");
  return { default: imported.SocialFeed };
});

interface AboutBelowFoldProps {
  statsByKey: Record<string, string>;
  socialStats: SocialStatsSettings;
  socialPosts: SocialPost[];
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
  socialPosts,
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
        <LazySocialFeed posts={socialPosts} social={socialStats} />
      </section>
    </Suspense>
  );
}
