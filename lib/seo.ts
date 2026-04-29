import { siteConfig, socialLinks } from "@/lib/constants";

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.siteUrl}${item.path}`,
    })),
  };
}

export function createPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Swikrit Pokhrel",
    url: siteConfig.siteUrl,
    jobTitle: "Video Editor and Motion Graphics Designer",
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressLocality: "Nepal",
    },
    description:
      "Professional video editor and motion graphics designer with 3+ years of experience across commercial, social, and cinematic post-production.",
    sameAs: socialLinks.map((item) => item.href),
    knowsAbout: [
      "Video Editing",
      "Motion Graphics",
      "After Effects",
      "Premiere Pro",
      "DaVinci Resolve",
      "Color Grading",
    ],
  };
}

export function buildOgImageUrl(title: string, image?: string | null) {
  const url = new URL("/opengraph-image", siteConfig.siteUrl);
  url.searchParams.set("title", title);

  if (image) {
    url.searchParams.set("image", image);
  }

  return url.toString();
}

export function parseCompactNumber(input: string | null | undefined) {
  if (!input) {
    return 0;
  }

  const cleaned = input.replace(/,/g, "").trim().toUpperCase();
  const match = cleaned.match(/^(\d+(?:\.\d+)?)([KMB])?\+?$/);

  if (!match) {
    const value = Number.parseFloat(cleaned);
    return Number.isFinite(value) ? value : 0;
  }

  const base = Number.parseFloat(match[1] ?? "0");
  const suffix = match[2] ?? "";

  if (suffix === "K") {
    return Math.round(base * 1_000);
  }

  if (suffix === "M") {
    return Math.round(base * 1_000_000);
  }

  if (suffix === "B") {
    return Math.round(base * 1_000_000_000);
  }

  return Math.round(base);
}
