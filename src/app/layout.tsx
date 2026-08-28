
import "@mohasinac/appkit/styles";
import "@/styles/globals.compiled.css";
import { Poppins, Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { SEO_CONFIG } from "@/constants";
import { initProviders } from "@/providers.config";
import { organizationJsonLd, searchBoxJsonLd } from "@mohasinac/appkit/server";
import appkitConfig from "@/lib/appkit-config";

/**
 * Site identity for the two site-wide JSON-LD nodes.
 *
 * Passed explicitly rather than letting the builders read
 * `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_SITE_URL`. Production had
 * `NEXT_PUBLIC_SITE_NAME="Letitrip"` — the wrong casing, which CLAUDE.md's brand
 * rule forbids — and that string was being emitted as `Organization.name` on
 * every page, i.e. the name Google may use in a Knowledge Panel. Sourcing it
 * from appkit.config.js makes the brand a code-reviewed constant rather than a
 * deploy-time env value nobody re-reads.
 *
 * `sameAs` feeds schema.org entity recognition; it was hardcoded `[]` while
 * appkit.config.js carried real social URLs that nothing read.
 */
const SITE_IDENTITY = {
  siteName: SEO_CONFIG.siteName,
  siteUrl: SEO_CONFIG.siteUrl,
  sameAs: Object.values(appkitConfig.brand?.socialUrls ?? {}).filter(
    (u): u is string => typeof u === "string" && u.length > 0,
  ),
} as const;

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
    { media: "(prefers-color-scheme: light)", color: "#0d9488" }, // crimson-warrior (Teal Tide) primary
    { media: "(prefers-color-scheme: dark)",  color: "#14b8a6" }, // shadow-abyss (Teal Depths) primary
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
    ...(SEO_CONFIG.twitterHandle
      ? { site: SEO_CONFIG.twitterHandle, creator: SEO_CONFIG.twitterHandle }
      : {}),
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
  // 🛑 Deliberately NO `alternates` here. Do not add one back.
  //
  // A root layout's metadata is INHERITED by every page that does not override
  // it, so a static absolute `canonical: SEO_CONFIG.siteUrl` made every such
  // page declare the homepage as its canonical URL — telling Google those pages
  // are duplicates of `/` and should be dropped. /promotions and /reviews were
  // both live examples; they self-canonicalised to the apex homepage.
  //
  // With no canonical here, Next emits none and Google self-canonicalises to the
  // requested URL, which is correct. Pages that want an explicit one supply
  // `path` to generateMetadata() from @/constants/seo.server.
  //
  // The `languages` map is gone for the same reason plus a second one: it
  // advertised `hi` as an hreflang alternate while src/i18n/routing.ts declares
  // `locales: ["en"]`, so /hi never resolved. A single-locale site needs no
  // hreflang at all.
  //
  // Enforced by scripts/audit-seo-page-metadata.mjs.
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
      className={`min-h-full bg-[var(--appkit-color-bg)] ${poppins.variable} ${inter.variable} ${cormorant.variable} ${playfair.variable}`}
    >
      <head>
        {/* Preconnect to external origins used by fonts + analytics.
            Media is served same-origin via /media/<slug> (no GCS preconnect needed). */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(SITE_IDENTITY)),
          }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchBoxJsonLd(SITE_IDENTITY)),
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var p=localStorage.getItem('appkit:theme-mode');var isDark=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',isDark);var tid=localStorage.getItem('appkit:theme-id')||(isDark?'default-dark':'default-light');document.documentElement.setAttribute('data-theme',tid);}catch(e){}`,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            // No normalizeError here: this is a STRING injected as an inline
            // browser script, where that import does not exist — calling it
            // would throw a ReferenceError from inside the very catch meant to
            // keep a blocked localStorage from breaking first paint.
            __html: `try{if(localStorage.getItem('font-style')==='cursive'){document.documentElement.classList.add('font-cursive');}}catch(e){}`,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var h=localStorage.getItem('appkit:hand-mode');document.documentElement.setAttribute('data-hand',h==='left'?'left':'right');}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full overflow-x-hidden">{children}</body>
    </html>
  );
}

