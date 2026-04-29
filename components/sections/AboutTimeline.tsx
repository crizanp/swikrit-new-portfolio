"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsapPlugins } from "@/lib/animations/gsap";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface AboutTimelineProps {
  items: TimelineItem[];
}

export function AboutTimeline({ items }: AboutTimelineProps) {
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    registerGsapPlugins();
    const targets = itemRefs.current.filter(Boolean) as HTMLLIElement[];

    if (targets.length === 0) {
      return;
    }

    const tween = gsap.fromTo(
      targets,
      { y: 24, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: targets[0],
          start: "top 82%",
        },
      }
    );

    return () => {
      tween.kill();
    };
  }, [items]);

  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li
          key={`${item.year}-${item.title}`}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          className="grid gap-2 rounded-2xl border border-border/70 bg-card/70 p-4 sm:grid-cols-[110px_1fr]"
        >
          <p className="font-heading text-xl font-semibold text-brand">{item.year}</p>
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
