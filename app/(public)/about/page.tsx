import { AboutSection } from "@/components/sections/about-section";
import { SocialGridSection } from "@/components/sections/social-grid-section";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteStats, getSocialPosts } from "@/lib/data";

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  const [stats, socialPosts] = await Promise.all([getSiteStats(), getSocialPosts(6)]);

  return (
    <div className="space-y-12 pt-12">
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">About</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Swikrit Pokhrel</h1>
        <p className="max-w-2xl text-muted-foreground">
          Professional video editor and motion graphics designer creating visual
          narratives for Nepal and international clients.
        </p>
      </section>

      <AboutSection />

      <section className="container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.id} className="border-border/80 bg-card/75">
              <CardContent className="p-5">
                <p className="font-heading text-3xl font-bold text-brand">
                  {stat.stat_value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.display_label ?? stat.stat_key}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <SocialGridSection posts={socialPosts} />
    </div>
  );
}
