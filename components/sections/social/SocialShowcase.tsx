"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Flame,
  Music2,
  Sparkles,
} from "lucide-react";
import { resolvePortfolioThumbnailUrl } from "@/lib/portfolio-media";
import type { SocialStatsSettings } from "@/lib/site-settings";
import type { SocialPost } from "@/lib/types";
import { cn } from "@/lib/utils";

type Platform = "instagram" | "tiktok" | "linkedin";
type PlatformFilter = "all" | Platform;

const platformMeta = {
  instagram: {
    label: "Instagram",
    icon: <Camera className="h-4 w-4" />,
    followLabel: "Follow on Instagram",
    cardAccent: "from-[#E4405F]/35 via-[#FF7A59]/10 to-card",
    buttonClass: "bg-[#E4405F] text-white hover:bg-[#E4405F]/90",
  },
  tiktok: {
    label: "TikTok",
    icon: <Music2 className="h-4 w-4" />,
    followLabel: "Follow on TikTok",
    cardAccent: "from-[#25F4EE]/25 via-[#FE2C55]/15 to-card",
    buttonClass: "bg-[#111111] text-white hover:bg-black/90",
  },
  linkedin: {
    label: "LinkedIn",
    icon: <BriefcaseBusiness className="h-4 w-4" />,
    followLabel: "Follow on LinkedIn",
    cardAccent: "from-[#0A66C2]/35 via-[#0A66C2]/10 to-card",
    buttonClass: "bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90",
  },
} as const;

function normalizePlatform(value: string): Platform | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === "instagram" || normalized === "tiktok" || normalized === "linkedin") {
    return normalized;
  }

  return null;
}

interface SocialShowcaseProps {
  posts: SocialPost[];
  social: SocialStatsSettings;
}

export function SocialShowcase({ posts, social }: SocialShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState<PlatformFilter>("all");

  const followLinks = {
    instagram: social.instagram_url,
    tiktok: social.tiktok_url,
    linkedin: social.linkedin_url,
  };

  const summary = useMemo(() => {
    const mapped = posts
      .map((post) => ({ ...post, normalizedPlatform: normalizePlatform(post.platform) }))
      .filter((post) => post.normalizedPlatform !== null);

    const totalLikes = mapped.reduce((sum, post) => sum + (post.likes_count ?? 0), 0);
    const activePlatforms = new Set(mapped.map((post) => post.normalizedPlatform)).size;

    return {
      mapped,
      totalLikes,
      activePlatforms,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "all") {
      return summary.mapped;
    }

    return summary.mapped.filter((post) => post.normalizedPlatform === activeFilter);
  }, [activeFilter, summary.mapped]);

  return (
    <div className="space-y-8">
      

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "instagram", "tiktok", "linkedin"] as PlatformFilter[]).map((filter) => {
            const isActive = activeFilter === filter;
            const label = filter === "all" ? "All Platforms" : platformMeta[filter].label;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                  isActive
                    ? "border-brand/50 bg-brand/15 text-brand"
                    : "border-border/80 bg-card/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {filter !== "all" ? platformMeta[filter].icon : <Sparkles className="h-4 w-4" />}
                {label}
              </button>
            );
          })}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/70 p-8 text-center text-muted-foreground">
            No posts available for this platform yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredPosts.map((post, index) => {
              const platform = post.normalizedPlatform;
              if (!platform) {
                return null;
              }

              const meta = platformMeta[platform];
              const fallbackHref = followLinks[platform];
              const postHref = post.post_url || fallbackHref || "";
              const thumbnailUrl = resolvePortfolioThumbnailUrl({
                thumbnail_url: post.thumbnail_url,
                video_url: post.post_url,
                video_embed: post.embed_code,
              });

              return (
                <article
                  key={post.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/75 transition duration-300 hover:-translate-y-1 hover:border-brand/50"
                >
                  <div className={cn("relative overflow-hidden border-b border-border/70 bg-gradient-to-br", meta.cardAccent)}>
                    <div className="relative aspect-[4/3] min-h-[220px]">
                      {thumbnailUrl ? (
                        <Image
                          src={thumbnailUrl}
                          alt={post.caption ?? `${meta.label} post`}
                          fill
                          priority={index < 2}
                          loading={index < 2 ? "eager" : "lazy"}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-background to-background" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/65 px-2.5 py-1 text-xs">
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Flame className="h-3.5 w-3.5" />
                        {(post.likes_count ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {post.caption ?? "Fresh post update from the social pipeline."}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      {postHref ? (
                        <Link
                          href={postHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand"
                        >
                          Open Post
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Post link pending</span>
                      )}

                      {fallbackHref ? (
                        <Link
                          href={fallbackHref}
                          target="_blank"
                          rel="noreferrer"
                          className={cn("rounded-full px-3 py-1.5 text-xs font-medium", meta.buttonClass)}
                        >
                          {meta.followLabel}
                        </Link>
                      ) : (
                        <span className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground">
                          Profile pending
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
