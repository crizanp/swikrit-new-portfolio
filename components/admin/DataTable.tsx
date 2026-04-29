"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
};

type SortState<T> = {
  key: keyof T | string;
  direction: "asc" | "desc";
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState<T> | null>(null);
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortState) {
      return data;
    }

    return [...data].sort((a, b) => {
      const left = a[sortState.key as keyof T];
      const right = b[sortState.key as keyof T];

      if (left === right) {
        return 0;
      }

      if (left == null) {
        return 1;
      }

      if (right == null) {
        return -1;
      }

      const modifier = sortState.direction === "asc" ? 1 : -1;
      return String(left).localeCompare(String(right), undefined, { numeric: true }) * modifier;
    });
  }, [data, sortState]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key: keyof T | string) {
    setPage(1);

    setSortState((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/10 bg-black", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-zinc-950/80">
            <tr>
              {columns.map((column) => {
                const isSorted = sortState?.key === column.key;

                return (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400",
                      column.className
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center gap-1 text-left text-zinc-300 hover:text-[#e8c547]"
                      >
                        {column.header}
                        {isSorted ? (
                          sortState?.direction === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-30" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {paginatedData.length ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition hover:bg-white/5">
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${String(column.key)}`}
                      className={cn("px-4 py-3 text-sm text-zinc-200", column.className)}
                    >
                      {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-zinc-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
        <p>
          Page {currentPage} of {pageCount}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage <= 1}
            className="rounded-md border border-white/15 px-2 py-1 disabled:opacity-40"
          >
            Prev
          </button>

          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={currentPage >= pageCount}
            className="rounded-md border border-white/15 px-2 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
