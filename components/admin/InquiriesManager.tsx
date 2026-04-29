"use client";

import { Fragment, useMemo, useState } from "react";
import { Archive, ChevronDown, ChevronUp, FileDown, Mail, RefreshCw } from "lucide-react";
import type { ContactInquiry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type InquiriesManagerProps = {
  initialInquiries: ContactInquiry[];
};

type InquiryStatusFilter = "all" | "new" | "read" | "replied" | "archived";

const statusFilters: InquiryStatusFilter[] = ["all", "new", "read", "replied", "archived"];

function normalizeStatus(status: string | null | undefined) {
  return (status ?? "new").toLowerCase();
}

function statusBadgeClass(status: string | null | undefined) {
  const normalized = normalizeStatus(status);

  if (normalized === "new") {
    return "bg-amber-200/15 text-amber-200";
  }

  if (normalized === "read") {
    return "bg-sky-200/15 text-sky-200";
  }

  if (normalized === "replied") {
    return "bg-emerald-200/15 text-emerald-200";
  }

  return "bg-zinc-200/15 text-zinc-200";
}

function toCsv(inquiries: ContactInquiry[]) {
  const headers = [
    "name",
    "email",
    "subject",
    "message",
    "project_type",
    "budget",
    "status",
    "created_at",
  ];

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const rows = inquiries.map((inquiry) =>
    [
      inquiry.name,
      inquiry.email,
      inquiry.subject ?? "",
      inquiry.message,
      inquiry.project_type ?? "",
      inquiry.budget ?? "",
      inquiry.status ?? "new",
      inquiry.created_at ?? "",
    ]
      .map((entry) => escape(String(entry)))
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload?.data;
}

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [activeFilter, setActiveFilter] = useState<InquiryStatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMutatingId, setIsMutatingId] = useState<string | null>(null);

  const filteredInquiries = useMemo(() => {
    if (activeFilter === "all") {
      return inquiries;
    }

    return inquiries.filter((entry) => normalizeStatus(entry.status) === activeFilter);
  }, [activeFilter, inquiries]);

  async function updateStatus(id: string, status: "read" | "replied" | "archived") {
    setIsMutatingId(id);

    try {
      const response = await fetch("/api/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      await parseResponse(response);

      setInquiries((current) =>
        current.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry))
      );
    } finally {
      setIsMutatingId(null);
    }
  }

  function exportCsv() {
    const csv = toCsv(filteredInquiries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `inquiries-${activeFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Inquiries Manager</h2>
          <p className="text-sm text-zinc-400">Filter by status, expand messages, reply quickly, and export to CSV.</p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-sm text-zinc-200"
        >
          <FileDown className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const count =
            filter === "all"
              ? inquiries.length
              : inquiries.filter((entry) => normalizeStatus(entry.status) === filter).length;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition ${
                activeFilter === filter
                  ? "bg-[#e8c547]/20 text-[#e8c547]"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {filter} ({count})
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-400">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Budget</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Received</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredInquiries.map((inquiry) => {
                const expanded = expandedId === inquiry.id;

                return (
                  <Fragment key={inquiry.id}>
                    <tr className="text-sm text-zinc-200 hover:bg-white/5">
                      <td className="px-3 py-3">{inquiry.name}</td>
                      <td className="px-3 py-3 text-zinc-400">{inquiry.email}</td>
                      <td className="px-3 py-3 text-zinc-400">{inquiry.project_type ?? "-"}</td>
                      <td className="px-3 py-3 text-zinc-400">{inquiry.budget ?? "-"}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${statusBadgeClass(inquiry.status)}`}>
                          {normalizeStatus(inquiry.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-400">{formatDate(inquiry.created_at)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => void updateStatus(inquiry.id, "read")}
                            disabled={isMutatingId === inquiry.id}
                            className="rounded-md border border-white/15 p-1.5 text-zinc-300 disabled:opacity-60"
                            aria-label="Mark read"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>

                          <a
                            href={`mailto:${inquiry.email}?subject=Re:${encodeURIComponent(inquiry.subject ?? "Project inquiry")}`}
                            className="rounded-md border border-white/15 p-1.5 text-zinc-300"
                            aria-label="Reply"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => void updateStatus(inquiry.id, "archived")}
                            disabled={isMutatingId === inquiry.id}
                            className="rounded-md border border-rose-300/40 p-1.5 text-rose-200 disabled:opacity-60"
                            aria-label="Archive"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setExpandedId((current) => (current === inquiry.id ? null : inquiry.id))}
                            className="rounded-md border border-white/15 p-1.5 text-zinc-300"
                            aria-label="Toggle message"
                          >
                            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded ? (
                      <tr className="bg-black/40 text-sm text-zinc-300">
                        <td colSpan={7} className="px-4 py-3">
                          <p className="mb-1 text-xs uppercase tracking-[0.12em] text-zinc-500">Subject</p>
                          <p className="mb-3">{inquiry.subject ?? "No subject"}</p>
                          <p className="mb-1 text-xs uppercase tracking-[0.12em] text-zinc-500">Message</p>
                          <p className="whitespace-pre-wrap leading-relaxed">{inquiry.message}</p>
                          <button
                            type="button"
                            onClick={() => void updateStatus(inquiry.id, "replied")}
                            className="mt-3 rounded-md border border-emerald-300/40 px-3 py-1.5 text-xs text-emerald-200"
                          >
                            Mark as Replied
                          </button>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}

              {!filteredInquiries.length ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-sm text-zinc-400">
                    No inquiries for this status.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
