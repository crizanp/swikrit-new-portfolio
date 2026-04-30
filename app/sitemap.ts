import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/work",
    "/services",
    "/about",
    "/social",
    "/blog",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    const supabase = createClient();

    const [portfolioRes, blogRes] = await Promise.all([
      supabase
        .from("portfolio_items")
        .select("id, updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("blog_posts")
        .select("slug, updated_at, is_published")
        .eq("is_published", true)
        .order("updated_at", { ascending: false }),
    ]);

    const portfolioRoutes: MetadataRoute.Sitemap = (portfolioRes.data ?? []).map((item) => ({
      url: `${base}/work/${item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const blogRoutes: MetadataRoute.Sitemap = (blogRes.data ?? []).map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...portfolioRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
