"use client";

import { useMemo, useState } from "react";
import { ChevronUp, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleTagListProps = {
  tags: string[] | null | undefined;
  maxVisible?: number;
  className?: string;
  tagClassName?: string;
  moreButtonClassName?: string;
  keyPrefix?: string;
};

function normalizeTags(tags: string[] | null | undefined) {
  return (tags ?? []).map((tag) => tag.trim()).filter(Boolean);
}

export function CollapsibleTagList({
  tags,
  maxVisible = 3,
  className,
  tagClassName,
  moreButtonClassName,
  keyPrefix = "tag",
}: CollapsibleTagListProps) {
  const normalizedTags = useMemo(() => normalizeTags(tags), [tags]);
  const [expanded, setExpanded] = useState(false);

  if (!normalizedTags.length) {
    return null;
  }

  const canCollapse = normalizedTags.length > maxVisible;
  const visibleTags = expanded || !canCollapse ? normalizedTags : normalizedTags.slice(0, maxVisible);
  const hiddenCount = Math.max(0, normalizedTags.length - visibleTags.length);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visibleTags.map((tag, index) => (
        <span
          key={`${keyPrefix}-${tag}-${index}`}
          className={cn(
            "rounded-full border border-border/80 px-2 py-1 text-xs text-muted-foreground",
            tagClassName
          )}
        >
          {tag}
        </span>
      ))}

      {canCollapse ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border/80 px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground",
            moreButtonClassName
          )}
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
          {expanded ? "Show less" : `+${hiddenCount} more`}
        </button>
      ) : null}
    </div>
  );
}
