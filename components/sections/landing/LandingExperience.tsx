"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "animejs";
import { ArrowDown, ArrowUpRight, MapPin, Sparkles, Star } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  createLenisSmoothScroll,
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  ScrollTrigger,
  splitTextWords,
} from "@/lib/animations/gsap";
import { createHeroThreeBackground } from "@/lib/animations/three-bg";
import type { PortfolioItem, Testimonial } from "@/lib/types";

interface LandingExperienceProps {
  featuredWork: PortfolioItem[];
  testimonials: Testimonial[];
}

const marqueeText =
  "VIDEO EDITING ✦ MOTION GRAPHICS ✦ AFTER EFFECTS ✦ COLOR GRADING ✦ VISUAL EFFECTS ✦ STORYTELLING ✦ PREMIERE PRO ✦ DAVINCI RESOLVE ✦ CINEMA 4D ✦";

const heroStats = [
  { value: 3, suffix: "+", label: "Years" },
  { value: 150, suffix: "+", label: "Projects" },
  { value: 12, suffix: "M+", label: "Views" },
];

const skills = [
  { label: "Adobe Premiere Pro", value: 98, icon: "🎬" },
  { label: "After Effects", value: 95, icon: "✨" },
  { label: "DaVinci Resolve", value: 92, icon: "🎨" },
  { label: "Cinema 4D", value: 80, icon: "🧊" },
  { label: "Adobe Audition", value: 85, icon: "🎧" },
  { label: "Photoshop / Illustrator", value: 90, icon: "🖌️" },
];

const serviceTeasers = [
  {
    icon: "🎥",
    title: "Video Editing",
    description: "Commercial cuts, social reels, and campaign stories with fast turnarounds.",
    price: "Starts at $220",
  },
  {
    icon: "⚡",
    title: "Motion Graphics",
    description: "Custom title systems, transitions, and branded animation kits.",
    price: "Starts at $300",
  },
  {
    icon: "🎞️",
    title: "Color Grading",
    description: "Balanced cinematic grades designed for platform consistency.",
    price: "Starts at $180",
  },
  {
    icon: "🧪",
    title: "After Effects VFX",
    description: "Stylized composites and visual polish for high-impact storytelling.",
    price: "Starts at $350",
  },
];

function resolveProjectLink(item: PortfolioItem) {
  return item.video_url ?? item.video_embed ?? "/work";
}

export function LandingExperience({ featuredWork, testimonials }: LandingExperienceProps) {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const threeCanvasHostRef = useRef<HTMLDivElement | null>(null);
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
  const testimonialTrackRef = useRef<HTMLDivElement | null>(null);
  const gradientHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const featuredItems = useMemo(() => {
    const filtered = featuredWork.filter((item) => item.is_featured !== false);
    const base = filtered.length > 0 ? filtered : featuredWork;

    if (base.length === 0) {
      return [] as PortfolioItem[];
    }

    const expanded: PortfolioItem[] = [...base];
    let index = 0;

    while (expanded.length < 6) {
      const source = base[index % base.length];
      expanded.push({ ...source, id: `${source.id}-clone-${index}` });
      index += 1;
    }

    return expanded.slice(0, 6);
  }, [featuredWork]);

  const testimonialItems = useMemo(() => {
    if (testimonials.length === 0) {
      return [] as Testimonial[];
    }

    return testimonials.length === 1 ? [...testimonials, ...testimonials] : testimonials;
  }, [testimonials]);

  useEffect(() => {
    registerGsapPlugins();
    const destroyLenis = createLenisSmoothScroll();

    return () => {
      destroyLenis();
    };
  }, []);

  useEffect(() => {
    const heroSection = heroSectionRef.current;
    const host = threeCanvasHostRef.current;

    if (!heroSection || !host || prefersReducedMotion()) {
      return;
    }

    return createHeroThreeBackground({
      canvasHost: host,
      scrollTriggerSection: heroSection,
    });
  }, []);

  useEffect(() => {
    const reduceMotion = prefersReducedMotion();
    const swikrit = swikritRef.current;
    const pokhrel = pokhrelRef.current;
    const subtitleText = subtitleTextRef.current;
    const subtitleCursor = subtitleCursorRef.current;
    const scrollIndicator = scrollIndicatorRef.current;

    if (!swikrit || !pokhrel || !subtitleText || !subtitleCursor) {
      return;
    }

    const subtitle = "AFTER EFFECTS ART";

    if (reduceMotion) {
      subtitleText.textContent = subtitle;
      subtitleCursor.style.opacity = "1";
      counterRefs.current.forEach((counter, index) => {
        if (counter) {
          counter.textContent = String(heroStats[index]?.value ?? 0);
        }
      });
      return;
    }

    const introTimeline = gsap.timeline({ defaults: { ease: "softReveal" } });
    introTimeline
      .from(swikrit, { xPercent: -35, autoAlpha: 0, duration: 0.9 })
      .from(pokhrel, { xPercent: 35, autoAlpha: 0, duration: 0.9 }, 0.04)
      .from(".hero-meta", { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.42);

    const typeState = { chars: 0 };
    const typing = animate(typeState, {
      chars: subtitle.length,
      round: 1,
      easing: "easeOutExpo",
      duration: 2200,
      delay: 350,
      update: () => {
        subtitleText.textContent = subtitle.slice(0, typeState.chars);
      },
    });

    const cursorBlink = animate(subtitleCursor, {
      opacity: [1, 0],
      direction: "alternate",
      loop: true,
      duration: 520,
      easing: "easeInOutSine",
    });

    const counterTweens = counterRefs.current.map((counter, index) => {
      if (!counter) {
        return null;
      }

      const target = heroStats[index]?.value ?? 0;
      const value = { current: 0 };

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
      typing.pause();
      cursorBlink.pause();
      counterTweens.forEach((tween) => tween?.kill());
      indicatorTween?.kill();
    };
  }, []);

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

    gsap.set(cards, { opacity: 0, y: 34 });

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
    const track = testimonialTrackRef.current;

    if (!track || prefersReducedMotion()) {
      return;
    }

    let speed = 0.55;
    let offset = 0;
    let loopWidth = track.scrollWidth / 2;

    const onResize = () => {
      loopWidth = track.scrollWidth / 2;
    };

    const onEnter = () => {
      speed = 0.18;
    };

    const onLeave = () => {
      speed = 0.55;
    };

    const ticker = () => {
      offset -= speed;
      if (Math.abs(offset) >= loopWidth) {
        offset = 0;
      }
      gsap.set(track, { x: offset });
    };

    const wrapper = track.parentElement;
    wrapper?.addEventListener("mouseenter", onEnter);
    wrapper?.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    gsap.ticker.add(ticker);

    return () => {
      wrapper?.removeEventListener("mouseenter", onEnter);
      wrapper?.removeEventListener("mouseleave", onLeave);
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
        className="relative isolate overflow-hidden pt-14 sm:pt-20"
        data-cursor-tone="dark"
      >
        <div
          ref={threeCanvasHostRef}
          className="pointer-events-none absolute inset-0 -z-10 opacity-85"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_8%,hsl(var(--brand)/0.24),transparent_34%),radial-gradient(circle_at_85%_15%,hsl(var(--brand)/0.12),transparent_28%),linear-gradient(180deg,hsl(var(--surface))_0%,hsl(var(--background))_48%)]" />

        <div className="container pb-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-border/70 bg-black/45 px-6 py-10 shadow-[0_0_0_1px_hsl(var(--border))_inset,0_30px_90px_-45px_hsl(var(--brand)/0.45)] backdrop-blur-xl sm:px-10 sm:py-14">
            <div className="hero-meta mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Available for work
            </div>

            <div className="space-y-2">
              <h1
                ref={swikritRef}
                className="font-heading text-5xl font-bold uppercase tracking-[0.12em] sm:text-7xl"
              >
                SWIKRIT
              </h1>
              <h1
                ref={pokhrelRef}
                className="font-heading text-5xl font-bold uppercase tracking-[0.12em] text-brand sm:text-7xl"
              >
                POKHREL
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
                Based in Nepal · Available Worldwide
              </span>
            </div>

            <div className="hero-meta mt-9 grid gap-3 sm:grid-cols-3">
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
                      0
                    </span>
                    <span>{stat.suffix}</span>
                  </p>
                  <p className="mt-1 text-sm uppercase tracking-[0.08em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="hero-meta mt-9 flex flex-wrap gap-3">
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
            className="mx-auto mt-8 flex w-fit flex-col items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground"
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
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <Badge variant="brand" className="mb-4 w-fit">
              Video Editor · Motion Designer
            </Badge>
            <h2
              ref={aboutHeadingRef}
              className="font-heading text-4xl font-bold leading-tight sm:text-5xl"
            >
              Hey, I&apos;m Swikrit Pokhrel
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              I craft high-energy edits and motion graphics for brands, artists, and
              agencies who want visual storytelling that actually moves people.
              My process is fast, collaborative, and built for modern distribution
              across paid and organic channels.
            </p>
          </div>

          <div className="relative mx-auto h-[420px] w-full max-w-sm">
            <div className="absolute inset-0 rounded-[1.8rem] border border-brand/40 bg-gradient-to-br from-brand/10 via-black/10 to-black/80 shadow-[0_0_55px_hsl(var(--brand)/0.35)]" />
            <div className="absolute inset-4 rounded-[1.4rem] border border-border/70 bg-gradient-to-br from-card via-surface to-black/90" />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="space-y-2 px-6">
                <p className="font-heading text-lg font-semibold text-brand">Photo Placeholder</p>
                <p className="text-sm text-muted-foreground">
                  Portrait / studio shot for Swikrit Pokhrel
                </p>
              </div>
            </div>
          </div>
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
            const hasImage = Boolean(item.thumbnail_url);

            return (
              <article
                key={`${item.id}-${index}`}
                className="featured-card group relative overflow-hidden rounded-2xl border border-border/70 bg-card"
              >
                <div className="relative h-64 overflow-hidden">
                  {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail_url as string}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,hsl(var(--brand)/0.35),transparent_35%),linear-gradient(130deg,hsl(var(--surface)),black)] transition-transform duration-500 group-hover:scale-110" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <MagneticButton
                      href={projectUrl}
                      variant="brand"
                      size="sm"
                      target={projectUrl.startsWith("http") ? "_blank" : undefined}
                      rel={projectUrl.startsWith("http") ? "noreferrer" : undefined}
                    >
                      View Project
                    </MagneticButton>
                    <ArrowUpRight className="h-5 w-5 text-white" />
                  </div>
                </div>

                <CardContent className="space-y-3 p-5">
                  <Badge variant="outline" className="w-fit capitalize">
                    {(item.category ?? "project").replaceAll("_", " ")}
                  </Badge>
                  <h4 className="font-heading text-xl font-semibold leading-tight">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.client ?? "Independent Client"}</p>
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {serviceTeasers.map((service) => (
            <div key={service.title} className="group [perspective:1200px]">
              <div className="relative h-72 w-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                <div className="absolute inset-0 rounded-2xl border border-border/70 bg-card/80 p-5 [backface-visibility:hidden]">
                  <div className="text-4xl" aria-hidden="true">
                    {service.icon}
                  </div>
                  <h4 className="mt-8 font-heading text-2xl font-semibold">{service.title}</h4>
                  <p className="mt-3 text-sm text-muted-foreground">Hover to explore details</p>
                </div>

                <div className="absolute inset-0 rounded-2xl border border-brand/35 bg-gradient-to-br from-brand/15 via-card to-surface p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <p className="mt-8 font-heading text-xl font-semibold text-brand">{service.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden pb-20" data-cursor-tone="dark">
        <div className="container mb-8">
          <h3 className="font-heading text-3xl font-bold sm:text-4xl">Testimonials</h3>
        </div>

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
      </section>

      <section className="relative isolate overflow-hidden bg-black py-20" data-cursor-tone="dark">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--brand)/0.2),transparent_45%),radial-gradient(circle_at_80%_40%,hsl(var(--brand)/0.16),transparent_38%)]" />

        <div className="container text-center">
          <h3
            ref={gradientHeadingRef}
            className="mx-auto max-w-4xl bg-[linear-gradient(90deg,#ffffff_0%,#e8c547_35%,#ffffff_70%,#e8c547_100%)] bg-[length:200%_100%] bg-clip-text font-heading text-4xl font-bold text-transparent sm:text-5xl lg:text-6xl"
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
              href="mailto:swikritpokhrel@gmail.com"
              className="rounded-lg border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              swikritpokhrel@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
