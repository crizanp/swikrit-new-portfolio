import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clapperboard,
  Sparkles,
  Palette,
  Cuboid,
  AudioLines,
  PenTool,
  Download,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutTimeline } from "@/components/sections/AboutTimeline";
import { AboutBelowFold } from "@/components/sections/about/AboutBelowFold";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";
import { getSiteStats, getSocialPosts, getSocialStatsSettings, getTestimonials } from "@/lib/data";
import { getPublicUrl } from "@/lib/supabase/storage";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Swikrit Pokhrel, a Nepal-based video editor and motion graphics designer with 3+ years of experience and 150+ completed projects.",
  keywords: [
    "about Swikrit Pokhrel",
    "video editor Nepal",
    "motion graphics designer Nepal",
    "After Effects editor",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About - Swikrit Pokhrel",
    description: "Experience, tools, and creative process behind cinematic editing work.",
    url: "/about",
    images: [buildOgImageUrl("About")],
  },
  twitter: {
    card: "summary_large_image",
    title: "About - Swikrit Pokhrel",
    description: "Experience, tools, and creative process behind cinematic editing work.",
    images: [buildOgImageUrl("About")],
  },
};

const aboutBreadcrumb = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
]);

export default async function AboutPage() {
  const [stats, socialPosts, socialStats, testimonials] = await Promise.all([
    getSiteStats(),
    getSocialPosts(9),
    getSocialStatsSettings(),
    getTestimonials(true),
  ]);

  const timeline = [
    {
      year: "2021",
      title: "Started Freelance Editing",
      description: "Worked with creators and local brands on short-form edits and ad creatives.",
    },
    {
      year: "2022",
      title: "Expanded Into Motion Graphics",
      description: "Built title systems, animated templates, and branded social kits in After Effects.",
    },
    {
      year: "2023",
      title: "Scaled to International Clients",
      description: "Partnered with remote teams across campaigns, launch films, and content pipelines.",
    },
    {
      year: "2024+",
      title: "Full-Service Post Production",
      description: "Delivering end-to-end edits, VFX polish, and distribution-ready exports worldwide.",
    },
  ];

  const tools = [
    { label: "Adobe Premiere Pro", icon: <Clapperboard className="h-5 w-5" /> },
    { label: "After Effects", icon: <Sparkles className="h-5 w-5" /> },
    { label: "DaVinci Resolve", icon: <Palette className="h-5 w-5" /> },
    { label: "Cinema 4D", icon: <Cuboid className="h-5 w-5" /> },
    { label: "Audition", icon: <AudioLines className="h-5 w-5" /> },
    { label: "Photoshop", icon: <PenTool className="h-5 w-5" /> },
  ];

  let cvUrl = "#";
  try {
    cvUrl = getPublicUrl("avatars", "swikrit-cv.pdf");
  } catch {
    cvUrl = "#";
  }

  const statByKey = stats.reduce<Record<string, string>>((acc, stat) => {
    acc[stat.stat_key] = stat.stat_value;
    return acc;
  }, {});

  return (
    <div className="space-y-12 pt-12">
      <JsonLd data={aboutBreadcrumb} />
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">About</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Swikrit Pokhrel</h1>
        <p className="max-w-2xl text-muted-foreground">
          Professional video editor and motion graphics designer creating cinematic,
          conversion-focused stories for Nepal and global clients.
        </p>
      </section>

      <section className="container grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <Badge variant="outline">Full Bio</Badge>
          <p className="text-muted-foreground">
            I craft edits that blend emotional storytelling with platform performance.
            My process combines strategy, pacing, sound, and motion design so each cut
            feels cinematic while still engineered for retention and engagement.
          </p>
          <p className="text-muted-foreground">
            From launch films to social content systems, I collaborate closely with
            founders, artists, and marketing teams to deliver fast turnarounds without
            compromising visual quality.
          </p>
          <Button asChild variant="brand">
            <Link href={cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download CV
            </Link>
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-brand/25 via-background to-background p-2">
          <div className="relative aspect-[4/5] rounded-xl bg-black/20">
            <Image
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"
              alt="Swikrit Pokhrel portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container space-y-5">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.12em] text-brand">Skills</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Advanced Editing and Motion Workflow</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Story-Driven Video Editing", "98%"],
            ["After Effects Animation", "95%"],
            ["Color Grading", "92%"],
            ["Sound Design", "87%"],
          ].map(([label, value]) => (
            <Card key={label} className="border-border/70 bg-card/75">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold text-brand">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/80">
                  <div className="h-full rounded-full bg-brand" style={{ width: value }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container space-y-4">
        <h2 className="text-2xl font-semibold sm:text-3xl">Career Timeline</h2>
        <AboutTimeline items={timeline} />
      </section>

      <section className="container space-y-4">
        <h2 className="text-2xl font-semibold sm:text-3xl">Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.label}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 transition duration-200 hover:scale-[1.02] hover:border-brand/60"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-brand">
                {tool.icon}
              </span>
              <span className="text-sm font-medium">{tool.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/65 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-3xl font-bold text-brand">
              {statByKey.years_experience ?? "3+"}
            </p>
            <p className="text-sm text-muted-foreground">Years</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-bold text-brand">
              {statByKey.projects_done ?? "150+"}
            </p>
            <p className="text-sm text-muted-foreground">Projects</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-bold text-brand">
              {statByKey.views_generated ?? "12M+"}
            </p>
            <p className="text-sm text-muted-foreground">Views</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-bold text-brand">
              {statByKey.happy_clients ?? "80+"}
            </p>
            <p className="text-sm text-muted-foreground">Happy Clients</p>
          </div>
        </div>
      </section>

      <AboutBelowFold
        statsByKey={statByKey}
        socialStats={socialStats}
        socialPosts={socialPosts}
        testimonials={testimonials}
      />
    </div>
  );
}
