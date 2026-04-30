import Link from "next/link";
import { getPublicSiteSettings } from "@/lib/data";

export async function Footer() {
  const { profile, social } = await getPublicSiteSettings();
  const socialLinks = [
    { label: "Instagram", href: social.instagram_url },
    { label: "TikTok", href: social.tiktok_url },
    { label: "LinkedIn", href: social.linkedin_url },
    { label: "YouTube", href: social.youtube_url },
  ];

  return (
    <footer className="border-t border-border/70 bg-surface/60">
      <div className="container py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-heading text-xl font-semibold uppercase">{profile.display_name}</p>
            <p className="max-w-lg text-sm text-muted-foreground">
              {profile.bio}
            </p>
            <p className="text-sm text-muted-foreground">{profile.location_label}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-border/70 pt-5 text-xs text-muted-foreground">
          <p>
            Copyright {new Date().getFullYear()} {profile.display_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
