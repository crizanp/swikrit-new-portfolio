import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const activeOnly = request.nextUrl.searchParams.get("active") !== "false";

    let query = supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch services." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as {
      title?: string;
      description?: string;
      icon?: string;
      price_range?: string;
      delivery_days?: number;
      features?: string[];
      is_active?: boolean;
      display_order?: number;
    };

    if (!payload.title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("services")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create service." },
      { status: 500 }
    );
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
      id?: string;
      title?: string;
      description?: string;
      icon?: string;
      price_range?: string;
      delivery_days?: number;
      features?: string[];
      is_active?: boolean;
      display_order?: number;
    };

    if (!payload.id) {
      return NextResponse.json({ error: "Service id is required." }, { status: 400 });
    }

    const { id, ...updatePayload } = payload;
    const { data, error } = await supabase
      .from("services")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update service." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as { id?: string };

    if (!payload.id) {
      return NextResponse.json({ error: "Service id is required." }, { status: 400 });
    }

    const { error } = await supabase.from("services").delete().eq("id", payload.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete service." }, { status: 500 });
  }
}
