"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  FileText,
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/social", label: "Social", icon: Sparkles },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-panel rounded-2xl p-4">
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Admin Panel
      </p>
      <p className="mt-1 font-heading text-lg font-semibold">Swikrit Pokhrel</p>

      <nav className="mt-5 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition",
                "hover:bg-secondary/70 hover:text-foreground",
                active && "bg-secondary text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
