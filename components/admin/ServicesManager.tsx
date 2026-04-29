"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Service } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { DrawerForm } from "@/components/admin/DrawerForm";

type ServicesManagerProps = {
  initialServices: Service[];
};

type ServiceDraft = {
  title: string;
  description: string;
  icon: string;
  price_range: string;
  delivery_days: number;
  features: string;
  is_active: boolean;
  display_order: number;
};

function toDraft(service?: Service | null): ServiceDraft {
  return {
    title: service?.title ?? "",
    description: service?.description ?? "",
    icon: service?.icon ?? "",
    price_range: service?.price_range ?? "",
    delivery_days: service?.delivery_days ?? 7,
    features: service?.features?.join(", ") ?? "",
    is_active: Boolean(service?.is_active),
    display_order: service?.display_order ?? 0,
  };
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload?.data;
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState(initialServices);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(toDraft());
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [services]
  );

  async function refreshServices() {
    const response = await fetch("/api/services?active=false", { cache: "no-store" });
    const data = await parseResponse<Service[]>(response);
    setServices(data ?? []);
  }

  function openCreate() {
    setEditingService(null);
    setDraft(toDraft());
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setDraft(toDraft(service));
    setError(null);
    setDrawerOpen(true);
  }

  async function saveService() {
    if (!draft.title.trim()) {
      setError("Service title is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        icon: draft.icon.trim(),
        price_range: draft.price_range.trim(),
        delivery_days: Number(draft.delivery_days),
        features: draft.features
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        is_active: draft.is_active,
        display_order: Number(draft.display_order),
      };

      if (editingService) {
        const response = await fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingService.id, ...payload }),
        });
        await parseResponse(response);
      } else {
        const response = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await parseResponse(response);
      }

      setDrawerOpen(false);
      await refreshServices();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to save service.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteService(service: Service) {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id }),
      });

      await parseResponse(response);
      setDeleteTarget(null);
      await refreshServices();
    } finally {
      setIsDeleting(false);
    }
  }

  async function toggleActive(service: Service) {
    const response = await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, is_active: !service.is_active }),
    });

    await parseResponse(response);
    await refreshServices();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Services Manager</h2>
          <p className="text-sm text-zinc-400">Create, edit, and toggle active packages with delivery and feature lists.</p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black"
        >
          <Plus className="h-4 w-4" />
          New Service
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-400">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Icon</th>
                <th className="px-3 py-2">Price Range</th>
                <th className="px-3 py-2">Delivery</th>
                <th className="px-3 py-2">Features</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {sortedServices.map((service) => (
                <tr key={service.id} className="text-sm text-zinc-200 hover:bg-white/5">
                  <td className="px-3 py-3 font-medium text-zinc-100">{service.title}</td>
                  <td className="px-3 py-3 text-zinc-300">{service.icon || "-"}</td>
                  <td className="px-3 py-3 text-zinc-400">{service.price_range || "-"}</td>
                  <td className="px-3 py-3 text-zinc-400">{service.delivery_days ?? 0} days</td>
                  <td className="px-3 py-3 text-zinc-400">{service.features?.slice(0, 2).join(", ") || "-"}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleActive(service)}
                      className={`rounded-full px-2 py-1 text-xs ${
                        service.is_active ? "bg-emerald-300/20 text-emerald-200" : "bg-zinc-700 text-zinc-200"
                      }`}
                    >
                      {service.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        className="rounded-md border border-white/15 p-1.5 text-zinc-300"
                        aria-label="Edit service"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(service)}
                        className="rounded-md border border-rose-300/40 p-1.5 text-rose-200"
                        aria-label="Delete service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!sortedServices.length ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-zinc-400">
                    No services configured yet.
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
        title={editingService ? "Edit Service" : "New Service"}
        subtitle="Include icon, pricing, delivery timeline, and feature list."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Title</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Icon (emoji or token)</span>
              <input
                value={draft.icon}
                onChange={(event) => setDraft((current) => ({ ...current, icon: event.target.value }))}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                placeholder="e.g. 🎬"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-[120px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Price Range</span>
              <input
                value={draft.price_range}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, price_range: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                placeholder="$1,000 - $2,500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Delivery Days</span>
              <input
                type="number"
                min={1}
                value={draft.delivery_days}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, delivery_days: Number(event.target.value) || 1 }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Features (comma separated)</span>
              <input
                value={draft.features}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, features: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                placeholder="Concept, Editing, Color"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Display Order</span>
              <input
                type="number"
                value={draft.display_order}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, display_order: Number(event.target.value) || 0 }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) =>
                setDraft((current) => ({ ...current, is_active: event.target.checked }))
              }
              className="h-4 w-4 rounded border-white/20 bg-black"
            />
            Active service
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
              onClick={() => void saveService()}
              className="rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Service"}
            </button>
          </div>
        </div>
      </DrawerForm>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.title}?` : "Delete service?"}
        description="This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void deleteService(deleteTarget);
          }
        }}
      />
    </div>
  );
}
