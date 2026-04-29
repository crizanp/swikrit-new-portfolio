import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SocialPost } from "@/lib/types";

interface SocialGridSectionProps {
  posts: SocialPost[];
}

export function SocialGridSection({ posts }: SocialGridSectionProps) {
  return (
    <section className="container space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold sm:text-4xl">Social Highlights</h2>
        <p className="max-w-2xl text-muted-foreground">
          Featured platform posts and behind-the-scenes snapshots.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="border-border/80 bg-card/70">
            <CardHeader>
              <Badge variant="outline" className="w-fit capitalize">
                {post.platform}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {post.caption ?? "No caption available."}
              </p>
              <Link
                href={post.post_url ?? "#"}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand"
                target="_blank"
                rel="noreferrer"
              >
                Open Post
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
