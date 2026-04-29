import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SiteStat } from "@/lib/types";

interface HeroSectionProps {
  stats: SiteStat[];
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="container pt-14 sm:pt-20">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 px-6 py-12 shadow-2xl shadow-black/30 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <Badge variant="brand" className="w-fit">
              Based in Nepal · Available Worldwide
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              High-impact edits and motion graphics that make brands feel alive.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              I help agencies, creators, and businesses turn raw footage into premium
              stories for ads, reels, launches, and long-form campaigns.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="brand" size="lg">
                <Link href="/contact">
                  Start a Project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/work">View Work</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.slice(0, 4).map((stat) => (
              <div
                key={stat.id}
                className="rounded-2xl border border-border bg-background/50 p-4"
              >
                <p className="font-heading text-3xl font-bold text-brand">
                  {stat.stat_value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.display_label ?? stat.stat_key}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
