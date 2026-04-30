import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth/server";
import { fallbackTestimonials } from "@/lib/constants";
import {
  isSchemaNotReadyError,
  schemaNotReadyWriteResponse,
} from "@/lib/supabase/error-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const featuredOnly = request.nextUrl.searchParams.get("featured") === "true";

    let query = supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }

    const { data, error } = await query;

    if (error) {
      if (isSchemaNotReadyError(error)) {
        const fallback = featuredOnly
          ? fallbackTestimonials.filter((item) => item.is_featured)
          : fallbackTestimonials;
        return NextResponse.json({ data: fallback }, { status: 200 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch testimonials." },
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
      client_name?: string;
      client_role?: string;
      client_avatar?: string;
      content?: string;
      rating?: number;
      project_type?: string;
      is_featured?: boolean;
    };

    if (!payload.client_name || !payload.content) {
      return NextResponse.json(
        { error: "Client name and testimonial content are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("testimonials");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create testimonial." },
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
      client_name?: string;
      client_role?: string;
      client_avatar?: string;
      content?: string;
      rating?: number;
      project_type?: string;
      is_featured?: boolean;
    };

    if (!payload.id) {
      return NextResponse.json({ error: "Testimonial id is required." }, { status: 400 });
    }

    const { id, ...updatePayload } = payload;
    const { data, error } = await supabase
      .from("testimonials")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("testimonials");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update testimonial." }, { status: 500 });
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
      return NextResponse.json({ error: "Testimonial id is required." }, { status: 400 });
    }

    const { error } = await supabase.from("testimonials").delete().eq("id", payload.id);

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return schemaNotReadyWriteResponse("testimonials");
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete testimonial." }, { status: 500 });
  }
}
