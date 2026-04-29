import { ServicesSection } from "@/components/sections/services-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { getServices, getTestimonials } from "@/lib/data";

export const metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const [services, testimonials] = await Promise.all([
    getServices(true),
    getTestimonials(true),
  ]);

  return (
    <div className="space-y-12 pt-12">
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Services</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Production Support</h1>
        <p className="max-w-2xl text-muted-foreground">
          Individual edits or recurring monthly support. Every package is tuned to your
          content pipeline and audience goals.
        </p>
      </section>

      <ServicesSection services={services} />
      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
}
