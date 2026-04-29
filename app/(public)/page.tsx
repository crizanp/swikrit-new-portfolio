import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { LandingExperience } from "@/components/sections/landing/LandingExperience";
import { createBreadcrumbJsonLd } from "@/lib/seo";
import { getPortfolioItems, getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Home",
};

const homeBreadcrumb = createBreadcrumbJsonLd([{ name: "Home", path: "/" }]);

export default async function HomePage() {
  const [featuredWork, testimonials] = await Promise.all([
    getPortfolioItems({ featuredOnly: true, limit: 6 }),
    getTestimonials(false),
  ]);

  return (
    <>
      <JsonLd data={homeBreadcrumb} />
      <LandingExperience featuredWork={featuredWork} testimonials={testimonials} />
    </>
  );
}
