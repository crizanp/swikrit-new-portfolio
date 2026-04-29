import { DataTable } from "@/components/admin/data-table";
import { getSocialPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Social",
};

export default async function AdminSocialPage() {
  const posts = await getSocialPosts(100);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Social Posts</h2>
        <p className="text-sm text-muted-foreground">
          Curate featured posts across Instagram, TikTok, and LinkedIn.
        </p>
      </div>

      <DataTable
        data={posts}
        columns={[
          { key: "platform", header: "Platform" },
          { key: "caption", header: "Caption" },
          {
            key: "likes_count",
            header: "Likes",
            render: (row) =>
              typeof row.likes_count === "number"
                ? row.likes_count.toLocaleString()
                : "0",
          },
          {
            key: "is_featured",
            header: "Featured",
            render: (row) => ((row.is_featured as boolean) ? "Yes" : "No"),
          },
          {
            key: "posted_at",
            header: "Posted",
            render: (row) => formatDate((row.posted_at as string) ?? null),
          },
        ]}
      />
    </div>
  );
}
