import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(20),
  project_type: z.string().min(1),
  budget: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = contactSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message ?? "Invalid request payload." },
        { status: 400 }
      );
    }

    const payload = parseResult.data;

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

    console.log("New contact inquiry", {
      email: payload.email,
      subject: payload.subject,
      project_type: payload.project_type,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit inquiry." },
      { status: 500 }
    );
  }
}
