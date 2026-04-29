"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

const processSteps = [
  {
    title: "Brief",
    description: "Understand campaign goals, platform targets, and audience behavior.",
  },
  {
    title: "Pre-production",
    description: "Organize assets, references, and motion direction before editing starts.",
  },
  {
    title: "Editing",
    description: "Build the story cut, pacing, sound, and visual rhythm for impact.",
  },
  {
    title: "Review",
    description: "Collaborative revision rounds focused on clarity and brand consistency.",
  },
  {
    title: "Delivery",
    description: "Platform-ready exports with clean versioning and handoff notes.",
  },
];

export function ServicesProcess() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        const targets = itemRefs.current.filter(Boolean) as HTMLDivElement[];

        animate(targets, {
          translateY: [24, 0],
          opacity: [0, 1],
          delay: stagger(110),
          duration: 580,
          ease: "out(3)",
        });

        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Process</p>
        <h2 className="text-2xl font-semibold sm:text-3xl">How Projects Move From Idea to Delivery</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {processSteps.map((step, index) => (
          <div
            key={step.title}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className="rounded-2xl border border-border/70 bg-card/70 p-4 opacity-0"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand">
              {index + 1}. {step.title}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
