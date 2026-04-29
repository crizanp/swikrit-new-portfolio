import { Mail, MapPin, MessageSquareText } from "lucide-react";
import { ContactForm } from "@/components/sections/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="space-y-10 pt-12">
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Contact</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Let us build your next edit.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Share your project details and I will get back with timeline, scope, and next
          steps.
        </p>
      </section>

      <section className="container grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />

        <div className="space-y-4">
          <Card className="border-border/80 bg-card/75">
            <CardContent className="space-y-4 p-5">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Based in Nepal · Available Worldwide
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {siteConfig.email}
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquareText className="h-4 w-4" />
                Typical reply time: within 24 hours
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
