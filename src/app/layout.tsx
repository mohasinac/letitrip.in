import "@mohasinac/appkit/styles";
import "@/styles/globals.compiled.css";
import { Poppins, Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { SEO_CONFIG } from "@/constants";
import { initProviders } from "@/providers.config";
import { organizationJsonLd, searchBoxJsonLd } from "@mohasinac/appkit/server";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cursive",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3570fc" },
    { media: "(prefers-color-scheme: dark)", color: "#e91e8c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: `%s | ${SEO_CONFIG.siteName}`,
  },
  description: SEO_CONFIG.defaultDescription,
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  openGraph: {
    type: "website",
    locale: SEO_CONFIG.locale,
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.siteName,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    site: SEO_CONFIG.twitterHandle,
    creator: SEO_CONFIG.twitterHandle,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
    other: [
      { rel: "mask-icon", url: "/favicon/favicon.ico" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: SEO_CONFIG.siteUrl,
    languages: {
      en: SEO_CONFIG.siteUrl,
      hi: `${SEO_CONFIG.siteUrl}/hi`,
    },
  },
};

/**
 * Root HTML shell layout.
 *
 * Responsibilities:
 * - Sets <html lang> from the resolved locale (via next-intl middleware)
 * - Injects the dark-mode detection script (runs before React hydrates)
 * - Provides <body> with base classes
 *
 * All providers (ThemeProvider, SessionProvider, NextIntlClientProvider…)
 * live in src/app/[locale]/layout.tsx so they receive the locale param.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initProviders();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`min-h-full bg-zinc-50 dark:bg-slate-950 ${poppins.variable} ${inter.variable} ${cormorant.variable} ${playfair.variable}`}
    >
      <head>
        {/* Preconnect to external origins used by media, fonts and analytics.
            preconnect covers DNS + TCP + TLS — dns-prefetch is redundant for the same origin. */}
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchBoxJsonLd()),
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var m=document.cookie.match(/(?:^|;\\s*)theme=(dark|light)/);var t=(m&&m[1])||localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('font-style')==='cursive'){document.documentElement.classList.add('font-cursive');}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full overflow-x-hidden">{children}</body>
    </html>
  );
}

