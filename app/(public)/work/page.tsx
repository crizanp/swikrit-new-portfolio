import { FeaturedWorkSection } from "@/components/sections/featured-work-section";
import { getPortfolioItems } from "@/lib/data";

export const metadata = {
  title: "Work",
};

export default async function WorkPage() {
  const portfolioItems = await getPortfolioItems();

  return (
    <div className="space-y-10 pt-12">
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Portfolio</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Selected Projects</h1>
        <p className="max-w-2xl text-muted-foreground">
          A mix of commercial edits, music videos, social media content, and motion
          graphics systems delivered for modern distribution channels.
        </p>
      </section>

      <FeaturedWorkSection
        items={portfolioItems}
        title="Creative Reelboard"
        description="Real projects with measurable audience and brand outcomes."
        showViewAll={false}
      />
    </div>
  );
}
