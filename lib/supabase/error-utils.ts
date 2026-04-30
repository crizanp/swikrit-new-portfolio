import { NextResponse } from "next/server";

type SupabaseLikeError = {
  code?: string;
  message?: string;
};

function normalizeMessage(error: SupabaseLikeError | null | undefined) {
  return (error?.message ?? "").toLowerCase();
}

export function isSchemaNotReadyError(error: SupabaseLikeError | null | undefined) {
  const message = normalizeMessage(error);

  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    message.includes("could not find the table") ||
    message.includes("relation") && message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

export function schemaNotReadyWriteResponse(entityLabel: string) {
  return NextResponse.json(
    {
      error: `Database is not initialized for ${entityLabel}. Run Supabase migrations first.`,
      needsSetup: true,
    },
    { status: 503 }
  );
}
