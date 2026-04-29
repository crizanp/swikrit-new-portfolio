import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin Settings",
};

function maskSecret(value: string | undefined) {
  if (!value) {
    return "Missing";
  }

  if (value.length < 10) {
    return "Configured";
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Project Settings</h2>
        <p className="text-sm text-muted-foreground">
          Environment health and deployment-facing configuration summary.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 bg-card/70">
          <CardHeader>
            <CardTitle>Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Missing"}</p>
            <p>
              Anon Key: {maskSecret(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/70">
          <CardHeader>
            <CardTitle>Site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Public URL: {process.env.NEXT_PUBLIC_SITE_URL ?? "Missing"}</p>
            <p>Default Theme: Dark</p>
            <p>Framework: Next.js 14 (App Router)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
