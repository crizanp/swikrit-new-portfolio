import { SocialPostsManager } from "@/components/admin/SocialPostsManager";
import { getSocialPosts } from "@/lib/data";

export const metadata = {
  title: "Admin Social",
};

export default async function AdminSocialPage() {
  const posts = await getSocialPosts(100);

  return <SocialPostsManager initialPosts={posts} />;
}
