"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { SocialPost } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { FileUploader } from "@/components/admin/FileUploader";
import {
  resolvePortfolioSourceUrl,
  resolvePortfolioThumbnailUrl,
} from "@/lib/portfolio-media";
import { formatDate } from "@/lib/utils";

type SocialPostsManagerProps = {
  initialPosts: SocialPost[];
};

type SocialDraft = {
  platform: string;
  post_url: string;
  embed_code: string;
  caption: string;
  thumbnail_url: string;
  likes_count: number;
  is_featured: boolean;
  posted_at: string;
};

const platformOptions = ["instagram", "tiktok", "youtube", "linkedin", "facebook", "x"];

function platformBadgeClass(platform: string) {
  const key = platform.toLowerCase();

  if (key === "instagram") {
    return "bg-pink-400/15 text-pink-200";
  }

  if (key === "youtube") {
    return "bg-rose-400/15 text-rose-200";
  }

  if (key === "linkedin") {
    return "bg-sky-400/15 text-sky-200";
  }

  if (key === "tiktok") {
    return "bg-cyan-400/15 text-cyan-200";
  }

  return "bg-zinc-300/15 text-zinc-200";
}

function toDraft(post?: SocialPost | null): SocialDraft {
  return {
    platform: post?.platform ?? "instagram",
    post_url: post?.post_url ?? "",
    embed_code: post?.embed_code ?? "",
    caption: post?.caption ?? "",
    thumbnail_url: post?.thumbnail_url ?? "",
    likes_count: post?.likes_count ?? 0,
    is_featured: Boolean(post?.is_featured),
    posted_at: post?.posted_at ? post.posted_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
  };
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload?.data;
}

type SortableCardProps = {
  post: SocialPost;
  onEdit: (post: SocialPost) => void;
  onDelete: (post: SocialPost) => void;
};

function SortableCard({ post, onEdit, onDelete }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-white/10 bg-zinc-950 p-4 transition hover:border-white/20"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span className={`rounded-full px-2 py-1 text-xs ${platformBadgeClass(post.platform)}`}>
            {post.platform}
          </span>
          <p className="mt-2 text-xs text-zinc-500">Posted {formatDate(post.posted_at)}</p>
        </div>

        <button
          type="button"
          className="rounded-md border border-white/15 p-1.5 text-zinc-400"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {post.thumbnail_url ? (
        <div className="relative mb-3 h-40 w-full overflow-hidden rounded-md">
          <Image
            src={post.thumbnail_url}
            alt={post.platform}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="mb-3 h-40 w-full rounded-md border border-dashed border-white/20 bg-zinc-900" />
      )}

      <p className="line-clamp-3 text-sm text-zinc-300">{post.caption || "No caption provided."}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <span>{(post.likes_count ?? 0).toLocaleString()} likes</span>
        <span>{post.is_featured ? "Featured" : "Standard"}</span>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onEdit(post)}
          className="rounded-md border border-white/15 p-1.5 text-zinc-300"
          aria-label="Edit social post"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(post)}
          className="rounded-md border border-rose-300/40 p-1.5 text-rose-200"
          aria-label="Delete social post"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export function SocialPostsManager({ initialPosts }: SocialPostsManagerProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [draft, setDraft] = useState<SocialDraft>(toDraft());
  const [remoteThumbnailUrl, setRemoteThumbnailUrl] = useState<string | null>(null);
  const [isResolvingRemoteThumbnail, setIsResolvingRemoteThumbnail] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SocialPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const orderedPosts = useMemo(
    () => [...posts].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [posts]
  );

  const generatedThumbnailUrl = useMemo(
    () =>
      resolvePortfolioThumbnailUrl({
        thumbnail_url: null,
        video_url: draft.post_url,
        video_embed: draft.embed_code,
      }),
    [draft.post_url, draft.embed_code]
  );

  const sourceUrl = useMemo(
    () =>
      resolvePortfolioSourceUrl({
        thumbnail_url: null,
        video_url: draft.post_url,
        video_embed: draft.embed_code,
      }),
    [draft.post_url, draft.embed_code]
  );

  const thumbnailPreview = useMemo(() => {
    const manualThumbnail = draft.thumbnail_url.trim();

    if (manualThumbnail) {
      return {
        url: manualThumbnail,
        source: "custom" as const,
      };
    }

    if (generatedThumbnailUrl) {
      return {
        url: generatedThumbnailUrl,
        source: "auto" as const,
      };
    }

    if (remoteThumbnailUrl) {
      return {
        url: remoteThumbnailUrl,
        source: "metadata" as const,
      };
    }

    return null;
  }, [draft.thumbnail_url, generatedThumbnailUrl, remoteThumbnailUrl]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const manualThumbnail = draft.thumbnail_url.trim();

    if (manualThumbnail || generatedThumbnailUrl || !sourceUrl) {
      setRemoteThumbnailUrl(null);
      setIsResolvingRemoteThumbnail(false);
      return;
    }

    const controller = new AbortController();
    setIsResolvingRemoteThumbnail(true);
    setRemoteThumbnailUrl(null);

    void fetch("/api/social/thumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        post_url: draft.post_url,
        embed_code: draft.embed_code,
        thumbnail_url: null,
      }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { data?: { thumbnail_url?: string | null }; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to resolve social thumbnail.");
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
  }, [draft.embed_code, draft.post_url, draft.thumbnail_url, drawerOpen, generatedThumbnailUrl, sourceUrl]);

  async function refreshPosts() {
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/social", { cache: "no-store" });
      const data = await parseResponse<SocialPost[]>(response);
      setPosts(data ?? []);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to refresh social posts.";
      setTableError(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  function openCreate() {
    setEditingPost(null);
    setDraft(toDraft());
    setRemoteThumbnailUrl(null);
    setIsResolvingRemoteThumbnail(false);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(post: SocialPost) {
    setEditingPost(post);
    setDraft(toDraft(post));
    setRemoteThumbnailUrl(null);
    setIsResolvingRemoteThumbnail(false);
    setError(null);
    setDrawerOpen(true);
  }

  async function savePost() {
    if (!draft.platform.trim()) {
      setError("Platform is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTableError(null);
    setNotice(null);

    try {
      const payload = {
        platform: draft.platform.trim(),
        post_url: draft.post_url.trim(),
        embed_code: draft.embed_code.trim(),
        caption: draft.caption,
        thumbnail_url: draft.thumbnail_url.trim() || generatedThumbnailUrl || remoteThumbnailUrl || "",
        likes_count: Number(draft.likes_count),
        is_featured: draft.is_featured,
        posted_at: new Date(draft.posted_at).toISOString(),
      };

      if (editingPost) {
        const response = await fetch("/api/social", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPost.id, ...payload }),
        });
        await parseResponse(response);
      } else {
        const response = await fetch("/api/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await parseResponse(response);
      }

      setDrawerOpen(false);
      await refreshPosts();
      setNotice(editingPost ? "Social post updated." : "Social post created.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to save social post.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deletePost(post: SocialPost) {
    setIsDeleting(true);
    setTableError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/social", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });
      await parseResponse(response);
      setDeleteTarget(null);
      await refreshPosts();
      setNotice("Social post deleted.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to delete social post.";
      setTableError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function persistOrder(nextPosts: SocialPost[]) {
    setTableError(null);

    try {
      await Promise.all(
        nextPosts.map(async (post, index) => {
          const response = await fetch("/api/social", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: post.id, display_order: index }),
          });
          await parseResponse(response);
        })
      );
      setNotice("Social post order updated.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to reorder social posts.";
      setTableError(message);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setPosts((current) => {
      const oldIndex = current.findIndex((entry) => entry.id === active.id);
      const newIndex = current.findIndex((entry) => entry.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      const reordered = arrayMove(current, oldIndex, newIndex);
      void persistOrder(reordered);
      return reordered;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Social Posts Manager</h2>
          <p className="text-sm text-zinc-400">Add rich embeds, upload thumbnails, and drag cards to reorder display.</p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black"
        >
          <Plus className="h-4 w-4" />
          New Social Post
        </button>
      </div>

      {isRefreshing ? (
        <p className="inline-flex items-center gap-2 text-sm text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          Refreshing social posts...
        </p>
      ) : null}

      {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
      {tableError ? <p className="text-sm text-rose-300">{tableError}</p> : null}

      <p className="rounded-lg border border-[#e8c547]/30 bg-[#e8c547]/10 px-3 py-2 text-sm text-[#e8c547]">
        Preview tip: use <strong>Post URL</strong> for direct links and <strong>Embed Code</strong> when platform widgets are required.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={orderedPosts.map((post) => post.id)} strategy={verticalListSortingStrategy}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orderedPosts.map((post) => (
              <SortableCard
                key={post.id}
                post={post}
                onEdit={openEdit}
                onDelete={(entry) => setDeleteTarget(entry)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!orderedPosts.length ? (
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-10 text-center text-sm text-zinc-400">
          No social posts yet.
        </div>
      ) : null}

      <DrawerForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingPost ? "Edit Social Post" : "New Social Post"}
        subtitle="Manage platform links, embed code, and performance metadata."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Platform</span>
              <select
                value={draft.platform}
                onChange={(event) => setDraft((current) => ({ ...current, platform: event.target.value }))}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              >
                {platformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Likes Count</span>
              <input
                type="number"
                value={draft.likes_count}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, likes_count: Number(event.target.value) || 0 }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Post URL</span>
            <input
              value={draft.post_url}
              onChange={(event) => setDraft((current) => ({ ...current, post_url: event.target.value }))}
              className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              placeholder="https://..."
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Embed Code</span>
            <textarea
              value={draft.embed_code}
              onChange={(event) => setDraft((current) => ({ ...current, embed_code: event.target.value }))}
              className="min-h-[110px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Caption</span>
            <textarea
              value={draft.caption}
              onChange={(event) => setDraft((current) => ({ ...current, caption: event.target.value }))}
              className="min-h-[100px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <FileUploader
              label="Thumbnail Upload"
              bucket="portfolio-images"
              value={draft.thumbnail_url}
              accept="image/*"
              onChange={(value) => setDraft((current) => ({ ...current, thumbnail_url: value }))}
            />

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Posted At</span>
              <input
                type="datetime-local"
                value={draft.posted_at}
                onChange={(event) => setDraft((current) => ({ ...current, posted_at: event.target.value }))}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <div className="space-y-2 rounded-md border border-white/15 bg-zinc-950/70 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-zinc-400">Thumbnail Preview</p>

            {thumbnailPreview ? (
              <>
                <div className="relative h-44 w-full overflow-hidden rounded-md border border-white/15 bg-zinc-900">
                  <Image
                    src={thumbnailPreview.url}
                    alt="Social post thumbnail preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="object-cover"
                  />
                </div>

                <p className="text-xs text-zinc-400">
                  {thumbnailPreview.source === "custom"
                    ? "Using uploaded/custom thumbnail URL."
                    : thumbnailPreview.source === "metadata"
                      ? "Auto-generated from social post metadata."
                      : "Auto-generated from known platform URL format."}
                </p>
              </>
            ) : isResolvingRemoteThumbnail ? (
              <p className="text-sm text-zinc-500">Resolving thumbnail from link metadata...</p>
            ) : (
              <p className="text-sm text-zinc-500">
                Paste Post URL or Embed Code and thumbnail will auto-generate when available.
              </p>
            )}
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={draft.is_featured}
              onChange={(event) =>
                setDraft((current) => ({ ...current, is_featured: event.target.checked }))
              }
              className="h-4 w-4 rounded border-white/20 bg-black"
            />
            Mark as featured
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-md border border-white/20 px-3 py-2 text-sm text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void savePost()}
              className="rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Social Post"}
            </button>
          </div>
        </div>
      </DrawerForm>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.platform} post?` : "Delete social post?"}
        description="This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void deletePost(deleteTarget);
          }
        }}
      />
    </div>
  );
}
