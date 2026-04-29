import { Badge } from "@/components/ui/badge";

interface AboutSectionProps {
  compact?: boolean;
}

export function AboutSection({ compact = false }: AboutSectionProps) {
  return (
    <section className="container">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit">
            About
          </Badge>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Editing with speed, intention, and brand clarity.
          </h2>
        </div>

        <div className="space-y-4 text-muted-foreground">
          <p>
            I am Swikrit Pokhrel, a professional video editor and motion graphics
            designer focused on commercial storytelling and short-form growth.
          </p>
          <p>
            My process balances narrative structure, rhythm, sound, and visual polish,
            so every frame supports your campaign goal, whether that is awareness,
            retention, or conversion.
          </p>
          {!compact ? (
            <p>
              I work remotely with clients worldwide and collaborate closely on creative
              direction, revision cycles, and delivery formats for each platform.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
