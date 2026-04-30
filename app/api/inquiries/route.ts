import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const unauthorized = await requireAdminAuth(request, supabase);

    if (unauthorized) {
      return unauthorized;
    }

    const status = request.nextUrl.searchParams.get("status");
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 100);

    let query = supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ data: [] }, { status: 200 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to fetch inquiries." }, { status: 500 });
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
      status?: "new" | "read" | "replied" | "archived";
    };

    if (!payload.id || !payload.status) {
      return NextResponse.json({ error: "Inquiry id and status are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("contact_inquiries")
      .update({ status: payload.status })
      .eq("id", payload.id)
      .select("*")
      .maybeSingle();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("contact inquiries");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update inquiry." }, { status: 500 });
  }
}
