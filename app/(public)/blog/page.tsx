import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const posts = await getBlogPosts(true);

  return (
    <div className="space-y-10 pt-12">
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Blog</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Insights and Process Notes</h1>
        <p className="max-w-2xl text-muted-foreground">
          Editorial strategy, motion workflow tips, and behind-the-scenes lessons from
          active client projects.
        </p>
      </section>

      <section className="container grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="border-border/80 bg-card/75">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(post.tags ?? []).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <CardDescription>{post.excerpt ?? "No excerpt available."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {formatDate(post.published_at ?? post.created_at)}
              </p>
              <Link
                href={`/blog#${post.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand"
              >
                Read Story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
