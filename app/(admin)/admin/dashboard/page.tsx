import { DataTable } from "@/components/admin/data-table";
import { StatsCard } from "@/components/admin/stats-card";
import { getDashboardSummary, getInquiries, getSiteStats } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const [summary, inquiries, stats] = await Promise.all([
    getDashboardSummary(),
    getInquiries(6),
    getSiteStats(),
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Portfolio Items" value={summary.portfolioCount} />
        <StatsCard label="Services" value={summary.serviceCount} />
        <StatsCard label="Blog Posts" value={summary.blogCount} />
        <StatsCard label="Inquiries" value={summary.inquiryCount} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Live Site Stats</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.id}
              label={stat.display_label ?? stat.stat_key}
              value={stat.stat_value}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Inquiries</h2>
        <DataTable
          data={inquiries}
          columns={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "project_type", header: "Project" },
            {
              key: "created_at",
              header: "Received",
              render: (row) => formatDate((row.created_at as string) ?? null),
            },
            { key: "status", header: "Status" },
          ]}
          emptyMessage="No inquiries yet."
        />
      </section>
    </div>
  );
}
