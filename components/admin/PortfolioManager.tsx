"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { PortfolioItem } from "@/lib/types";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { DrawerForm } from "@/components/admin/DrawerForm";
import { PortfolioForm, type PortfolioFormValues } from "@/components/admin/PortfolioForm";

type PortfolioManagerProps = {
  initialItems: PortfolioItem[];
};

type SortableRowProps = {
  item: PortfolioItem;
  checked: boolean;
  onToggleChecked: (id: string, checked: boolean) => void;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (item: PortfolioItem) => void;
  onToggleFeatured: (item: PortfolioItem) => void;
};

function SortableRow({
  item,
  checked,
  onToggleChecked,
  onEdit,
  onDelete,
  onToggleFeatured,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="text-sm text-zinc-200 hover:bg-white/5">
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggleChecked(item.id, event.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-black"
        />
      </td>

      <td className="px-3 py-3">
        <button
          type="button"
          className="text-zinc-400 hover:text-[#e8c547]"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      <td className="px-3 py-3">
        {item.thumbnail_url ? (
          <div className="relative h-12 w-20">
            <Image
              src={item.thumbnail_url}
              alt={item.title}
              fill
              sizes="80px"
              className="rounded object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-20 rounded border border-dashed border-white/20 bg-zinc-900" />
        )}
      </td>

      <td className="px-3 py-3">
        <p className="font-medium text-zinc-100">{item.title}</p>
        <p className="text-xs text-zinc-500">{item.client || "No client"}</p>
      </td>

      <td className="px-3 py-3 capitalize text-zinc-400">{item.category?.replaceAll("_", " ") || "-"}</td>
      <td className="px-3 py-3 text-zinc-400">{item.views_count?.toLocaleString() ?? "0"}</td>

      <td className="px-3 py-3">
        <button
          type="button"
          onClick={() => onToggleFeatured(item)}
          className={`rounded-full px-2 py-1 text-xs ${
            item.is_featured ? "bg-[#e8c547]/20 text-[#e8c547]" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          {item.is_featured ? "Featured" : "Standard"}
        </button>
      </td>

      <td className="px-3 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-md border border-white/15 p-1.5 text-zinc-300"
            aria-label="Edit item"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-md border border-rose-300/40 p-1.5 text-rose-200"
            aria-label="Delete item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload?.data;
}

export function PortfolioManager({ initialItems }: PortfolioManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<PortfolioItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items.length, selectedIds.length]
  );

  async function refreshItems() {
    const response = await fetch("/api/portfolio?limit=200", { cache: "no-store" });
    const data = await parseResponse<PortfolioItem[]>(response);
    setItems(data ?? []);
    setSelectedIds([]);
  }

  async function handleSubmit(values: PortfolioFormValues) {
    if (editingItem) {
      const response = await fetch(`/api/portfolio/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      await parseResponse(response);
    } else {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      await parseResponse(response);
    }

    setIsDrawerOpen(false);
    setEditingItem(null);
    await refreshItems();
  }

  async function handleDelete(item: PortfolioItem) {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/portfolio/${item.id}`, { method: "DELETE" });
      await parseResponse(response);
      setConfirmDelete(null);
      await refreshItems();
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) {
      return;
    }

    setIsBulkDeleting(true);

    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const response = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
          await parseResponse(response);
        })
      );

      await refreshItems();
    } finally {
      setIsBulkDeleting(false);
    }
  }

  async function persistOrder(nextItems: PortfolioItem[]) {
    await Promise.all(
      nextItems.map(async (item, index) => {
        const response = await fetch(`/api/portfolio/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: index }),
        });
        await parseResponse(response);
      })
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex((entry) => entry.id === active.id);
      const newIndex = current.findIndex((entry) => entry.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      const next = arrayMove(current, oldIndex, newIndex);
      void persistOrder(next);
      return next;
    });
  }

  async function toggleFeatured(item: PortfolioItem) {
    const response = await fetch(`/api/portfolio/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !item.is_featured }),
    });

    await parseResponse(response);
    await refreshItems();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Portfolio Manager</h2>
          <p className="text-sm text-zinc-400">Drag rows to reorder, manage featured projects, and bulk delete.</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length ? (
            <button
              type="button"
              onClick={() => void handleBulkDelete()}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-200 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {isBulkDeleting ? "Deleting..." : `Bulk Delete (${selectedIds.length})`}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black"
          >
            <Plus className="h-4 w-4" />
            New Item
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-400">
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedIds(items.map((item) => item.id));
                          return;
                        }

                        setSelectedIds([]);
                      }}
                      className="h-4 w-4 rounded border-white/20 bg-black"
                    />
                  </th>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Thumbnail</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Views</th>
                  <th className="px-3 py-2">Featured</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-white/10">
                  {items.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      checked={selectedIds.includes(item.id)}
                      onToggleChecked={(id, checked) => {
                        setSelectedIds((current) => {
                          if (checked) {
                            return Array.from(new Set([...current, id]));
                          }

                          return current.filter((entry) => entry !== id);
                        });
                      }}
                      onEdit={(entry) => {
                        setEditingItem(entry);
                        setIsDrawerOpen(true);
                      }}
                      onDelete={(entry) => setConfirmDelete(entry)}
                      onToggleFeatured={(entry) => void toggleFeatured(entry)}
                    />
                  ))}

                  {!items.length ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-sm text-zinc-400">
                        No portfolio items found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      </div>

      <DrawerForm
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Portfolio Item" : "New Portfolio Item"}
        subtitle="Use uploads or external URLs for media."
      >
        <PortfolioForm
          initialValue={editingItem ?? undefined}
          onCancel={() => {
            setIsDrawerOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
        />
      </DrawerForm>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title={confirmDelete ? `Delete ${confirmDelete.title}?` : "Delete portfolio item?"}
        description="This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            void handleDelete(confirmDelete);
          }
        }}
      />
    </div>
  );
}
