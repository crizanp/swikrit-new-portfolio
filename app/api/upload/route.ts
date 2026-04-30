import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  isAllowedStorageBucket,
  uploadFile,
  type SupabaseStorageBucket,
} from "@/lib/supabase/storage";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const bucket = request.nextUrl.searchParams.get("bucket") ?? "";

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket query parameter is required." },
        { status: 400 }
      );
    }

    if (!isAllowedStorageBucket(bucket)) {
      return NextResponse.json(
        { error: "Bucket is not allowed." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const rawPath = (formData.get("path") as string | null) ?? "";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = rawPath || `${Date.now()}-${safeFileName}`;

    if (path.includes("..")) {
      return NextResponse.json({ error: "Invalid path." }, { status: 400 });
    }

    const publicUrl = await uploadFile(bucket as SupabaseStorageBucket, path, file);

    return NextResponse.json(
      {
        url: publicUrl,
        data: {
          bucket,
          path,
          publicUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
