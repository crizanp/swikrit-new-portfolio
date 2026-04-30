import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SupabaseStorageBucket =
  | "portfolio-videos"
  | "portfolio-images"
  | "blog-images"
  | "avatars";

const allowedBuckets = new Set<SupabaseStorageBucket>([
  "portfolio-videos",
  "portfolio-images",
  "blog-images",
  "avatars",
]);

export function isAllowedStorageBucket(bucket: string): bucket is SupabaseStorageBucket {
  return allowedBuckets.has(bucket as SupabaseStorageBucket);
}

function assertBucket(bucket: string): asserts bucket is SupabaseStorageBucket {
  if (!isAllowedStorageBucket(bucket)) {
    throw new Error("Bucket is not allowed.");
  }
}

function normalizeStorageErrorMessage(bucket: SupabaseStorageBucket, message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("bucket") && lower.includes("not found")) {
    return `Bucket '${bucket}' does not exist. Run latest Supabase migrations to create storage buckets.`;
  }

  if (lower.includes("row-level security") || lower.includes("permission denied")) {
    return "Storage permission denied. Add SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the server.";
  }

  return message;
}

export async function uploadFile(
  bucket: SupabaseStorageBucket,
  path: string,
  file: File
) {
  assertBucket(bucket);

  if (!path || path.includes("..")) {
    throw new Error("Invalid file path.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(normalizeStorageErrorMessage(bucket, error.message));
  }

  return getPublicUrl(bucket, path);
}

export async function deleteFile(bucket: SupabaseStorageBucket, path: string) {
  assertBucket(bucket);

  if (!path || path.includes("..")) {
    throw new Error("Invalid file path.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(normalizeStorageErrorMessage(bucket, error.message));
  }
}

export function getPublicUrl(bucket: SupabaseStorageBucket, path: string) {
  assertBucket(bucket);

  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
