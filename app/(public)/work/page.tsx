import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { WorkPortfolioClient } from "@/components/sections/WorkPortfolioClient";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";
import { getPortfolioItems } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work",
  description:
    "Explore commercial edits, music videos, documentaries, social reels, and motion graphics projects by Swikrit Pokhrel.",
  keywords: [
    "video editing portfolio",
    "motion graphics portfolio",
    "Swikrit Pokhrel work",
    "cinematic editing projects",
  ],
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work - Swikrit Pokhrel",
    description:
      "Explore commercial edits, music videos, documentaries, social reels, and motion graphics projects.",
    url: "/work",
    images: [buildOgImageUrl("Work")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work - Swikrit Pokhrel",
    description: "Portfolio highlights and featured projects.",
    images: [buildOgImageUrl("Work")],
  },
};

const workBreadcrumb = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Work", path: "/work" },
]);

interface WorkPageProps {
  searchParams?: {
    category?: string;
  };
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const category = searchParams?.category ?? "all";
  const portfolioItems = await getPortfolioItems();

  return (
    <div className="space-y-10 pt-12">
      <JsonLd data={workBreadcrumb} />
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Portfolio</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Selected Projects</h1>
        <p className="max-w-2xl text-muted-foreground">
          Explore commercial edits, music videos, documentaries, social media reels, and
          motion graphics systems crafted for campaign performance.
        </p>
      </section>

      <section className="container">
        <WorkPortfolioClient items={portfolioItems} activeCategory={category} />
      </section>
    </div>
  );
}
