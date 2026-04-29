import {
  fallbackBlogs,
  fallbackPortfolio,
  fallbackServices,
  fallbackSocialPosts,
  fallbackStats,
  fallbackTestimonials,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  BlogPost,
  ContactInquiry,
  DashboardSummary,
  PortfolioItem,
  Service,
  SiteStat,
  SocialPost,
  Testimonial,
} from "@/lib/types";

export interface SocialStatsSettings {
  instagram_handle: string;
  instagram_followers: string;
  tiktok_handle: string;
  tiktok_followers: string;
  linkedin_handle: string;
  linkedin_followers: string;
  total_views_label: string;
}

const fallbackSocialStatsSettings: SocialStatsSettings = {
  instagram_handle: "@swikritpokhrel",
  instagram_followers: "24K+",
  tiktok_handle: "@swikritpokhrel",
  tiktok_followers: "18K+",
  linkedin_handle: "swikrit-pokhrel",
  linkedin_followers: "6K+",
  total_views_label: "12M+",
};

function normalizeCategory(category?: string | null) {
  if (!category) {
    return null;
  }

  return category.toLowerCase().trim().replace(/\s+/g, "_");
}

export async function getSiteStats() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_stats")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    const stats = (data ?? []) as SiteStat[];
    return stats.length > 0 ? stats : fallbackStats;
  } catch {
    return fallbackStats;
  }
}

export async function getPortfolioItems(options?: {
  featuredOnly?: boolean;
  limit?: number;
  category?: string | null;
}) {
  const featuredOnly = options?.featuredOnly ?? false;
  const category = normalizeCategory(options?.category);

  try {
    const supabase = createClient();
    let query = supabase
      .from("portfolio_items")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const items = (data ?? []) as PortfolioItem[];
    if (items.length > 0) {
      return items;
    }

    const fallback = fallbackPortfolio.filter((item) => {
      const featuredMatch = featuredOnly ? item.is_featured : true;
      const categoryMatch = category
        ? normalizeCategory(item.category) === category
        : true;

      return featuredMatch && categoryMatch;
    });

    return options?.limit ? fallback.slice(0, options.limit) : fallback;
  } catch {
    const fallback = fallbackPortfolio.filter((item) => {
      const featuredMatch = featuredOnly ? item.is_featured : true;
      const categoryMatch = category
        ? normalizeCategory(item.category) === category
        : true;

      return featuredMatch && categoryMatch;
    });

    return options?.limit ? fallback.slice(0, options.limit) : fallback;
  }
}

export async function getPortfolioItemById(id: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as PortfolioItem;
    }

    return fallbackPortfolio.find((item) => item.id === id) ?? null;
  } catch {
    return fallbackPortfolio.find((item) => item.id === id) ?? null;
  }
}

export async function getServices(activeOnly = true) {
  try {
    const supabase = createClient();
    let query = supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const items = (data ?? []) as Service[];
    return items.length > 0 ? items : fallbackServices;
  } catch {
    return fallbackServices;
  }
}

export async function getTestimonials(featuredOnly = true) {
  try {
    const supabase = createClient();
    let query = supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const items = (data ?? []) as Testimonial[];
    return items.length > 0 ? items : fallbackTestimonials;
  } catch {
    return fallbackTestimonials;
  }
}

export async function getBlogPosts(publishedOnly = true) {
  try {
    const supabase = createClient();
    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const posts = (data ?? []) as BlogPost[];
    return posts.length > 0 ? posts : fallbackBlogs;
  } catch {
    return fallbackBlogs;
  }
}

export async function getBlogPostBySlug(slug: string, publishedOnly = true) {
  try {
    const supabase = createClient();
    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug);

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as BlogPost;
    }

    const fallback = fallbackBlogs.find((post) => post.slug === slug) ?? null;
    return fallback;
  } catch {
    const fallback = fallbackBlogs.find((post) => post.slug === slug) ?? null;
    return fallback;
  }
}

export async function getRelatedBlogPosts(
  slug: string,
  tags: string[] | null,
  limit = 3
) {
  try {
    const supabase = createClient();
    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .neq("slug", slug);

    if (tags && tags.length > 0) {
      query = query.overlaps("tags", tags);
    }

    const { data, error } = await query
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const posts = (data ?? []) as BlogPost[];
    if (posts.length > 0) {
      return posts;
    }

    return fallbackBlogs.filter((post) => post.slug !== slug).slice(0, limit);
  } catch {
    return fallbackBlogs.filter((post) => post.slug !== slug).slice(0, limit);
  }
}

export async function getStatsMap() {
  const stats = await getSiteStats();

  return stats.reduce<Record<string, string>>((acc, stat) => {
    acc[stat.stat_key] = stat.stat_value;
    return acc;
  }, {});
}

export async function getSocialPosts(limit = 12) {
  try {
    const supabase = createClient();
    const orderedQuery = await supabase
      .from("social_posts")
      .select("*")
      .order("display_order", { ascending: true })
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (!orderedQuery.error) {
      const posts = (orderedQuery.data ?? []) as SocialPost[];
      return posts.length > 0 ? posts : fallbackSocialPosts;
    }

    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .order("posted_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const posts = (data ?? []) as SocialPost[];
    return posts.length > 0 ? posts : fallbackSocialPosts;
  } catch {
    return fallbackSocialPosts;
  }
}

export async function getSocialStatsSettings() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "social_stats")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const value = (data?.setting_value ?? {}) as Partial<SocialStatsSettings>;

    return {
      instagram_handle: value.instagram_handle ?? fallbackSocialStatsSettings.instagram_handle,
      instagram_followers:
        value.instagram_followers ?? fallbackSocialStatsSettings.instagram_followers,
      tiktok_handle: value.tiktok_handle ?? fallbackSocialStatsSettings.tiktok_handle,
      tiktok_followers: value.tiktok_followers ?? fallbackSocialStatsSettings.tiktok_followers,
      linkedin_handle: value.linkedin_handle ?? fallbackSocialStatsSettings.linkedin_handle,
      linkedin_followers:
        value.linkedin_followers ?? fallbackSocialStatsSettings.linkedin_followers,
      total_views_label: value.total_views_label ?? fallbackSocialStatsSettings.total_views_label,
    } satisfies SocialStatsSettings;
  } catch {
    return fallbackSocialStatsSettings;
  }
}

export async function getInquiries(limit = 50) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []) as ContactInquiry[];
  } catch {
    return [] as ContactInquiry[];
  }
}

export async function getDashboardSummary() {
  const summary: DashboardSummary = {
    portfolioCount: 0,
    serviceCount: 0,
    blogCount: 0,
    inquiryCount: 0,
  };

  try {
    const supabase = createClient();

    const [portfolioRes, servicesRes, blogRes, inquiryRes] = await Promise.all([
      supabase
        .from("portfolio_items")
        .select("id", { count: "exact", head: true }),
      supabase.from("services").select("id", { count: "exact", head: true }),
      supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("contact_inquiries")
        .select("id", { count: "exact", head: true }),
    ]);

    summary.portfolioCount = portfolioRes.count ?? 0;
    summary.serviceCount = servicesRes.count ?? 0;
    summary.blogCount = blogRes.count ?? 0;
    summary.inquiryCount = inquiryRes.count ?? 0;

    return summary;
  } catch {
    return summary;
  }
}
