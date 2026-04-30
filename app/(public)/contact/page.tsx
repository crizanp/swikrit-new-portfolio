import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageSquareText, Music2 } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/sections/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicSiteSettings } from "@/lib/data";
import { buildOgImageUrl, createBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Swikrit Pokhrel for video editing, motion graphics, and post-production collaboration.",
  keywords: [
    "contact video editor",
    "hire motion graphics designer",
    "freelance editor Nepal",
    "Swikrit Pokhrel contact",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact - Swikrit Pokhrel",
    description: "Share your project details and get a response within 24 hours.",
    url: "/contact",
    images: [buildOgImageUrl("Contact")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact - Swikrit Pokhrel",
    description: "Share your project details and get a response within 24 hours.",
    images: [buildOgImageUrl("Contact")],
  },
};

const contactBreadcrumb = createBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
]);

interface ContactPageProps {
  searchParams?: {
    subject?: string;
  };
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const initialSubject = searchParams?.subject ?? "";
  const { profile, social } = await getPublicSiteSettings();

  return (
    <div className="space-y-10 pt-12">
      <JsonLd data={contactBreadcrumb} />
      <section className="container space-y-4">
        <p className="text-sm uppercase tracking-[0.12em] text-brand">Contact</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Let us build your next edit.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Share your project details and I will get back with timeline, scope, and next
          steps.
        </p>
      </section>

      <section className="container grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm initialSubject={initialSubject} />

        <div className="space-y-4">
          <Card className="border-border/80 bg-card/75">
            <CardContent className="space-y-4 p-5">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location_label}
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profile.contact_email}
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquareText className="h-4 w-4" />
                Typical reply time: {profile.contact_reply_time}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/75">
            <CardContent className="space-y-3 p-5 text-sm">
              <p className="font-medium">Reach directly</p>
              <Link href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4" />
                {profile.contact_email}
              </Link>
              <Link href={social.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="h-4 w-4" />
                Instagram {social.instagram_handle}
              </Link>
              <Link href={social.tiktok_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Music2 className="h-4 w-4" />
                TikTok {social.tiktok_handle}
              </Link>
              <Link href={social.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowUpRight className="h-4 w-4" />
                LinkedIn
              </Link>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">Usually responds {profile.contact_reply_time.toLowerCase()}</p>
        </div>
      </section>
    </div>
  );
}
