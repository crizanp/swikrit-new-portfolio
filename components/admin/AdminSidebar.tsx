"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Film,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Settings,
  Share2,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/portfolio", label: "Portfolio", icon: Film },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { href: "/admin/social", label: "Social Posts", icon: Share2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsOpen(false);
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    links.forEach((link) => {
      router.prefetch(link.href);
    });
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      await Promise.allSettled([
        fetch("/api/admin/logout", { method: "POST" }),
        supabase.auth.signOut(),
      ]);
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="fixed right-4 top-4 z-[160] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8c547]/50 bg-black text-[#e8c547] lg:hidden"
        aria-label="Toggle admin navigation"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[150] w-[280px] border-r border-white/10 bg-black p-5 transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#e8c547]">SWIKRIT · ADMIN</p>
            <p className="mt-1 text-sm text-zinc-400">Portfolio Control Center</p>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (pathname !== link.href) {
                      setIsNavigating(true);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-[#e8c547]/15 text-[#e8c547]"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#e8c547]/40 px-3 py-2 text-sm text-[#e8c547] transition hover:bg-[#e8c547]/10 disabled:opacity-70"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[140] bg-black/70 lg:hidden"
          aria-label="Close admin navigation"
        />
      ) : null}

      {isNavigating ? (
        <div className="fixed inset-0 z-[170] grid place-items-center bg-black/65 backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8c547]/35 bg-black/85 px-4 py-2 text-sm text-[#e8c547]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading section...
          </div>
        </div>
      ) : null}
    </>
  );
}
