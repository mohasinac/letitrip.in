import "./globals.css";
import { getLocale } from "next-intl/server";
import type { Metadata, Viewport } from "next";
import { SEO_CONFIG } from "@/constants/seo";
import { organizationJsonLd, searchBoxJsonLd } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#312e81" },
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
    images: [
      {
        url: SEO_CONFIG.defaultImage,
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SEO_CONFIG.twitterHandle,
    creator: SEO_CONFIG.twitterHandle,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [SEO_CONFIG.defaultImage],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
  // getLocale() reads the locale set by the next-intl middleware from headers
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchBoxJsonLd()),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="h-full overflow-x-hidden">{children}</body>
    </html>
  );
}
