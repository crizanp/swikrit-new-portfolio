"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { PortfolioItem } from "@/lib/types";
import { FileUploader } from "@/components/admin/FileUploader";
import {
  resolvePortfolioSourceUrl,
  resolvePortfolioThumbnailUrl,
} from "@/lib/portfolio-media";

type PortfolioFormValues = {
  title: string;
  description: string;
  category: string;
  client: string;
  tags: string[];
  thumbnail_url: string;
  video_url: string;
  video_embed: string;
  is_featured: boolean;
  display_order: number;
};

type PortfolioFormProps = {
  initialValue?: Partial<PortfolioItem>;
  onCancel: () => void;
  onSubmit: (values: PortfolioFormValues) => Promise<void>;
};

const categoryOptions = [
  "commercial",
  "music_video",
  "documentary",
  "social_media",
  "motion_graphics",
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "tiktok",
];

function normalizeTags(tags: string[] | null | undefined) {
  if (!tags?.length) {
    return "";
  }

  return tags.join(", ");
}

export function PortfolioForm({ initialValue, onCancel, onSubmit }: PortfolioFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [category, setCategory] = useState(initialValue?.category ?? "commercial");
  const [client, setClient] = useState(initialValue?.client ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialValue?.thumbnail_url ?? "");
  const [videoUrl, setVideoUrl] = useState(initialValue?.video_url ?? "");
  const [videoEmbed, setVideoEmbed] = useState(initialValue?.video_embed ?? "");
  const [tagsInput, setTagsInput] = useState(normalizeTags(initialValue?.tags));
  const [isFeatured, setIsFeatured] = useState(Boolean(initialValue?.is_featured));
  const [displayOrder, setDisplayOrder] = useState(initialValue?.display_order ?? 0);
  const [remoteThumbnailUrl, setRemoteThumbnailUrl] = useState<string | null>(null);
  const [isResolvingRemoteThumbnail, setIsResolvingRemoteThumbnail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialValue?.title ?? "");
    setDescription(initialValue?.description ?? "");
    setCategory(initialValue?.category ?? "commercial");
    setClient(initialValue?.client ?? "");
    setThumbnailUrl(initialValue?.thumbnail_url ?? "");
    setVideoUrl(initialValue?.video_url ?? "");
    setVideoEmbed(initialValue?.video_embed ?? "");
    setTagsInput(normalizeTags(initialValue?.tags));
    setIsFeatured(Boolean(initialValue?.is_featured));
    setDisplayOrder(initialValue?.display_order ?? 0);
    setRemoteThumbnailUrl(null);
    setIsResolvingRemoteThumbnail(false);
    setError(null);
  }, [initialValue]);

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [tagsInput]
  );

  const generatedThumbnail = useMemo(
    () =>
      resolvePortfolioThumbnailUrl({
        thumbnail_url: null,
        video_url: videoUrl,
        video_embed: videoEmbed,
      }),
    [videoUrl, videoEmbed]
  );

  const sourceUrl = useMemo(
    () =>
      resolvePortfolioSourceUrl({
        thumbnail_url: null,
        video_url: videoUrl,
        video_embed: videoEmbed,
      }),
    [videoUrl, videoEmbed]
  );

  useEffect(() => {
    const customThumbnail = thumbnailUrl.trim();

    if (customThumbnail || generatedThumbnail || !sourceUrl) {
      setRemoteThumbnailUrl(null);
      setIsResolvingRemoteThumbnail(false);
      return;
    }

    const controller = new AbortController();
    setIsResolvingRemoteThumbnail(true);
    setRemoteThumbnailUrl(null);

    void fetch(`/api/portfolio/thumbnail?url=${encodeURIComponent(sourceUrl)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { data?: { thumbnail_url?: string | null }; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to resolve thumbnail preview.");
        }

        return payload?.data?.thumbnail_url ?? null;
      })
      .then((nextThumbnail) => {
        if (!controller.signal.aborted) {
          setRemoteThumbnailUrl(nextThumbnail);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRemoteThumbnailUrl(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsResolvingRemoteThumbnail(false);
        }
      });

    return () => controller.abort();
  }, [thumbnailUrl, generatedThumbnail, sourceUrl]);

  const thumbnailPreview = useMemo(() => {
    const customThumbnail = thumbnailUrl.trim();

    if (customThumbnail) {
      return {
        url: customThumbnail,
        source: "custom" as const,
      };
    }

    if (!generatedThumbnail) {
      if (!remoteThumbnailUrl) {
        return null;
      }

      return {
        url: remoteThumbnailUrl,
        source: "metadata" as const,
      };
    }

    return {
      url: generatedThumbnail,
      source: "auto" as const,
    };
  }, [thumbnailUrl, generatedThumbnail, remoteThumbnailUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        client: client.trim(),
        tags: parsedTags,
        thumbnail_url: thumbnailUrl.trim() || remoteThumbnailUrl || "",
        video_url: videoUrl,
        video_embed: videoEmbed,
        is_featured: isFeatured,
        display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save portfolio item.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Client</span>
          <input
            value={client}
            onChange={(event) => setClient(event.target.value)}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[120px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Display Order</span>
          <input
            type="number"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(Number(event.target.value))}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Tags (comma separated)</span>
        <input
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
          placeholder="ad campaign, cinematic, short-form"
        />
      </label>

      {parsedTags.length ? (
        <div className="flex flex-wrap gap-2">
          {parsedTags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#e8c547]/20 px-2 py-1 text-xs text-[#e8c547]">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Video URL</span>
          <input
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            placeholder="https://..."
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Video Embed Code / URL</span>
          <input
            value={videoEmbed}
            onChange={(event) => setVideoEmbed(event.target.value)}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            placeholder="YouTube/Vimeo embed"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FileUploader
          label="Thumbnail Upload"
          bucket="portfolio-images"
          value={thumbnailUrl}
          accept="image/*"
          onChange={setThumbnailUrl}
        />

        <FileUploader
          label="Video Upload"
          bucket="portfolio-videos"
          value={videoUrl}
          accept="video/*"
          onChange={setVideoUrl}
        />
      </div>

      <div className="space-y-2 rounded-md border border-white/15 bg-zinc-950/70 p-3">
        <p className="text-xs uppercase tracking-[0.1em] text-zinc-400">Thumbnail Preview</p>

        {thumbnailPreview ? (
          <>
            <div className="relative h-44 w-full overflow-hidden rounded-md border border-white/15 bg-zinc-900">
              <Image
                src={thumbnailPreview.url}
                alt="Portfolio thumbnail preview"
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
            </div>

            <p className="text-xs text-zinc-400">
              {thumbnailPreview.source === "custom"
                ? "Using custom thumbnail URL."
                : thumbnailPreview.source === "metadata"
                  ? "Auto-generated from social link metadata."
                  : "Auto-generated from current video URL/embed."}
            </p>
          </>
        ) : (
          <div className="space-y-1">
            {isResolvingRemoteThumbnail ? (
              <p className="text-sm text-zinc-500">
                Resolving thumbnail from the pasted link...
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                Paste YouTube, Vimeo, Dailymotion, Instagram, TikTok, Facebook, or LinkedIn URL to auto-preview.
              </p>
            )}
          </div>
        )}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(event) => setIsFeatured(event.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-black"
        />
        Feature this project
      </label>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-white/20 px-3 py-2 text-sm text-zinc-300"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Save Portfolio Item"}
        </button>
      </div>
    </form>
  );
}

export type { PortfolioFormValues };
