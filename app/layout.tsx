import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { InitialLoader } from "@/components/layout/InitialLoader";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageTransition } from "@/components/layout/PageTransition";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { createPersonJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://swikritpokhrel.com.np"),
  title: {
    default: "Swikrit Pokhrel - Video Editor & Motion Graphics Designer",
    template: "%s | Swikrit Pokhrel",
  },
  description:
    "Swikrit Pokhrel is a professional video editor and motion graphics designer based in Nepal. 3+ years of experience, 150+ projects, 12M+ views. Specialising in After Effects, Premiere Pro, DaVinci Resolve.",
  keywords: [
    "video editor Nepal",
    "motion graphics designer",
    "After Effects artist",
    "freelance video editor",
    "cinematic video editing",
    "commercial video production",
    "DaVinci Resolve colorist",
    "Swikrit Pokhrel",
  ],
  authors: [{ name: "Swikrit Pokhrel", url: "https://swikritpokhrel.com.np" }],
  creator: "Swikrit Pokhrel",
  alternates: {
    canonical: "https://swikritpokhrel.com.np",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://swikritpokhrel.com.np",
    siteName: "Swikrit Pokhrel Portfolio",
    title: "Swikrit Pokhrel - Video Editor & Motion Graphics Designer",
    description:
      "Crafting cinematic stories frame by frame. Based in Nepal, available worldwide.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Swikrit Pokhrel Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swikrit Pokhrel - Video Editor & Motion Graphics Designer",
    description: "Crafting cinematic stories frame by frame.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "ADD_GOOGLE_VERIFICATION_CODE",
  },
};

const personSchema = createPersonJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} bg-background font-body text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[250] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to main content
        </a>
        <InitialLoader />
        <JsonLd data={personSchema} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <PageTransition />
          <CustomCursor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
