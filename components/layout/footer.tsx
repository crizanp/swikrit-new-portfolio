import Link from "next/link";
import { siteConfig, socialLinks } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface/60">
      <div className="container py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-heading text-xl font-semibold">SWIKRIT POKHREL</p>
            <p className="max-w-lg text-sm text-muted-foreground">
              Professional video editor and motion graphics designer crafting fast,
              cinematic, and conversion-focused content.
            </p>
            <p className="text-sm text-muted-foreground">{siteConfig.location}</p>
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
            Copyright {new Date().getFullYear()} Swikrit Pokhrel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
