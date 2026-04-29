import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogListingClient } from "@/components/sections/BlogListingClient";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";
import { getBlogPosts } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Editing insights, motion graphics breakdowns, and post-production notes from Swikrit Pokhrel.",
  keywords: [
    "video editing blog",
    "motion graphics tips",
    "post production workflow",
    "Swikrit Pokhrel blog",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog - Swikrit Pokhrel",
    description: "Insights and process notes from active client projects.",
    url: "/blog",
    images: [buildOgImageUrl("Blog")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Swikrit Pokhrel",
    description: "Insights and process notes from active client projects.",
    images: [buildOgImageUrl("Blog")],
  },
};

const blogBreadcrumb = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
]);

export default async function BlogPage() {
  const posts = await getBlogPosts(true);

  return (
    <div className="space-y-10 pt-12">
      <JsonLd data={blogBreadcrumb} />
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Blog</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Insights and Process Notes</h1>
        <p className="max-w-2xl text-muted-foreground">
          Editorial strategy, motion workflow tips, and behind-the-scenes lessons from
          active client projects.
        </p>
      </section>

      <section className="container">
        <BlogListingClient posts={posts} />
      </section>
    </div>
  );
}
