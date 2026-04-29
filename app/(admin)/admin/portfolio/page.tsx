import { DataTable } from "@/components/admin/data-table";
import { getPortfolioItems } from "@/lib/data";

export const metadata = {
  title: "Admin Portfolio",
};

export default async function AdminPortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Portfolio Items</h2>
        <p className="text-sm text-muted-foreground">
          Manage project cards, links, and featured visibility.
        </p>
      </div>

      <DataTable
        data={items}
        columns={[
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          { key: "client", header: "Client" },
          {
            key: "is_featured",
            header: "Featured",
            render: (row) => ((row.is_featured as boolean) ? "Yes" : "No"),
          },
          {
            key: "views_count",
            header: "Views",
            render: (row) =>
              typeof row.views_count === "number"
                ? row.views_count.toLocaleString()
                : "0",
          },
        ]}
      />
    </div>
  );
}
