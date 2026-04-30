import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { CollapsibleTagList } from "@/components/ui/collapsible-tag-list";
import { siteConfig } from "@/lib/constants";
import { getPortfolioItemById } from "@/lib/data";
import {
  resolvePortfolioEmbedUrl,
  resolvePortfolioThumbnailUrl,
} from "@/lib/portfolio-media";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";

interface WorkItemPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 3600;

export async function generateMetadata({ params }: WorkItemPageProps): Promise<Metadata> {
  const item = await getPortfolioItemById(params.id);

  if (!item) {
    return {
      title: "Project Not Found",
    };
  }

  const title = `${item.title} | Swikrit Pokhrel`;
  const description = item.description ?? "Portfolio project by Swikrit Pokhrel.";
  const canonicalPath = `/work/${item.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.siteUrl}${canonicalPath}`,
      images: [buildOgImageUrl(item.title, item.thumbnail_url)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [buildOgImageUrl(item.title, item.thumbnail_url)],
    },
  };
}

export default async function WorkItemPage({ params }: WorkItemPageProps) {
  const item = await getPortfolioItemById(params.id);

  if (!item) {
    notFound();
  }

  const embedUrl = resolvePortfolioEmbedUrl(item);
  const thumbnailUrl = resolvePortfolioThumbnailUrl(item);
  const breadcrumbSchema = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: item.title, path: `/work/${item.id}` },
  ]);

  return (
    <article className="space-y-8 pt-12">
      <JsonLd data={breadcrumbSchema} />

      <header className="container space-y-3">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Project</p>
        <h1 className="text-4xl font-bold sm:text-5xl">{item.title}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {item.description ?? "Portfolio project by Swikrit Pokhrel."}
        </p>
      </header>

      <section className="container space-y-4">
        {embedUrl ? (
          <div className="aspect-video overflow-hidden rounded-2xl border border-border/70 bg-black">
            <iframe
              src={embedUrl}
              title={item.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : thumbnailUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/70">
            <Image
              src={thumbnailUrl}
              alt={`${item.title} thumbnail`}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Client: {item.client ?? "Independent"}</p>
          <CollapsibleTagList
            tags={item.tags}
            maxVisible={5}
            keyPrefix={`${item.id}-detail`}
            tagClassName="border-border/70"
          />
        </div>

        <Link href="/work" className="inline-flex text-sm font-medium text-brand">
          Back to work
        </Link>
      </section>
    </article>
  );
}
