"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/lib/types";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 4800);

    return () => {
      window.clearInterval(id);
    };
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[index];

  return (
    <div className="space-y-4">
      <Card className="border-border/70 bg-card/80">
        <CardContent className="space-y-4 p-6">
          <p className="text-base leading-relaxed text-muted-foreground">&ldquo;{current.content}&rdquo;</p>
          <div>
            <p className="font-medium">{current.client_name}</p>
            <p className="text-sm text-muted-foreground">
              {current.client_role ?? "Creative Partner"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {index + 1} / {testimonials.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIndex((current) => (current - 1 + testimonials.length) % testimonials.length)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIndex((current) => (current + 1) % testimonials.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
