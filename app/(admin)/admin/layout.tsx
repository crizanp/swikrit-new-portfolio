"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/client";

export default function AdminSectionLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const isLoginPage = useMemo(() => pathname === "/admin/login", [pathname]);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      if (isLoginPage) {
        setChecking(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        const params = new URLSearchParams({ next: pathname || "/admin/dashboard" });
        router.replace(`/admin/login?${params.toString()}`);
        return;
      }

      setChecking(false);
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-black text-zinc-100">{children}</div>;
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-black text-zinc-300">
        Verifying admin session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <main className="px-4 pb-10 pt-16 lg:px-8 lg:pt-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Swikrit Portfolio CMS</p>
              <h1 className="text-2xl font-semibold text-[#e8c547]">Admin Workspace</h1>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-[#e8c547]"
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
