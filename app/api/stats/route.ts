import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("site_stats").select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const payload = (data ?? []).reduce<Record<string, string>>((acc, stat) => {
      acc[stat.stat_key] = stat.stat_value;
      return acc;
    }, {});

    return NextResponse.json({ data: payload }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to fetch site stats." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as {
      items?: Array<{
        stat_key?: string;
        stat_value?: string;
        display_label?: string;
      }>;
    };

    const items = (payload.items ?? [])
      .map((item) => ({
        stat_key: item.stat_key?.trim() ?? "",
        stat_value: item.stat_value?.trim() ?? "",
        display_label: item.display_label?.trim() || null,
        updated_at: new Date().toISOString(),
      }))
      .filter((item) => item.stat_key.length > 0);

    if (!items.length) {
      return NextResponse.json({ error: "No valid stats provided." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("site_stats")
      .upsert(items, { onConflict: "stat_key" })
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update site stats." }, { status: 500 });
  }
}
