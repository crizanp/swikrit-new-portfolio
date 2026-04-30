import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { fallbackStats } from "@/lib/constants";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("site_stats").select("*");

    if (error) {
      if (isSchemaNotReadyError(error)) {
        const fallbackPayload = fallbackStats.reduce<Record<string, string>>((acc, stat) => {
          acc[stat.stat_key] = stat.stat_value;
          return acc;
        }, {});

        return NextResponse.json({ data: fallbackPayload }, { status: 200 });
      }

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
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as {
      items?: Array<{
        stat_key?: string;
        stat_value?: string;
        display_label?: string;
      }>;
    };

    const normalizedItems = (payload.items ?? [])
      .map((item) => ({
        stat_key: item.stat_key?.trim() ?? "",
        stat_value: item.stat_value?.trim() ?? "",
        display_label: item.display_label?.trim() || null,
        updated_at: new Date().toISOString(),
      }))
      .filter((item) => item.stat_key.length > 0);

    const itemMap = new Map<string, (typeof normalizedItems)[number]>();
    normalizedItems.forEach((item) => {
      // Last row wins when duplicate stat_key values are submitted.
      itemMap.set(item.stat_key, item);
    });

    const items = Array.from(itemMap.values());

    if (!items.length) {
      return NextResponse.json({ error: "No valid stats provided." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("site_stats")
      .upsert(items, { onConflict: "stat_key" })
      .select("*");

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("site stats");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update site stats." }, { status: 500 });
  }
}
