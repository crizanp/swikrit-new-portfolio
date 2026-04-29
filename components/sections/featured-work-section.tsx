import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioItem } from "@/lib/types";

interface FeaturedWorkSectionProps {
  items: PortfolioItem[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
}

export function FeaturedWorkSection({
  items,
  title = "Featured Work",
  description = "Selected edits and motion projects designed for performance and storytelling.",
  showViewAll = true,
}: FeaturedWorkSectionProps) {
  return (
    <section className="container space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        </div>
        {showViewAll ? (
          <Button asChild variant="outline">
            <Link href="/work">View All Work</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden border-border/80 bg-card/75">
            <div className="relative h-44 bg-gradient-to-br from-brand/30 via-background to-background">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,hsl(var(--brand)/0.4),transparent_45%)]" />
              <div className="absolute bottom-3 left-3">
                <Badge variant="brand">{(item.category ?? "project").replace("_", " ")}</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription>{item.description ?? "No description provided."}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {item.client ?? "Independent Project"}
              </p>
              <Link
                href={item.video_url ?? item.video_embed ?? "/work"}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand"
                target={item.video_url || item.video_embed ? "_blank" : undefined}
                rel={item.video_url || item.video_embed ? "noreferrer" : undefined}
              >
                Watch
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
