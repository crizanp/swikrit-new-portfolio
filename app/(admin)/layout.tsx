import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface pb-10 pt-6">
      <div className="container grid gap-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />
        <main className="surface-panel rounded-2xl p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Content Management
              </p>
              <h1 className="font-heading text-2xl font-semibold">Admin Workspace</h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand"
            >
              Back to site
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
