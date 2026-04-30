import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { LandingExperience } from "@/components/sections/landing/LandingExperience";
import { createBreadcrumbJsonLd } from "@/lib/seo";
import {
  getPortfolioItems,
  getPublicSiteSettings,
  getServices,
  getSiteStats,
  getTestimonials,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Home",
};

const homeBreadcrumb = createBreadcrumbJsonLd([{ name: "Home", path: "/" }]);

export default async function HomePage() {
  const [featuredWork, testimonials, services, stats, publicSettings] = await Promise.all([
    getPortfolioItems({ featuredOnly: true, limit: 6 }),
    getTestimonials(false),
    getServices(true),
    getSiteStats(),
    getPublicSiteSettings(),
  ]);

  const statsByKey = stats.reduce<Record<string, string>>((acc, stat) => {
    acc[stat.stat_key] = stat.stat_value;
    return acc;
  }, {});

  return (
    <>
      <JsonLd data={homeBreadcrumb} />
      <LandingExperience
        featuredWork={featuredWork}
        testimonials={testimonials}
        services={services}
        statsByKey={statsByKey}
        profile={publicSettings.profile}
      />
    </>
  );
}
