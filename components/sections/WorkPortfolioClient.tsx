"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleTagList } from "@/components/ui/collapsible-tag-list";
import {
  resolvePortfolioEmbedUrl,
  resolvePortfolioThumbnailUrl,
} from "@/lib/portfolio-media";
import { gsap } from "@/lib/animations/gsap";
import type { PortfolioItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories = [
  { label: "All", value: "all" },
  { label: "Commercial", value: "commercial" },
  { label: "Music Video", value: "music_video" },
  { label: "Documentary", value: "documentary" },
  { label: "Social Media", value: "social_media" },
  { label: "Motion Graphics", value: "motion_graphics" },
] as const;

interface WorkPortfolioClientProps {
  items: PortfolioItem[];
  activeCategory: string;
}

function normalizeCategory(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toLowerCase().trim().replace(/\s+/g, "_");
}

function toDisplayCategory(value: string | null | undefined) {
  const category = normalizeCategory(value);
  if (!category) {
    return "Project";
  }

  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function WorkPortfolioClient({ items, activeCategory }: WorkPortfolioClientProps) {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const modalCardRef = useRef<HTMLDivElement | null>(null);

  const selectedCategory = normalizeCategory(activeCategory);

  const filteredItems = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") {
      return items;
    }

    return items.filter((item) => normalizeCategory(item.category) === selectedCategory);
  }, [items, selectedCategory]);

  useEffect(() => {
    if (!selected) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    const modalCard = modalCardRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    if (modalCard) {
      gsap.fromTo(
        modalCard,
        { scale: 0.92, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.26, ease: "power3.out" }
      );
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const embedUrl = selected ? resolvePortfolioEmbedUrl(selected) : null;

  return (
    <>
      <div className="flex flex-wrap gap-2 pb-5">
        {categories.map((category) => {
          const isActive =
            (selectedCategory || "all") === category.value ||
            (!selectedCategory && category.value === "all");

          return (
            <Link
              key={category.value}
              href={
                category.value === "all"
                  ? "/work"
                  : `/work?category=${encodeURIComponent(category.value)}`
              }
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                isActive
                  ? "border-brand bg-brand text-white"
                  : "border-border/70 bg-card/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
            </Link>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-10 text-center text-muted-foreground">
          No projects found for this category.
        </div>
      ) : (
        <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
          {filteredItems.map((item, index) => {
            const thumbnailUrl = resolvePortfolioThumbnailUrl(item);

            return (
              <article
                key={item.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-card/80"
              >
                {thumbnailUrl ? (
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="group relative block w-full text-left"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand/25 via-background to-background">
                      <Image
                        src={thumbnailUrl}
                        alt={item.title}
                        fill
                        priority={index < 2}
                        sizes="(max-width: 1280px) 100vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-lg">
                          <Play className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="absolute left-3 top-3">
                        <Badge variant="brand">{toDisplayCategory(item.category)}</Badge>
                      </div>
                    </div>
                  </button>
                ) : null}

                <div className="space-y-3 p-4">
                  {!thumbnailUrl ? (
                    <Badge variant="brand" className="w-fit">
                      {toDisplayCategory(item.category)}
                    </Badge>
                  ) : null}
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.client ?? "Independent project"}</p>
                  <CollapsibleTagList tags={item.tags} maxVisible={3} keyPrefix={`${item.id}-card`} />

                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                  >
                    Preview Project
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-[140] bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setSelected(null)}
          role="button"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSelected(null);
            }
          }}
        >
          <div
            ref={modalCardRef}
            className="mx-auto mt-6 max-w-4xl rounded-2xl border border-border/70 bg-background p-5 sm:p-7"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-xl font-semibold sm:text-2xl">{selected.title}</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-5">
              {embedUrl ? (
                <div className="aspect-video overflow-hidden rounded-xl border border-border/70 bg-black">
                  <iframe
                    src={embedUrl}
                    title={selected.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-card/60 p-8 text-center text-muted-foreground">
                  Video embed not available.
                </div>
              )}

              <p className="text-sm leading-relaxed text-muted-foreground">
                {selected.description ?? "No description provided for this project yet."}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Client: {selected.client ?? "N/A"}</Badge>
              </div>
              <CollapsibleTagList
                tags={selected.tags}
                maxVisible={5}
                keyPrefix={`modal-${selected.id}`}
                tagClassName="bg-background"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
