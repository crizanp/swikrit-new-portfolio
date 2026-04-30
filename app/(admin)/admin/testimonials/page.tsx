import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { getTestimonials } from "@/lib/data";

export const metadata = {
  title: "Admin Testimonials",
};

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials(false);

  return <TestimonialsManager initialTestimonials={testimonials} />;
}
