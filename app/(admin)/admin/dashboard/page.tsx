import { DashboardClient } from "@/components/admin/DashboardClient";
import { createClient } from "@/lib/supabase/server";
import type { ContactInquiry } from "@/lib/types";

export const metadata = {
  title: "Admin Dashboard",
};

function buildDateBuckets(days = 30) {
  const buckets: Array<{ date: string; count: number }> = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);

    buckets.push({
      date: date.toISOString().slice(5, 10),
      count: 0,
    });
  }

  return buckets;
}

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [portfolioCountRes, blogCountRes, socialCountRes, inquiriesThisWeekRes, portfolioViewsRes, inquiriesRes, categoryRes, recentInquiriesRes] = await Promise.all([
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("social_posts").select("id", { count: "exact", head: true }),
    supabase
      .from("contact_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .gte("created_at", weekAgoIso),
    supabase.from("portfolio_items").select("views_count"),
    supabase
      .from("contact_inquiries")
      .select("created_at")
      .gte("created_at", monthAgoIso),
    supabase.from("portfolio_items").select("category"),
    supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const inquiryTrend = buildDateBuckets(30);
  const trendMap = new Map(inquiryTrend.map((bucket) => [bucket.date, bucket]));

  (inquiriesRes.data ?? []).forEach((entry) => {
    if (!entry.created_at) {
      return;
    }

    const key = entry.created_at.slice(5, 10);
    const bucket = trendMap.get(key);

    if (bucket) {
      bucket.count += 1;
    }
  });

  const categoryCounter = new Map<string, number>();
  (categoryRes.data ?? []).forEach((entry) => {
    const key = (entry.category ?? "uncategorized").replaceAll("_", " ");
    categoryCounter.set(key, (categoryCounter.get(key) ?? 0) + 1);
  });

  const portfolioByCategory = Array.from(categoryCounter.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const totalViews = (portfolioViewsRes.data ?? []).reduce(
    (sum, row) => sum + (row.views_count ?? 0),
    0
  );

  return (
    <DashboardClient
      metrics={{
        portfolioCount: portfolioCountRes.count ?? 0,
        totalViews,
        inquiriesThisWeek: inquiriesThisWeekRes.count ?? 0,
        publishedPosts: blogCountRes.count ?? 0,
        socialCount: socialCountRes.count ?? 0,
      }}
      inquiryTrend={inquiryTrend}
      portfolioByCategory={portfolioByCategory}
      recentInquiries={(recentInquiriesRes.data ?? []) as ContactInquiry[]}
    />
  );
}
