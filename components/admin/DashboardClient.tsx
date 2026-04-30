"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ExternalLink,
  Mail,
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ContactInquiry } from "@/lib/types";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatDate } from "@/lib/utils";

type DashboardClientProps = {
  metrics: {
    portfolioCount: number;
    totalViews: number;
    inquiriesThisWeek: number;
    publishedPosts: number;
    socialCount: number;
  };
  inquiryTrend: Array<{ date: string; count: number }>;
  portfolioByCategory: Array<{ name: string; value: number }>;
  recentInquiries: ContactInquiry[];
};

const pieColors = ["#e8c547", "#d6a41f", "#b98714", "#9a6e0f", "#7a5609", "#614306"];

function statusClass(status: string | null | undefined) {
  const normalized = (status ?? "new").toLowerCase();

  if (normalized === "new") {
    return "bg-amber-200/15 text-amber-200";
  }

  if (normalized === "read") {
    return "bg-sky-200/15 text-sky-200";
  }

  if (normalized === "replied") {
    return "bg-emerald-200/15 text-emerald-200";
  }

  return "bg-zinc-200/15 text-zinc-200";
}

export function DashboardClient({
  metrics,
  inquiryTrend,
  portfolioByCategory,
  recentInquiries,
}: DashboardClientProps) {
  const [items, setItems] = useState(recentInquiries);
  const [isMutating, setIsMutating] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const totalTrendCount = useMemo(
    () => inquiryTrend.reduce((sum, bucket) => sum + bucket.count, 0),
    [inquiryTrend]
  );

  async function updateInquiryStatus(id: string, status: "read" | "archived") {
    setIsMutating(id);
    setRequestError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Failed to update inquiry.");
      }

      setItems((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, status } : entry))
      );
      setNotice(`Inquiry marked as ${status}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update inquiry.";
      setRequestError(message);
    } finally {
      setIsMutating(null);
    }
  }

  return (
    <div className="space-y-8">
      {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
      {requestError ? <p className="text-sm text-rose-300">{requestError}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Portfolio Items" value={metrics.portfolioCount} helperText="Total projects" />
        <StatsCard title="Total Views" value={metrics.totalViews.toLocaleString()} helperText="All portfolio views" />
        <StatsCard
          title="New Inquiries (7d)"
          value={metrics.inquiriesThisWeek}
          helperText="Status: new"
          trend={{ direction: metrics.inquiriesThisWeek > 0 ? "up" : "neutral", value: `${metrics.inquiriesThisWeek} this week` }}
        />
        <StatsCard title="Published Blogs" value={metrics.publishedPosts} helperText="Visible on site" />
        <StatsCard title="Social Posts" value={metrics.socialCount} helperText="Across all platforms" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-xl border border-white/10 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Inquiries Timeline</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">Last 30 Days</h2>
            </div>
            <p className="text-xs text-zinc-400">Total: {totalTrendCount}</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inquiryTrend}>
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0f0f11",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#e8c547"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-[#e8c547]" />
            <h2 className="text-lg font-semibold text-zinc-100">Portfolio by Category</h2>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {portfolioByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f0f11",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    color: "#fff",
                  }}
                />
                <Legend wrapperStyle={{ color: "#d4d4d8", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-white/10 bg-zinc-950 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-100">Recent Inquiries</h2>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1 text-sm text-[#e8c547] hover:underline"
          >
            View all
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-400">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Received</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((inquiry) => (
                <tr key={inquiry.id} className="text-sm text-zinc-200">
                  <td className="px-3 py-3">{inquiry.name}</td>
                  <td className="px-3 py-3 text-zinc-400">{inquiry.email}</td>
                  <td className="px-3 py-3 text-zinc-400">{formatDate(inquiry.created_at)}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${statusClass(inquiry.status)}`}>
                      {inquiry.status ?? "new"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void updateInquiryStatus(inquiry.id, "read")}
                        disabled={isMutating === inquiry.id}
                        className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 disabled:opacity-60"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Mark read
                      </button>

                      <a
                        href={`mailto:${inquiry.email}?subject=Re:${encodeURIComponent(inquiry.subject ?? "Project inquiry")}`}
                        className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Reply
                      </a>

                      <button
                        type="button"
                        onClick={() => void updateInquiryStatus(inquiry.id, "archived")}
                        disabled={isMutating === inquiry.id}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-200 disabled:opacity-60"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!items.length ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-zinc-400">
                    No inquiries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
