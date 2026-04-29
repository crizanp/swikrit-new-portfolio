import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Testimonial } from "@/lib/types";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="container space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold sm:text-4xl">Client Feedback</h2>
        <p className="max-w-2xl text-muted-foreground">
          A few notes from teams and creators I have partnered with.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testimonials.map((item) => (
          <Card key={item.id} className="border-border/80 bg-card/70">
            <CardHeader>
              <p className="text-sm uppercase tracking-[0.08em] text-brand">
                {item.project_type ?? "Project"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                &ldquo;{item.content}&rdquo;
              </p>
              <div>
                <p className="font-medium">{item.client_name}</p>
                <p className="text-sm text-muted-foreground">{item.client_role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
