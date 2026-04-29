import { LandingExperience } from "@/components/sections/landing/LandingExperience";
import { getPortfolioItems, getTestimonials } from "@/lib/data";

export default async function HomePage() {
  const [featuredWork, testimonials] = await Promise.all([
    getPortfolioItems({ featuredOnly: true, limit: 6 }),
    getTestimonials(false),
  ]);

  return <LandingExperience featuredWork={featuredWork} testimonials={testimonials} />;
}
