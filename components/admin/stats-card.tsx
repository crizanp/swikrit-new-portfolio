import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <Card className="border-border/80 bg-card/70">
      <CardHeader className="pb-2">
        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl font-bold text-brand">{value}</p>
      </CardContent>
    </Card>
  );
}
