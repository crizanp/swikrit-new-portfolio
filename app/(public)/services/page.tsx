import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard, Sparkles, Palette, Film, WandSparkles, Clock3 } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServicesProcess } from "@/components/sections/ServicesProcess";
import { TestimonialsCarousel } from "@/components/sections/TestimonialsCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";
import { getServices, getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Video editing, motion graphics, color grading, and post-production services by Swikrit Pokhrel for brands and creators.",
  keywords: [
    "video editing services",
    "motion graphics services",
    "After Effects freelancer",
    "commercial post production",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services - Swikrit Pokhrel",
    description: "Professional editing and motion services with fast delivery.",
    url: "/services",
    images: [buildOgImageUrl("Services")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services - Swikrit Pokhrel",
    description: "Professional editing and motion services with fast delivery.",
    images: [buildOgImageUrl("Services")],
  },
};

const servicesBreadcrumb = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
]);

export default async function ServicesPage() {
  const [services, testimonials] = await Promise.all([
    getServices(true),
    getTestimonials(true),
  ]);

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Swikrit Pokhrel - Video Editing and Motion Graphics",
    url: `${siteConfig.siteUrl}/services`,
    areaServed: "Worldwide",
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressLocality: "Nepal",
    },
    serviceType: services.map((service) => service.title),
    description:
      "Video editing, motion graphics, and post-production services for modern campaigns.",
  };

  const iconMap: Record<string, JSX.Element> = {
    clapperboard: <Clapperboard className="h-5 w-5" />,
    sparkles: <Sparkles className="h-5 w-5" />,
    palette: <Palette className="h-5 w-5" />,
    film: <Film className="h-5 w-5" />,
    vfx: <WandSparkles className="h-5 w-5" />,
  };

  return (
    <div className="space-y-12 pt-12">
      <JsonLd data={servicesBreadcrumb} />
      <JsonLd data={professionalServiceSchema} />
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Services</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Crafting cinematic stories frame by frame</h1>
        <p className="max-w-2xl text-muted-foreground">
          Individual edits or recurring creative partnerships tailored to campaign
          storytelling, platform formats, and delivery speed.
        </p>
      </section>

      <section className="container grid gap-4 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="border-border/70 bg-card/80">
            <CardHeader className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 text-brand">
                {iconMap[(service.icon ?? "").toLowerCase()] ?? <Clapperboard className="h-5 w-5" />}
              </div>
              <CardTitle>{service.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {service.description ?? "Tailored delivery for fast, polished storytelling."}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{service.price_range ?? "Custom quote"}</Badge>
                <Badge variant="outline" className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {service.delivery_days ?? 3} days
                </Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(service.features ?? []).map((feature) => (
                  <li key={`${service.id}-${feature}`} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="brand" className="w-full">
                <Link
                  href={`/contact?subject=${encodeURIComponent(`Quote request: ${service.title}`)}`}
                >
                  Get a Quote
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container">
        <ServicesProcess />
      </section>

      <section className="container space-y-4">
        <h2 className="text-2xl font-semibold sm:text-3xl">What Clients Say</h2>
        <TestimonialsCarousel testimonials={testimonials} />
      </section>
    </div>
  );
}
