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
}) {
  const featuredOnly = options?.featuredOnly ?? false;

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

    const fallback = featuredOnly
      ? fallbackPortfolio.filter((item) => item.is_featured)
      : fallbackPortfolio;

    return options?.limit ? fallback.slice(0, options.limit) : fallback;
  } catch {
    const fallback = featuredOnly
      ? fallbackPortfolio.filter((item) => item.is_featured)
      : fallbackPortfolio;

    return options?.limit ? fallback.slice(0, options.limit) : fallback;
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

export async function getSocialPosts(limit = 12) {
  try {
    const supabase = createClient();
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
