"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { FileUploader } from "@/components/admin/FileUploader";
import { formatDate } from "@/lib/utils";

type TestimonialsManagerProps = {
  initialTestimonials: Testimonial[];
};

type TestimonialDraft = {
  client_name: string;
  client_role: string;
  client_avatar: string;
  content: string;
  rating: number;
  project_type: string;
  is_featured: boolean;
};

function toDraft(item?: Testimonial | null): TestimonialDraft {
  return {
    client_name: item?.client_name ?? "",
    client_role: item?.client_role ?? "",
    client_avatar: item?.client_avatar ?? "",
    content: item?.content ?? "",
    rating: item?.rating ?? 5,
    project_type: item?.project_type ?? "",
    is_featured: Boolean(item?.is_featured),
  };
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload?.data;
}

export function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [draft, setDraft] = useState<TestimonialDraft>(toDraft());
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const orderedItems = useMemo(
    () =>
      [...testimonials].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      }),
    [testimonials]
  );

  async function refreshTestimonials() {
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/testimonials", { cache: "no-store" });
      const data = await parseResponse<Testimonial[]>(response);
      setTestimonials(data ?? []);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to refresh testimonials.";
      setTableError(message);
    } finally {
      setIsRefreshing(false);
    }
  }

  function openCreate() {
    setEditingItem(null);
    setDraft(toDraft());
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditingItem(item);
    setDraft(toDraft(item));
    setError(null);
    setDrawerOpen(true);
  }

  async function saveTestimonial() {
    if (!draft.client_name.trim()) {
      setError("Client name is required.");
      return;
    }

    if (!draft.content.trim()) {
      setError("Testimonial content is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTableError(null);
    setNotice(null);

    try {
      const payload = {
        client_name: draft.client_name.trim(),
        client_role: draft.client_role.trim(),
        client_avatar: draft.client_avatar.trim(),
        content: draft.content.trim(),
        rating: Math.min(5, Math.max(1, Number(draft.rating) || 5)),
        project_type: draft.project_type.trim(),
        is_featured: draft.is_featured,
      };

      if (editingItem) {
        const response = await fetch("/api/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...payload }),
        });
        await parseResponse(response);
      } else {
        const response = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await parseResponse(response);
      }

      setDrawerOpen(false);
      await refreshTestimonials();
      setNotice(editingItem ? "Testimonial updated." : "Testimonial created.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to save testimonial.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteTestimonial(item: Testimonial) {
    setIsDeleting(true);
    setTableError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });

      await parseResponse(response);
      setDeleteTarget(null);
      await refreshTestimonials();
      setNotice("Testimonial deleted.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to delete testimonial.";
      setTableError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function toggleFeatured(item: Testimonial) {
    setTableError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_featured: !item.is_featured }),
      });

      await parseResponse(response);
      await refreshTestimonials();
      setNotice(item.is_featured ? "Marked as standard testimonial." : "Marked as featured testimonial.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to update testimonial.";
      setTableError(message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Testimonials Manager</h2>
          <p className="text-sm text-zinc-400">Manage client feedback shown across homepage and other public sections.</p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black"
        >
          <Plus className="h-4 w-4" />
          New Testimonial
        </button>
      </div>

      {isRefreshing ? (
        <p className="inline-flex items-center gap-2 text-sm text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          Refreshing testimonials...
        </p>
      ) : null}

      {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
      {tableError ? <p className="text-sm text-rose-300">{tableError}</p> : null}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-400">
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Role / Project</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Feature</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {orderedItems.map((item) => (
                <tr key={item.id} className="text-sm text-zinc-200 hover:bg-white/5">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {item.client_avatar ? (
                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/15">
                          <Image
                            src={item.client_avatar}
                            alt={item.client_name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-zinc-900 text-xs uppercase text-zinc-300">
                          {item.client_name.slice(0, 2)}
                        </span>
                      )}

                      <div>
                        <p className="font-medium text-zinc-100">{item.client_name}</p>
                        <p className="line-clamp-1 text-xs text-zinc-500">{item.content}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-zinc-400">
                    <p>{item.client_role || "Client"}</p>
                    <p className="text-xs text-zinc-500">{item.project_type || "General"}</p>
                  </td>

                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      {Array.from({ length: item.rating ?? 5 }).map((_, index) => (
                        <Star key={`${item.id}-rating-${index}`} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleFeatured(item)}
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.is_featured ? "bg-[#e8c547]/20 text-[#e8c547]" : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {item.is_featured ? "Featured" : "Standard"}
                    </button>
                  </td>

                  <td className="px-3 py-3 text-zinc-500">{formatDate(item.created_at)}</td>

                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-md border border-white/15 p-1.5 text-zinc-300"
                        aria-label="Edit testimonial"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-md border border-rose-300/40 p-1.5 text-rose-200"
                        aria-label="Delete testimonial"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!orderedItems.length ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-zinc-400">
                    No testimonials configured yet.
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
        title={editingItem ? "Edit Testimonial" : "New Testimonial"}
        subtitle="Control social proof blocks used on homepage and public sections."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Client Name</span>
              <input
                value={draft.client_name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, client_name: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Client Role</span>
              <input
                value={draft.client_role}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, client_role: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                placeholder="Marketing Lead"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Testimonial Content</span>
            <textarea
              value={draft.content}
              onChange={(event) =>
                setDraft((current) => ({ ...current, content: event.target.value }))
              }
              className="min-h-[120px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Rating (1-5)</span>
              <input
                type="number"
                min={1}
                max={5}
                value={draft.rating}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, rating: Number(event.target.value) || 5 }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Project Type</span>
              <input
                value={draft.project_type}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, project_type: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                placeholder="commercial"
              />
            </label>
          </div>

          <FileUploader
            label="Client Avatar"
            bucket="avatars"
            value={draft.client_avatar}
            accept="image/*"
            onChange={(value) => setDraft((current) => ({ ...current, client_avatar: value }))}
          />

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
              onClick={() => void saveTestimonial()}
              className="rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Testimonial"}
            </button>
          </div>
        </div>
      </DrawerForm>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.client_name}?` : "Delete testimonial?"}
        description="This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void deleteTestimonial(deleteTarget);
          }
        }}
      />
    </div>
  );
}
