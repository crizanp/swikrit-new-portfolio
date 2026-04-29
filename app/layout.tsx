import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { PageTransition } from "@/components/layout/PageTransition";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CustomCursor } from "@/components/ui/CustomCursor";
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
    default: "Swikrit Pokhrel | Video Editor & Motion Graphics Designer",
    template: "%s | Swikrit Pokhrel",
  },
  description:
    "Professional video editor and motion graphics designer based in Nepal, available worldwide for commercials, social media, and branded storytelling.",
  alternates: {
    canonical: "https://swikritpokhrel.com.np",
  },
  openGraph: {
    title: "Swikrit Pokhrel",
    description:
      "Professional video editor and motion graphics designer based in Nepal, available worldwide.",
    url: "https://swikritpokhrel.com.np",
    siteName: "Swikrit Pokhrel",
    locale: "en_US",
    type: "website",
  },
};

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
