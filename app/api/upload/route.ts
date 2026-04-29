import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedBuckets = new Set([
  "portfolio-videos",
  "portfolio-images",
  "blog-images",
  "avatars",
]);

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as {
      bucket?: string;
      path?: string;
    };

    if (!payload.bucket || !payload.path) {
      return NextResponse.json(
        { error: "Bucket and path are required." },
        { status: 400 }
      );
    }

    if (!allowedBuckets.has(payload.bucket)) {
      return NextResponse.json(
        { error: "Bucket is not allowed." },
        { status: 400 }
      );
    }

    if (payload.path.includes("..")) {
      return NextResponse.json({ error: "Invalid path." }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(payload.bucket)
      .createSignedUploadUrl(payload.path);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create upload url." },
      { status: 500 }
    );
  }
}
