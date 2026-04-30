import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { SocialShowcase } from "@/components/sections/social/SocialShowcase";
import { getPublicSiteSettings, getSocialPosts } from "@/lib/data";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Social Feed",
  description:
    "Explore the latest Instagram, TikTok, and LinkedIn content from Swikrit in a redesigned social experience.",
  keywords: [
    "social feed",
    "instagram video editor",
    "tiktok motion graphics",
    "linkedin content showcase",
  ],
  alternates: {
    canonical: "/social",
  },
  openGraph: {
    title: "Social Feed - Swikrit Pokhrel",
    description: "A bold social showcase across Instagram, TikTok, and LinkedIn.",
    url: "/social",
    images: [buildOgImageUrl("Social Feed")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Feed - Swikrit Pokhrel",
    description: "A bold social showcase across Instagram, TikTok, and LinkedIn.",
    images: [buildOgImageUrl("Social Feed")],
  },
};

const socialBreadcrumb = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Social Feed", path: "/social" },
]);

export default async function SocialPage() {
  const [posts, { social }] = await Promise.all([
    getSocialPosts(30),
    getPublicSiteSettings(),
  ]);

  return (
    <div className="space-y-10 pt-12">
      <JsonLd data={socialBreadcrumb} />

      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Social</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Social Feed, Reimagined</h1>
        <p className="max-w-2xl text-muted-foreground">
          A dedicated social showcase page with filterable platform streams and a bento-style
          visual layout.
        </p>
      </section>

      <section className="container">
        <SocialShowcase posts={posts} social={social} />
      </section>
    </div>
  );
}
