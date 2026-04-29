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

function assertBucket(bucket: string): asserts bucket is SupabaseStorageBucket {
  if (!allowedBuckets.has(bucket as SupabaseStorageBucket)) {
    throw new Error("Bucket is not allowed.");
  }
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

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  return getPublicUrl(bucket, path);
}

export async function deleteFile(bucket: SupabaseStorageBucket, path: string) {
  assertBucket(bucket);

  if (!path || path.includes("..")) {
    throw new Error("Invalid file path.");
  }

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}

export function getPublicUrl(bucket: SupabaseStorageBucket, path: string) {
  assertBucket(bucket);

  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
