"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { FileUploader } from "@/components/admin/FileUploader";
import { formatDate } from "@/lib/utils";

type BlogManagerProps = {
  initialPosts: BlogPost[];
};

type BlogDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
  read_time: number;
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toDraft(post?: BlogPost | null): BlogDraft {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    cover_image: post?.cover_image ?? "",
    tags: post?.tags?.join(", ") ?? "",
    is_published: Boolean(post?.is_published),
    meta_title: post?.meta_title ?? "",
    meta_description: post?.meta_description ?? "",
    read_time: post?.read_time ?? 4,
  };
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload?.data;
}

export function BlogManager({ initialPosts }: BlogManagerProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [draft, setDraft] = useState<BlogDraft>(toDraft());
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")),
    [posts]
  );

  async function refreshPosts() {
    const response = await fetch("/api/blog?published=false", { cache: "no-store" });
    const data = await parseResponse<BlogPost[]>(response);
    setPosts(data ?? []);
  }

  function openCreate() {
    setEditingPost(null);
    setDraft(toDraft());
    setSlugTouched(false);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post);
    setDraft(toDraft(post));
    setSlugTouched(true);
    setError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!draft.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        excerpt: draft.excerpt.trim(),
        content: draft.content,
        cover_image: draft.cover_image,
        tags: draft.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        is_published: draft.is_published,
        published_at: draft.is_published ? new Date().toISOString() : null,
        meta_title: draft.meta_title.trim(),
        meta_description: draft.meta_description.trim(),
        read_time: draft.read_time,
      };

      if (editingPost) {
        const response = await fetch("/api/blog", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPost.id, ...payload }),
        });
        await parseResponse(response);
      } else {
        const response = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await parseResponse(response);
      }

      setDrawerOpen(false);
      await refreshPosts();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to save post.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(post: BlogPost) {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });
      await parseResponse(response);
      setDeleteTarget(null);
      await refreshPosts();
    } finally {
      setIsDeleting(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    const nextPublished = !post.is_published;
    const response = await fetch("/api/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: post.id,
        is_published: nextPublished,
        published_at: nextPublished ? new Date().toISOString() : null,
      }),
    });

    await parseResponse(response);
    await refreshPosts();
  }

  return (
    <div className="space-y-5" data-color-mode="dark">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Blog Manager</h2>
          <p className="text-sm text-zinc-400">Write in markdown, tune SEO fields, and toggle publish status.</p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-400">
                <th className="px-3 py-2">Cover</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {sortedPosts.map((post) => (
                <tr key={post.id} className="text-sm text-zinc-200 hover:bg-white/5">
                  <td className="px-3 py-3">
                    {post.cover_image ? (
                      <div className="relative h-12 w-20">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          sizes="80px"
                          className="rounded object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-20 rounded border border-dashed border-white/20 bg-zinc-900" />
                    )}
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-100">{post.title}</td>
                  <td className="px-3 py-3 text-zinc-400">{post.slug}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => void togglePublish(post)}
                      className={`rounded-full px-2 py-1 text-xs ${
                        post.is_published ? "bg-emerald-300/20 text-emerald-200" : "bg-zinc-700 text-zinc-200"
                      }`}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-zinc-400">{formatDate(post.published_at ?? post.created_at)}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-white/15 p-1.5 text-zinc-300"
                        aria-label="Preview post"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        className="rounded-md border border-white/15 p-1.5 text-zinc-300"
                        aria-label="Edit post"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        className="rounded-md border border-rose-300/40 p-1.5 text-rose-200"
                        aria-label="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!sortedPosts.length ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-zinc-400">
                    No blog posts yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <DrawerForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingPost ? "Edit Blog Post" : "New Blog Post"}
        subtitle="Use markdown with tags, publish controls, and SEO metadata."
        widthClassName="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Title</span>
              <input
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft((current) => ({
                    ...current,
                    title,
                    slug: slugTouched ? current.slug : makeSlug(title),
                  }));
                }}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Slug</span>
              <input
                value={draft.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setDraft((current) => ({ ...current, slug: makeSlug(event.target.value) }));
                }}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Excerpt</span>
            <textarea
              value={draft.excerpt}
              onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))}
              className="min-h-[90px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Tags (comma separated)</span>
              <input
                value={draft.tags}
                onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                placeholder="editing, workflow, storytelling"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Estimated Read Time (min)</span>
              <input
                type="number"
                min={1}
                value={draft.read_time}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, read_time: Number(event.target.value) || 1 }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Meta Title (SEO)</span>
              <input
                value={draft.meta_title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, meta_title: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Meta Description (SEO)</span>
              <input
                value={draft.meta_description}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, meta_description: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <FileUploader
            label="Cover Image"
            bucket="blog-images"
            value={draft.cover_image}
            accept="image/*"
            onChange={(value) => setDraft((current) => ({ ...current, cover_image: value }))}
          />

          <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={draft.is_published}
              onChange={(event) =>
                setDraft((current) => ({ ...current, is_published: event.target.checked }))
              }
              className="h-4 w-4 rounded border-white/20 bg-black"
            />
            Publish now
          </label>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.1em] text-zinc-400">Content (Markdown)</p>
            <MDEditor
              value={draft.content}
              onChange={(value) => setDraft((current) => ({ ...current, content: value ?? "" }))}
              preview="edit"
              height={360}
            />
          </div>

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
              onClick={() => void handleSave()}
              className="rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Post"}
            </button>
          </div>
        </div>
      </DrawerForm>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.title}?` : "Delete post?"}
        description="This will remove the post permanently."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void handleDelete(deleteTarget);
          }
        }}
      />
    </div>
  );
}
