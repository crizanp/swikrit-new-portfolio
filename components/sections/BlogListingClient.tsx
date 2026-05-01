"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronUp, MoreHorizontal, Search } from "lucide-react";
import { CollapsibleTagList } from "@/components/ui/collapsible-tag-list";
import { Input } from "@/components/ui/input";
import type { BlogPost } from "@/lib/types";

interface BlogListingClientProps {
  posts: BlogPost[];
}

const MAX_VISIBLE_FILTER_TAGS = 8;

export function BlogListingClient({ posts }: BlogListingClientProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [showAllTagFilters, setShowAllTagFilters] = useState(false);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    posts.forEach((post) => {
      (post.tags ?? []).forEach((tag) => allTags.add(tag));
    });

    return ["all", ...Array.from(allTags).sort((a, b) => a.localeCompare(b))];
  }, [posts]);

  const collapsedFilterTags = useMemo(() => {
    const firstBatch = tags.slice(0, MAX_VISIBLE_FILTER_TAGS);

    if (
      tags.length <= MAX_VISIBLE_FILTER_TAGS ||
      activeTag === "all" ||
      firstBatch.includes(activeTag)
    ) {
      return firstBatch;
    }

    const next = [...firstBatch];

    if (next.length < MAX_VISIBLE_FILTER_TAGS) {
      next.push(activeTag);
    } else {
      next[next.length - 1] = activeTag;
    }

    return Array.from(new Set(next));
  }, [activeTag, tags]);

  const showFilterToggle = tags.length > MAX_VISIBLE_FILTER_TAGS;
  const visibleFilterTags = showAllTagFilters ? tags : collapsedFilterTags;
  const hiddenTagCount = Math.max(0, tags.length - collapsedFilterTags.length);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const tagMatch = activeTag === "all" ? true : (post.tags ?? []).includes(activeTag);

      if (!tagMatch) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [post.title, post.excerpt ?? "", ...(post.tags ?? [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [activeTag, posts, search]);

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="space-y-4 rounded-2xl border border-border/70 bg-card/65 p-4 lg:sticky lg:top-24 lg:h-fit">
        <div className="space-y-2">
          <label htmlFor="blog-search" className="text-sm text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="blog-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search articles"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-2">
            {visibleFilterTags.map((tag) => {
              const active = tag === activeTag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-border/80 bg-background/70 text-muted-foreground"
                  }`}
                >
                  {tag === "all" ? "All" : tag}
                </button>
              );
            })}

            {showFilterToggle ? (
              <button
                type="button"
                onClick={() => setShowAllTagFilters((current) => !current)}
                className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                aria-expanded={showAllTagFilters}
              >
                {showAllTagFilters ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <MoreHorizontal className="h-3.5 w-3.5" />
                )}
                {showAllTagFilters ? "Show fewer" : `+${hiddenTagCount} more`}
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => {
          const readTime = Math.max(
            2,
            Math.ceil((post.content?.split(/\s+/).length ?? 320) / 200)
          );

          return (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card/75">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-brand/20 via-background to-background">
                {post.cover_image ? (
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <CollapsibleTagList tags={post.tags} maxVisible={3} keyPrefix={`${post.id}-card`} />
                <h3 className="line-clamp-2 text-lg font-semibold">{post.title}</h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {post.excerpt ?? "No excerpt available."}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {/* <span>{formatDate(post.published_at ?? post.created_at)}</span> */}
                  <span>{readTime} min read</span>
                </div>
                <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-brand">
                  Read article
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
