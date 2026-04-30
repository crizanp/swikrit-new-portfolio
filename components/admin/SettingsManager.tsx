"use client";

import { useState } from "react";
import { LogOut, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import type { ProfileSettings, SocialStatsSettings } from "@/lib/site-settings";
import type { SiteStat } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type StorageUsage = {
  bucket: string;
  totalFiles: number;
  totalSize: number;
  files: Array<{
    name: string;
    size: number;
    updated_at: string | null;
  }>;
};

type SettingsManagerProps = {
  initialStats: SiteStat[];
  initialProfile: ProfileSettings;
  initialSocial: SocialStatsSettings;
  initialStorageUsage: StorageUsage[];
};

type EditableStat = {
  id?: string;
  stat_key: string;
  stat_value: string;
  display_label: string;
};

async function parseResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload?.data;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}

export function SettingsManager({
  initialStats,
  initialProfile,
  initialSocial,
  initialStorageUsage,
}: SettingsManagerProps) {
  const [stats, setStats] = useState<EditableStat[]>(
    initialStats.map((stat) => ({
      id: stat.id,
      stat_key: stat.stat_key,
      stat_value: stat.stat_value,
      display_label: stat.display_label ?? "",
    }))
  );
  const [profile, setProfile] = useState<ProfileSettings>(initialProfile);
  const [social, setSocial] = useState<SocialStatsSettings>(initialSocial);
  const [storageUsage, setStorageUsage] = useState(initialStorageUsage);
  const [statsNotice, setStatsNotice] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [dangerNotice, setDangerNotice] = useState<string | null>(null);
  const [isSavingStats, setIsSavingStats] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRefreshingStorage, setIsRefreshingStorage] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  async function saveStats() {
    setIsSavingStats(true);
    setStatsNotice(null);

    try {
      await parseResponse(
        await fetch("/api/stats", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: stats
              .map((entry) => ({
                stat_key: entry.stat_key.trim(),
                stat_value: entry.stat_value.trim(),
                display_label: entry.display_label.trim(),
              }))
              .filter((entry) => entry.stat_key.length > 0),
          }),
        })
      );

      setStatsNotice("Stats saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save stats.";
      setStatsNotice(message);
    } finally {
      setIsSavingStats(false);
    }
  }

  async function saveProfile() {
    setIsSavingProfile(true);
    setProfileNotice(null);

    try {
      await parseResponse(
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, social }),
        })
      );

      setProfileNotice("Profile settings updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update profile.";
      setProfileNotice(message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function refreshStorageUsage() {
    setIsRefreshingStorage(true);

    try {
      const data = await parseResponse<StorageUsage[]>(
        await fetch("/api/storage/usage", { cache: "no-store" })
      );

      setStorageUsage(data ?? []);
    } finally {
      setIsRefreshingStorage(false);
    }
  }

  async function logoutAllSessions() {
    setIsLoggingOutAll(true);
    setDangerNotice(null);

    try {
      await parseResponse(await fetch("/api/admin/logout", { method: "POST" }));

      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });

      window.location.href = "/admin/login";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign out all sessions.";
      setDangerNotice(message);
    } finally {
      setIsLoggingOutAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-zinc-950 p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-100">Site Stats Editor</h2>
          <button
            type="button"
            onClick={() =>
              setStats((current) => [
                ...current,
                { stat_key: "", stat_value: "", display_label: "" },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </button>
        </div>

        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={`${stat.id ?? "new"}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                value={stat.stat_key}
                onChange={(event) =>
                  setStats((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, stat_key: event.target.value } : entry
                    )
                  )
                }
                placeholder="stat_key"
                className="rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
              <input
                value={stat.stat_value}
                onChange={(event) =>
                  setStats((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, stat_value: event.target.value } : entry
                    )
                  )
                }
                placeholder="stat_value"
                className="rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
              <input
                value={stat.display_label}
                onChange={(event) =>
                  setStats((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, display_label: event.target.value } : entry
                    )
                  )
                }
                placeholder="Display Label"
                className="rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />

              <button
                type="button"
                onClick={() => setStats((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                className="inline-flex items-center justify-center rounded-md border border-rose-300/40 px-3 py-2 text-rose-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm text-zinc-400">These values power homepage counters and about-page stats.</p>
          <button
            type="button"
            onClick={() => void saveStats()}
            disabled={isSavingStats}
            className="inline-flex items-center gap-1 rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {isSavingStats ? "Saving..." : "Save Stats"}
          </button>
        </div>

        {statsNotice ? <p className="mt-2 text-sm text-zinc-300">{statsNotice}</p> : null}
      </section>

      <section className="rounded-xl border border-white/10 bg-zinc-950 p-5">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">Profile, About, and Contact Settings</h2>

        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Display Name</span>
              <input
                value={profile.display_name}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, display_name: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Professional Title</span>
              <input
                value={profile.title}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, title: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Contact Email</span>
              <input
                value={profile.contact_email}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, contact_email: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Location Label</span>
              <input
                value={profile.location_label}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, location_label: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Reply Time Label</span>
              <input
                value={profile.contact_reply_time}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, contact_reply_time: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Bio</span>
            <textarea
              value={profile.bio}
              onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
              className="min-h-[90px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">About Intro</span>
            <textarea
              value={profile.about_intro}
              onChange={(event) =>
                setProfile((current) => ({ ...current, about_intro: event.target.value }))
              }
              className="min-h-[90px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">About Paragraph 1</span>
              <textarea
                value={profile.about_paragraph_one}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, about_paragraph_one: event.target.value }))
                }
                className="min-h-[130px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">About Paragraph 2</span>
              <textarea
                value={profile.about_paragraph_two}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, about_paragraph_two: event.target.value }))
                }
                className="min-h-[130px] w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">About Portrait URL</span>
              <input
                value={profile.about_portrait_url}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, about_portrait_url: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">CV Bucket</span>
              <input
                value={profile.cv_bucket}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, cv_bucket: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">CV Path</span>
              <input
                value={profile.cv_path}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, cv_path: event.target.value }))
                }
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium text-zinc-200">Social Reach and Links</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Instagram Handle</span>
                <input
                  value={social.instagram_handle}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, instagram_handle: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Instagram Followers</span>
                <input
                  value={social.instagram_followers}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, instagram_followers: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Instagram URL</span>
                <input
                  value={social.instagram_url}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, instagram_url: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">TikTok Handle</span>
                <input
                  value={social.tiktok_handle}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, tiktok_handle: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">TikTok Followers</span>
                <input
                  value={social.tiktok_followers}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, tiktok_followers: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">TikTok URL</span>
                <input
                  value={social.tiktok_url}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, tiktok_url: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">LinkedIn Handle</span>
                <input
                  value={social.linkedin_handle}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, linkedin_handle: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">LinkedIn Followers</span>
                <input
                  value={social.linkedin_followers}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, linkedin_followers: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">LinkedIn URL</span>
                <input
                  value={social.linkedin_url}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, linkedin_url: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">YouTube URL</span>
                <input
                  value={social.youtube_url}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, youtube_url: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-400">Total Views Label</span>
                <input
                  value={social.total_views_label}
                  onChange={(event) =>
                    setSocial((current) => ({ ...current, total_views_label: event.target.value }))
                  }
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-zinc-100"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">These values power About, Contact, footer, and social blocks.</p>
          <button
            type="button"
            onClick={() => void saveProfile()}
            disabled={isSavingProfile}
            className="inline-flex items-center gap-1 rounded-md bg-[#e8c547] px-3 py-2 text-sm font-medium text-black disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {isSavingProfile ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {profileNotice ? <p className="mt-2 text-sm text-zinc-300">{profileNotice}</p> : null}
      </section>

      <section className="rounded-xl border border-white/10 bg-zinc-950 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-100">Storage Usage</h2>
          <button
            type="button"
            onClick={() => void refreshStorageUsage()}
            disabled={isRefreshingStorage}
            className="inline-flex items-center gap-1 rounded-md border border-white/15 px-3 py-2 text-sm text-zinc-200 disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingStorage ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {storageUsage.map((entry) => (
            <article key={entry.bucket} className="rounded-lg border border-white/10 bg-black p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">{entry.bucket}</p>
              <p className="mt-2 text-sm text-zinc-200">Files: {entry.totalFiles}</p>
              <p className="text-sm text-zinc-400">Size: {formatBytes(entry.totalSize)}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Latest: {entry.files[0]?.name ?? "No files"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-rose-300/30 bg-rose-950/20 p-5">
        <h2 className="text-lg font-semibold text-rose-200">Danger Zone</h2>
        <p className="mt-1 text-sm text-rose-100/80">Sign out all active sessions for this admin account.</p>

        <button
          type="button"
          onClick={() => void logoutAllSessions()}
          disabled={isLoggingOutAll}
          className="mt-4 inline-flex items-center gap-1 rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-100 disabled:opacity-70"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOutAll ? "Logging out sessions..." : "Logout All Sessions"}
        </button>

        {dangerNotice ? <p className="mt-2 text-sm text-rose-100">{dangerNotice}</p> : null}
      </section>
    </div>
  );
}

export type { StorageUsage };
