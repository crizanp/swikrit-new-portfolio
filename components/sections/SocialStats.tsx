"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { animate } from "animejs";
import { BriefcaseBusiness, Camera, Music2 } from "lucide-react";
import { parseCompactNumber } from "@/lib/seo";

interface SocialStatsProps {
  stats: Record<string, string>;
  social?: {
    instagram_handle?: string;
    instagram_followers?: string;
    instagram_url?: string;
    tiktok_handle?: string;
    tiktok_followers?: string;
    tiktok_url?: string;
    linkedin_handle?: string;
    linkedin_followers?: string;
    linkedin_url?: string;
    total_views_label?: string;
  };
}

function resolveViewsLabel(stats: Record<string, string>, social?: SocialStatsProps["social"]) {
  return social?.total_views_label ?? stats.views_generated ?? "12M+";
}

export function SocialStats({ stats, social }: SocialStatsProps) {
  const targetViewsLabel = resolveViewsLabel(stats, social);
  const targetViews = useMemo(() => parseCompactNumber(targetViewsLabel), [targetViewsLabel]);
  const [displayViews, setDisplayViews] = useState(0);

  useEffect(() => {
    const state = { value: 0 };

    const animation = animate(state, {
      value: targetViews,
      duration: 1300,
      ease: "out(3)",
      onUpdate: () => {
        setDisplayViews(Math.round(state.value));
      },
      onComplete: () => {
        setDisplayViews(targetViews);
      },
    });

    return () => {
      animation.pause();
    };
  }, [targetViews]);

  const socialRows = [
    {
      label: "Instagram",
      href: social?.instagram_url ?? "https://instagram.com",
      handle: social?.instagram_handle ?? "@swikritpokhrel",
      followers: social?.instagram_followers ?? "24K+",
      icon: <Camera className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "TikTok",
      href: social?.tiktok_url ?? "https://tiktok.com",
      handle: social?.tiktok_handle ?? "@swikritpokhrel",
      followers: social?.tiktok_followers ?? "18K+",
      icon: <Music2 className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "LinkedIn",
      href: social?.linkedin_url ?? "https://linkedin.com",
      handle: social?.linkedin_handle ?? "swikrit-pokhrel",
      followers: social?.linkedin_followers ?? "6K+",
      icon: <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.12em] text-brand">Social Presence</p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Posts daily on Instagram, TikTok and LinkedIn</h2>
        </div>
        <p className="text-sm text-muted-foreground">Audience growth and reach snapshot</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {socialRows.map((row) => (
          <Link
            key={row.label}
            href={row.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-border/70 bg-background/60 p-4 transition hover:border-brand/50"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {row.icon}
              {row.label}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{row.handle}</p>
            <p className="mt-1 text-lg font-semibold text-brand">{row.followers}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border/70 bg-background/60 p-4">
        <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Total Views</p>
        <p className="mt-1 font-heading text-4xl font-bold text-brand">
          {displayViews.toLocaleString()}+
        </p>
      </div>
    </section>
  );
}
