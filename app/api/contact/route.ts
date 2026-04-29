import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      project_type?: string;
      budget?: string;
    };

    if (!payload.name || !payload.email || !payload.message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase.from("contact_inquiries").insert({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      project_type: payload.project_type,
      budget: payload.budget,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit inquiry." },
      { status: 500 }
    );
  }
}
