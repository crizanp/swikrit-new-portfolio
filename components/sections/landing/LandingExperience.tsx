"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "animejs";
import { ArrowDown, ArrowUpRight, MapPin, Sparkles, Star } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  ScrollTrigger,
  splitTextWords,
} from "@/lib/animations/gsap";
import { resolvePortfolioThumbnailUrl } from "@/lib/portfolio-media";
import type { ProfileSettings } from "@/lib/site-settings";
import type { PortfolioItem, Service, Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

const HeroBg = dynamic(
  () => import("@/components/three/HeroBg").then((module) => module.HeroBg),
  { ssr: false }
);

interface LandingExperienceProps {
  featuredWork: PortfolioItem[];
  testimonials: Testimonial[];
  services: Service[];
  statsByKey: Record<string, string>;
  profile: ProfileSettings;
}

const marqueeText =
  "VIDEO EDITING ✦ MOTION GRAPHICS ✦ AFTER EFFECTS ✦ COLOR GRADING ✦ VISUAL EFFECTS ✦ STORYTELLING ✦ PREMIERE PRO ✦ DAVINCI RESOLVE ✦ CINEMA 4D ✦";

const skills = [
  { label: "Adobe Premiere Pro", value: 98, icon: "🎬" },
  { label: "After Effects", value: 95, icon: "✨" },
  { label: "DaVinci Resolve", value: 92, icon: "🎨" },
  { label: "Cinema 4D", value: 80, icon: "🧊" },
  { label: "Adobe Audition", value: 85, icon: "🎧" },
  { label: "Photoshop / Illustrator", value: 90, icon: "🖌️" },
];

const serviceThemes = [
  {
    front: "border-[#7c3aed]/35 bg-gradient-to-br from-[#7c3aed]/20 via-card/90 to-card",
    back: "border-[#7c3aed]/40 bg-gradient-to-br from-[#7c3aed]/20 via-card to-surface",
  },
  {
    front: "border-[#2563eb]/35 bg-gradient-to-br from-[#2563eb]/18 via-card/90 to-card",
    back: "border-[#2563eb]/40 bg-gradient-to-br from-[#2563eb]/22 via-card to-surface",
  },
  {
    front: "border-[#0ea5a4]/35 bg-gradient-to-br from-[#0ea5a4]/18 via-card/90 to-card",
    back: "border-[#0ea5a4]/40 bg-gradient-to-br from-[#0ea5a4]/20 via-card to-surface",
  },
  {
    front: "border-[#f59e0b]/35 bg-gradient-to-br from-[#f59e0b]/20 via-card/90 to-card",
    back: "border-[#f59e0b]/40 bg-gradient-to-br from-[#f59e0b]/25 via-card to-surface",
  },
] as const;

function parseStatValue(rawValue: string | undefined, fallbackValue: number, fallbackSuffix: string) {
  const normalized = rawValue?.trim();

  if (!normalized) {
    return { value: fallbackValue, suffix: fallbackSuffix };
  }

  const parts = normalized.match(/^(\d+(?:\.\d+)?)(.*)$/);

  if (!parts) {
    return { value: fallbackValue, suffix: fallbackSuffix };
  }

  const numericValue = Number(parts[1]);

  if (!Number.isFinite(numericValue)) {
    return { value: fallbackValue, suffix: fallbackSuffix };
  }

  return {
    value: numericValue,
    suffix: parts[2] ?? "",
  };
}

function isLikelyEmoji(value: string) {
  return Array.from(value).some((char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    return codePoint >= 0x1f000;
  });
}

function resolveServiceGlyph(icon: string | null | undefined) {
  const normalized = icon?.trim() ?? "";

  if (!normalized) {
    return "🎬";
  }

  if (isLikelyEmoji(normalized)) {
    return normalized;
  }

  const token = normalized.toLowerCase();
  const iconMap: Record<string, string> = {
    clapperboard: "🎬",
    sparkles: "✨",
    palette: "🎨",
    film: "🎞️",
    vfx: "🧪",
    wandsparkles: "🪄",
    "wand-sparkles": "🪄",
    smartphone: "📱",
    mobile: "📱",
    phone: "📱",
    video: "🎥",
    scissors: "✂️",
  };

  return iconMap[token] ?? "🎬";
}

function resolveProjectLink(item: PortfolioItem) {
  return item.video_url ?? item.video_embed ?? `/work/${item.id}`;
}

export function LandingExperience({
  featuredWork,
  testimonials,
  services,
  statsByKey,
  profile,
}: LandingExperienceProps) {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const swikritRef = useRef<HTMLHeadingElement | null>(null);
  const pokhrelRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleTextRef = useRef<HTMLSpanElement | null>(null);
  const subtitleCursorRef = useRef<HTMLSpanElement | null>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const marqueeRowOneRef = useRef<HTMLDivElement | null>(null);
  const marqueeRowTwoRef = useRef<HTMLDivElement | null>(null);
  const aboutHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const skillFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featuredGridRef = useRef<HTMLDivElement | null>(null);
  const testimonialSectionRef = useRef<HTMLElement | null>(null);
  const testimonialTrackRef = useRef<HTMLDivElement | null>(null);
  const gradientHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const testimonialStoppedRef = useRef(false);

  const nameParts = profile.display_name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const firstName = (nameParts[0] ?? "Swikrit").toUpperCase();
  const lastName = (nameParts.slice(1).join(" ") || "Pokhrel").toUpperCase();
  const subtitleLabel = profile.title.toUpperCase();

  const heroStats = useMemo(
    () => [
      {
        ...parseStatValue(statsByKey.years_experience, 3, "+"),
        label: "Years",
      },
      {
        ...parseStatValue(statsByKey.projects_done, 150, "+"),
        label: "Projects",
      },
      {
        ...parseStatValue(statsByKey.views_generated, 12, "M+"),
        label: "Views",
      },
    ],
    [statsByKey]
  );

  const serviceTeasers = useMemo(
    () =>
      services
        .filter((service) => service.is_active !== false)
        .slice(0, 4)
        .map((service, index) => ({
          id: service.id,
          icon: resolveServiceGlyph(service.icon),
          title: service.title,
          description:
            service.description ??
            "Tailored delivery for high-impact content and campaign storytelling.",
          price: service.price_range ?? "Custom Quote",
          theme: serviceThemes[index % serviceThemes.length],
        })),
    [services]
  );

  const featuredItems = useMemo(() => {
    const filtered = featuredWork.filter((item) => item.is_featured !== false);
    const base = filtered.length > 0 ? filtered : featuredWork;

    return base.slice(0, 6);
  }, [featuredWork]);

  const testimonialItems = useMemo(() => {
    if (testimonials.length === 0) {
      return [] as Testimonial[];
    }

    return testimonials.length === 1 ? [...testimonials, ...testimonials] : testimonials;
  }, [testimonials]);

  useEffect(() => {
    registerGsapPlugins();
  }, []);

  useEffect(() => {
    const reduceMotion = prefersReducedMotion();
    const heroSection = heroSectionRef.current;
    const swikrit = swikritRef.current;
    const pokhrel = pokhrelRef.current;
    const subtitleText = subtitleTextRef.current;
    const subtitleCursor = subtitleCursorRef.current;
    const scrollIndicator = scrollIndicatorRef.current;
    const counterNodes = counterRefs.current;

    if (!heroSection || !swikrit || !pokhrel || !subtitleText || !subtitleCursor) {
      return;
    }

    const subtitle = subtitleLabel;
    const heroMetaItems = Array.from(
      heroSection.querySelectorAll<HTMLElement>(".hero-meta")
    );

    if (reduceMotion) {
      subtitleText.textContent = subtitle;
      subtitleCursor.style.opacity = "1";
      counterNodes.forEach((counter, index) => {
        if (counter) {
          counter.textContent = String(heroStats[index]?.value ?? 0);
        }
      });
      return;
    }

    const introTimeline = gsap.timeline({ defaults: { ease: "softReveal" } });
    introTimeline
      .fromTo(
        swikrit,
        { x: -48, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.72 }
      )
      .fromTo(
        pokhrel,
        { x: 48, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.72 },
        0.05
      )
      .fromTo(
        heroMetaItems,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
        },
        0.24
      );

    subtitleText.textContent = "";
    const typeState = { chars: 0 };
    const typing = gsap.to(typeState, {
      chars: subtitle.length,
      ease: "none",
      duration: 1.2,
      delay: 0.35,
      onUpdate: () => {
        subtitleText.textContent = subtitle.slice(0, Math.round(typeState.chars));
      },
    });

    const cursorBlink = gsap.to(subtitleCursor, {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.45,
      ease: "none",
    });

    const counterTweens = counterNodes.map((counter, index) => {
      if (!counter) {
        return null;
      }

      const target = heroStats[index]?.value ?? 0;
      const value = { current: 0 };
      counter.textContent = "0";

      return gsap.to(value, {
        current: target,
        delay: 0.45 + index * 0.12,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: () => {
          counter.textContent = String(Math.round(value.current));
        },
      });
    });

    const indicatorTween = scrollIndicator
      ? gsap.to(scrollIndicator, {
          y: 12,
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      : null;

    return () => {
      introTimeline.kill();
      typing.kill();
      cursorBlink.kill();
      counterTweens.forEach((tween) => tween?.kill());
      indicatorTween?.kill();

      subtitleText.textContent = subtitle;
      subtitleCursor.style.opacity = "1";
      gsap.set([swikrit, pokhrel], { x: 0, opacity: 1 });
      gsap.set(heroMetaItems, { y: 0, opacity: 1 });

      counterNodes.forEach((counter, index) => {
        if (counter) {
          counter.textContent = String(heroStats[index]?.value ?? 0);
        }
      });
    };
  }, [heroStats, subtitleLabel]);

  useEffect(() => {
    const reduceMotion = prefersReducedMotion();
    const rowOne = marqueeRowOneRef.current;
    const rowTwo = marqueeRowTwoRef.current;

    if (!rowOne || !rowTwo || reduceMotion) {
      return;
    }

    const tweens = [
      gsap.fromTo(
        rowOne,
        { xPercent: 0 },
        { xPercent: -50, duration: 30, repeat: -1, ease: "none" }
      ),
      gsap.fromTo(
        rowTwo,
        { xPercent: -50 },
        { xPercent: 0, duration: 32, repeat: -1, ease: "none" }
      ),
    ];

    const wrappers = [rowOne.parentElement, rowTwo.parentElement].filter(
      Boolean
    ) as HTMLElement[];

    const pause = () => {
      tweens.forEach((tween) => tween.pause());
    };

    const resume = () => {
      tweens.forEach((tween) => tween.resume());
    };

    wrappers.forEach((wrapper) => {
      wrapper.addEventListener("mouseenter", pause);
      wrapper.addEventListener("mouseleave", resume);
    });

    return () => {
      wrappers.forEach((wrapper) => {
        wrapper.removeEventListener("mouseenter", pause);
        wrapper.removeEventListener("mouseleave", resume);
      });
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  useEffect(() => {
    const heading = aboutHeadingRef.current;

    if (!heading || prefersReducedMotion()) {
      return;
    }

    const words = splitTextWords(heading);

    const tween = gsap.from(words, {
      yPercent: 115,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.075,
      scrollTrigger: {
        trigger: heading,
        start: "top 82%",
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    const reduceMotion = prefersReducedMotion();

    if (reduceMotion) {
      skillFillRefs.current.forEach((fill, index) => {
        if (fill) {
          fill.style.width = `${skills[index]?.value ?? 0}%`;
        }
      });
      return;
    }

    const tweens = skillFillRefs.current.map((fill, index) => {
      if (!fill) {
        return null;
      }

      return gsap.to(fill, {
        width: `${skills[index]?.value ?? 0}%`,
        duration: 1.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: fill,
          start: "top 88%",
          once: true,
        },
      });
    });

    return () => {
      tweens.forEach((tween) => tween?.kill());
    };
  }, []);

  useEffect(() => {
    const grid = featuredGridRef.current;

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".featured-card"));

    if (cards.length === 0 || prefersReducedMotion()) {
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
      });
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: grid,
      start: "top 78%",
      once: true,
      onEnter: () => {
        animate(cards, {
          opacity: [0, 1],
          translateY: [34, 0],
          duration: 860,
          delay: stagger(90),
          easing: "easeOutExpo",
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [featuredItems.length]);

  useEffect(() => {
    testimonialStoppedRef.current = false;
  }, [testimonialItems.length]);

  useEffect(() => {
    const track = testimonialTrackRef.current;
    const section = testimonialSectionRef.current;

    if (!track || !section || prefersReducedMotion()) {
      return;
    }

    let speed = 0.55;
    let offset = 0;
    let loopWidth = track.scrollWidth / 2;
    let isActive = false;

    const onResize = () => {
      loopWidth = track.scrollWidth / 2;
    };

    const onEnter = () => {
      if (!testimonialStoppedRef.current && isActive) {
        speed = 0.18;
      }
    };

    const onLeave = () => {
      if (!testimonialStoppedRef.current && isActive) {
        speed = 0.55;
      }
    };

    const onClickStop = () => {
      testimonialStoppedRef.current = true;
      isActive = false;
    };

    const ticker = () => {
      if (!isActive || testimonialStoppedRef.current) {
        return;
      }

      offset -= speed;
      if (Math.abs(offset) >= loopWidth) {
        offset = 0;
      }
      gsap.set(track, { x: offset });
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 78%",
      end: "bottom 22%",
      onEnter: () => {
        if (!testimonialStoppedRef.current) {
          isActive = true;
          speed = 0.55;
        }
      },
      onEnterBack: () => {
        if (!testimonialStoppedRef.current) {
          isActive = true;
          speed = 0.55;
        }
      },
      onLeave: () => {
        isActive = false;
      },
      onLeaveBack: () => {
        isActive = false;
      },
    });

    const wrapper = track.parentElement;
    wrapper?.addEventListener("mouseenter", onEnter);
    wrapper?.addEventListener("mouseleave", onLeave);
    wrapper?.addEventListener("click", onClickStop);
    window.addEventListener("resize", onResize);
    gsap.ticker.add(ticker);

    return () => {
      trigger.kill();
      wrapper?.removeEventListener("mouseenter", onEnter);
      wrapper?.removeEventListener("mouseleave", onLeave);
      wrapper?.removeEventListener("click", onClickStop);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(ticker);
    };
  }, [testimonialItems.length]);

  useEffect(() => {
    const heading = gradientHeadingRef.current;

    if (!heading || prefersReducedMotion()) {
      return;
    }

    const tween = gsap.to(heading, {
      backgroundPositionX: "200%",
      duration: 5,
      repeat: -1,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div className="relative" data-cursor-tone="dark">
      <section
        ref={heroSectionRef}
        className="relative isolate flex min-h-[calc(100svh-5rem)] items-center overflow-hidden py-4 sm:py-6"
        data-cursor-tone="dark"
      >
        <HeroBg
          sectionRef={heroSectionRef}
          className="pointer-events-none absolute inset-0 -z-10 opacity-45 dark:opacity-85"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 dark:hidden bg-[radial-gradient(circle_at_10%_8%,hsl(var(--brand)/0.2),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.75),transparent_40%),linear-gradient(180deg,#f4f2ff_0%,hsl(var(--background))_56%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block bg-[radial-gradient(circle_at_10%_8%,hsl(var(--brand)/0.24),transparent_34%),radial-gradient(circle_at_85%_15%,hsl(var(--brand)/0.12),transparent_28%),linear-gradient(180deg,hsl(var(--surface))_0%,hsl(var(--background))_48%)]" />

        <div className="container py-4 sm:py-6">
          <div className="mx-auto w-full rounded-[2rem] border border-brand/20 bg-white/78 px-5 py-8 shadow-[0_0_0_1px_hsl(var(--border))_inset,0_30px_90px_-45px_hsl(var(--brand)/0.28)] backdrop-blur-xl dark:border-border/70 dark:bg-black/45 dark:shadow-[0_0_0_1px_hsl(var(--border))_inset,0_30px_90px_-45px_hsl(var(--brand)/0.45)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="hero-meta mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Available for work
            </div>

            <div className="space-y-2">
              <h1
                ref={swikritRef}
                className="font-heading text-4xl font-bold uppercase tracking-[0.12em] sm:text-6xl lg:text-7xl"
              >
                {firstName}
              </h1>
              <h1
                ref={pokhrelRef}
                className="font-heading text-4xl font-bold uppercase tracking-[0.12em] text-brand sm:text-6xl lg:text-7xl"
              >
                {lastName}
              </h1>
            </div>

            <p className="hero-meta mt-6 text-lg font-semibold tracking-[0.16em] text-muted-foreground sm:text-xl">
              <span ref={subtitleTextRef} />
              <span ref={subtitleCursorRef} className="ml-0.5 text-brand">
                |
              </span>
            </p>

            <div className="hero-meta mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand" />
                {profile.location_label}
              </span>
            </div>

            <div className="hero-meta mt-7 grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/70 bg-background/55 p-4"
                >
                  <p className="font-heading text-3xl font-bold text-brand sm:text-4xl">
                    <span
                      ref={(node) => {
                        counterRefs.current[index] = node;
                      }}
                    >
                      {stat.value}
                    </span>
                    <span>{stat.suffix}</span>
                  </p>
                  <p className="mt-1 text-sm uppercase tracking-[0.08em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="hero-meta mt-7 flex flex-wrap gap-3">
              <MagneticButton href="/work" variant="brand" size="lg">
                My Work
              </MagneticButton>
              <MagneticButton href="/contact" variant="outline" size="lg">
                Get In Touch
              </MagneticButton>
            </div>
          </div>

          <div
            ref={scrollIndicatorRef}
            className="mx-auto mt-5 hidden w-fit flex-col items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground 2xl:flex"
          >
            Scroll
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-black py-5" data-cursor-tone="dark">
        <div className="overflow-hidden py-1">
          <div ref={marqueeRowOneRef} className="flex min-w-max gap-6 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={`marquee-top-${index}`}>{marqueeText}</span>
            ))}
          </div>
        </div>
        <div className="mt-2 overflow-hidden py-1">
          <div ref={marqueeRowTwoRef} className="flex min-w-max gap-6 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={`marquee-bottom-${index}`}>{marqueeText}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20" data-cursor-tone="dark">
        <div
          className={cn(
            "grid gap-8 lg:items-start",
            profile.about_portrait_url ? "lg:grid-cols-[1.15fr_0.85fr]" : "lg:grid-cols-1"
          )}
        >
          <div>
            <Badge variant="brand" className="mb-4 w-fit">
              Video Editor · Motion Designer
            </Badge>
            <h2
              ref={aboutHeadingRef}
              className="font-heading text-4xl font-bold leading-tight sm:text-5xl"
            >
              Hey, I&apos;m {profile.display_name}
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              {profile.bio}
            </p>
          </div>

          {profile.about_portrait_url ? (
            <div className="relative mx-auto h-[420px] w-full max-w-sm">
              <div className="absolute inset-0 rounded-[1.8rem] border border-brand/40 bg-gradient-to-br from-brand/10 via-black/10 to-black/80 shadow-[0_0_55px_hsl(var(--brand)/0.35)]" />
              <div className="absolute inset-4 rounded-[1.4rem] border border-border/70 bg-gradient-to-br from-card via-surface to-black/90" />
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="space-y-2 px-6">
                  <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-full border border-border/70">
                    <Image
                      src={profile.about_portrait_url}
                      alt={`${profile.display_name} portrait`}
                      fill
                      sizes="192px"
                      className="object-cover object-top"
                    />
                  </div>
                  <p className="text-sm italic text-muted-foreground">
                    &ldquo;{profile.about_intro}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="container pb-20" data-cursor-tone="dark">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h3 className="font-heading text-3xl font-bold sm:text-4xl">Skills & Tools</h3>
          <Sparkles className="h-5 w-5 text-brand" />
        </div>

        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={skill.label} className="rounded-2xl border border-border/70 bg-card/65 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="inline-flex items-center gap-2 font-medium">
                  <span className="text-lg" aria-hidden="true">
                    {skill.icon}
                  </span>
                  {skill.label}
                </p>
                <span className="text-sm font-semibold text-brand">{skill.value}%</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/90">
                <div
                  ref={(node) => {
                    skillFillRefs.current[index] = node;
                  }}
                  className="absolute inset-y-0 left-0 w-0 rounded-full bg-brand"
                >
                  <span className="absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="featured-work" className="container pb-20" data-cursor-tone="dark">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-brand">Featured Work</p>
            <h3 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
              Campaign-ready edits and motion systems
            </h3>
          </div>
          <MagneticButton href="/work" variant="outline">
            Explore Full Portfolio
          </MagneticButton>
        </div>

        <div ref={featuredGridRef} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredItems.map((item, index) => {
            const projectUrl = resolveProjectLink(item);
            const thumbnailUrl = resolvePortfolioThumbnailUrl(item);
            const isExternal = projectUrl.startsWith("http");

            return (
              <article
                key={`${item.id}-${index}`}
                className="featured-card group relative overflow-hidden rounded-2xl border border-border/70 bg-card"
              >
                {thumbnailUrl ? (
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={thumbnailUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1280px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <MagneticButton
                        href={projectUrl}
                        variant="brand"
                        size="sm"
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                      >
                        View Project
                      </MagneticButton>
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ) : null}

                <CardContent className="space-y-3 p-5">
                  <Badge variant="outline" className="w-fit capitalize">
                    {(item.category ?? "project").replaceAll("_", " ")}
                  </Badge>
                  <h4 className="font-heading text-xl font-semibold leading-tight">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.client ?? "Independent Client"}</p>
                  {!thumbnailUrl ? (
                    <MagneticButton
                      href={projectUrl}
                      variant="outline"
                      size="sm"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                    >
                      View Project
                    </MagneticButton>
                  ) : null}
                </CardContent>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container pb-20" data-cursor-tone="dark">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-heading text-3xl font-bold sm:text-4xl">Services Teaser</h3>
          <MagneticButton href="/services" variant="outline">
            See All Services
          </MagneticButton>
        </div>

        {serviceTeasers.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {serviceTeasers.map((service) => (
              <div key={service.id} className="group [perspective:1200px]">
                <div className="relative h-72 w-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 text-center [backface-visibility:hidden]",
                      service.theme.front
                    )}
                  >
                    <div className="text-4xl" aria-hidden="true">
                      {service.icon}
                    </div>
                    <h4 className="mt-4 font-heading text-2xl font-semibold">{service.title}</h4>
                  </div>

                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col justify-center rounded-2xl p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                      service.theme.back
                    )}
                  >
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="mt-8 font-heading text-xl font-semibold text-brand">{service.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-8 text-center text-sm text-muted-foreground">
            Services will appear here after you add them in the admin panel.
          </div>
        )}
      </section>

      <section ref={testimonialSectionRef} className="overflow-hidden pb-20" data-cursor-tone="dark">
        <div className="container mb-8">
          <h3 className="font-heading text-3xl font-bold sm:text-4xl">Testimonials</h3>
        </div>

        {testimonialItems.length > 0 ? (
          <div className="relative overflow-hidden">
            <div ref={testimonialTrackRef} className="flex w-max gap-5 px-4 md:px-8">
              {[...testimonialItems, ...testimonialItems].map((item, index) => (
                <Card
                  key={`${item.id}-${index}`}
                  className="w-[320px] shrink-0 border-border/70 bg-card/80"
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-1 text-brand">
                      {Array.from({ length: item.rating ?? 5 }).map((_, i) => (
                        <Star key={`${item.id}-star-${i}`} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">&ldquo;{item.content}&rdquo;</p>
                    <div>
                      <p className="font-semibold">{item.client_name}</p>
                      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        {item.client_role ?? "Client"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="container">
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 p-8 text-center text-sm text-muted-foreground">
              Testimonials will appear here after you add them in the admin panel.
            </div>
          </div>
        )}
      </section>

      <section className="relative isolate overflow-hidden bg-black py-20" data-cursor-tone="dark">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--brand)/0.2),transparent_45%),radial-gradient(circle_at_80%_40%,hsl(var(--brand)/0.16),transparent_38%)]" />

        <div className="container text-center">
          <h3
            ref={gradientHeadingRef}
            className="mx-auto max-w-4xl bg-[linear-gradient(90deg,#ffffff_0%,#8b5cf6_35%,#ffffff_70%,#8b5cf6_100%)] bg-[length:200%_100%] bg-clip-text font-heading text-4xl font-bold text-transparent sm:text-5xl lg:text-6xl"
          >
            Let&apos;s Create Something ✦ Cinematic
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Currently available for freelance projects
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton href="/contact" variant="brand" size="lg">
              Get In Touch
            </MagneticButton>
            <a
              href={`mailto:${profile.contact_email}`}
              className="rounded-lg border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              {profile.contact_email}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
