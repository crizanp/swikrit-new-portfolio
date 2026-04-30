"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navigationLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="font-heading text-sm font-bold tracking-[0.2em] text-foreground sm:text-base">
            SWIKRIT POKHREL
          </span>
          <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_25px_hsl(var(--brand)/0.8)]" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navigationLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition hover:text-foreground",
                  active && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
         
          <ThemeToggle />
          <Button asChild variant="brand">
            <Link href="/contact">Hire Me</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-border/70"
            aria-label="Toggle navigation menu"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border bg-background/95 px-4 py-5 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-3">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground",
                    pathname === link.href && "bg-secondary/70 text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Available for work
              </div>
              <Button asChild variant="brand" size="sm">
                <Link href="/contact">Hire Me</Link>
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
