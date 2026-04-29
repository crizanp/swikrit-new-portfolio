import { BlogManager } from "@/components/admin/BlogManager";
import { getBlogPosts } from "@/lib/data";

export const metadata = {
  title: "Admin Blog",
};

export default async function AdminBlogPage() {
  const posts = await getBlogPosts(false);

  return <BlogManager initialPosts={posts} />;
}
