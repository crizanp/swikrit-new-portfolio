import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SocialPost } from "@/lib/types";

interface SocialFeedProps {
  posts: SocialPost[];
  social?: {
    instagram_url?: string;
    tiktok_url?: string;
    linkedin_url?: string;
  };
}

const platformConfig = {
  instagram: {
    label: "Instagram",
    buttonClass: "bg-[#E4405F] text-white hover:bg-[#E4405F]/90",
  },
  tiktok: {
    label: "TikTok",
    buttonClass: "bg-black text-white hover:bg-black/90",
  },
  linkedin: {
    label: "LinkedIn",
    buttonClass: "bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90",
  },
} as const;

const defaultFollowUrlByPlatform = {
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  linkedin: "https://linkedin.com",
} as const;

function normalizePlatform(value: string) {
  return value.trim().toLowerCase();
}

export function SocialFeed({ posts, social }: SocialFeedProps) {
  const followUrlByPlatform = {
    instagram: social?.instagram_url ?? defaultFollowUrlByPlatform.instagram,
    tiktok: social?.tiktok_url ?? defaultFollowUrlByPlatform.tiktok,
    linkedin: social?.linkedin_url ?? defaultFollowUrlByPlatform.linkedin,
  };

  const columns = (Object.keys(platformConfig) as Array<keyof typeof platformConfig>).map(
    (platform) => {
      const items = posts.filter((post) => normalizePlatform(post.platform) === platform).slice(0, 3);
      return {
        platform,
        items,
        followUrl: followUrlByPlatform[platform],
      };
    }
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.12em] text-brand">Social Feed</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Latest from Instagram, TikTok, and LinkedIn</h2>
          <p className="text-sm text-muted-foreground">
            Posts daily on Instagram, TikTok & LinkedIn
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map(({ platform, items, followUrl }) => {
          const config = platformConfig[platform];

          return (
            <div key={platform} className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{config.label}</h3>
                <Badge variant="outline">{items.length} posts</Badge>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts available yet.</p>
                ) : (
                  items.map((post) => (
                    <article
                      key={post.id}
                      className="overflow-hidden rounded-xl border border-border/80 bg-background/70"
                    >
                      {platform !== "linkedin" && post.embed_code ? (
                        <div
                          className="aspect-[4/3] overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: post.embed_code }}
                        />
                      ) : (
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-brand/20 via-background to-background">
                          {post.thumbnail_url ? (
                            <Image
                              src={post.thumbnail_url}
                              alt={post.caption ?? `${config.label} post`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 33vw"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                      )}
                      <div className="space-y-2 p-3">
                        <Badge variant="outline">{config.label}</Badge>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {post.caption ?? "Latest post update."}
                        </p>
                        <Link
                          href={post.post_url ?? followUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1.5 text-sm font-medium text-brand"
                        >
                          View on {config.label}
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <Button asChild className={config.buttonClass}>
                <Link href={followUrl} target="_blank" rel="noreferrer">
                  Follow on {config.label}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
