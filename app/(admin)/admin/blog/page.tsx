import { DataTable } from "@/components/admin/data-table";
import { getBlogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Blog",
};

export default async function AdminBlogPage() {
  const posts = await getBlogPosts(false);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Blog Posts</h2>
        <p className="text-sm text-muted-foreground">
          Draft, publish, and maintain educational content.
        </p>
      </div>

      <DataTable
        data={posts}
        columns={[
          { key: "title", header: "Title" },
          { key: "slug", header: "Slug" },
          {
            key: "is_published",
            header: "Published",
            render: (row) => ((row.is_published as boolean) ? "Yes" : "No"),
          },
          {
            key: "published_at",
            header: "Published At",
            render: (row) => formatDate((row.published_at as string) ?? row.created_at),
          },
        ]}
      />
    </div>
  );
}
