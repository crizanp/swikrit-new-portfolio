"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function mapLoginErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to sign in.";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("swikritpokhrel01@gmail.com");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to sign in.");
      }

      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") ?? "/admin/dashboard";
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      setNotice(mapLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--brand)/0.25),_transparent_45%)]" />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-brand/25 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl"
      >
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.16em] text-brand">Admin</p>
          <h1 className="text-2xl font-semibold">Sign in to dashboard</h1>
          <p className="text-sm text-zinc-400">Access portfolio management and analytics tools.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-zinc-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            required
          />
        </div>

        {notice ? <p className="text-sm text-red-400">{notice}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
