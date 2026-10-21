
import "@mohasinac/appkit/styles";
import "@/styles/globals.compiled.css";
import { Poppins, Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { SEO_CONFIG } from "@/constants";
import { initProviders } from "@/providers.config";
import { organizationJsonLd, searchBoxJsonLd } from "@mohasinac/appkit/server";
import appkitConfig from "@/lib/appkit-config";
import { BUSINESS, BUSINESS_ADDRESS } from "@/constants/business";

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
  /*
   * The LEGAL entity, from the one owner of it (appkit.config.js → business).
   *
   * The Organization node carried no legalName, address, telephone, email or
   * taxID at all — so the site published a brand with no identifiable entity
   * behind it, which an Indian e-commerce platform is required to disclose and
   * which also weakens schema.org entity recognition.
   *
   * Undecided values are `null` and `organizationJsonLd` OMITS each key rather
   * than emitting it empty: a PostalAddress of blank strings validates and is
   * wrong, which is worse than being absent.
   */
  legalName: BUSINESS.legalName,
  taxId: BUSINESS.gstin ?? undefined,
  telephone: BUSINESS.support?.phone ?? undefined,
  email: BUSINESS.support?.email ?? undefined,
  address: BUSINESS_ADDRESS
    ? {
        streetAddress: [BUSINESS_ADDRESS.line1, BUSINESS_ADDRESS.line2]
          .filter(Boolean)
          .join(", "),
        addressLocality: BUSINESS_ADDRESS.city,
        addressRegion: BUSINESS_ADDRESS.state,
        postalCode: BUSINESS_ADDRESS.postalCode,
        addressCountry: BUSINESS_ADDRESS.country,
      }
    : undefined,
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
        {/*
          ── The announcement bar's dismissal, resolved BEFORE first paint ───

          🛑 THIS IS A LAYOUT-SHIFT FIX, NOT A FLASH FIX, AND THE SHIFT IS AT
          THE VERY TOP OF THE PAGE — so it moves everything below it and counts
          against CLS at close to full weight. Mobile homepage CLS measured
          0.822; "good" is under 0.1.

          `AnnouncementBar` cannot resolve this itself. It renders at full
          height on the server (nobody has told it otherwise), then a
          `useEffect` reads `localStorage`, finds a dismissal, and returns
          `null` — and the bar's entire height disappears after paint. A
          returning visitor who dismissed the banner got a coloured strip they
          could not read (it renders at `opacity-0` until mounted) which then
          collapsed and yanked the page upward.

          The server cannot help: dismissal is per-browser, and the root locale
          layout must stay STATIC (Root Cause #82 — one dynamic API there makes
          every page on the site render per request), so it cannot read a
          cookie either.

          So the decision is made before the first paint, by the same mechanism
          the three scripts above already use for theme, font and hand mode:
          set an attribute on `<html>`, let CSS act on it. The bar is then
          display:none from the first frame and reserves nothing — no strip, no
          collapse, no shift.

          🛑 The key must match `AnnouncementBar`'s `STORAGE_KEY` and its
          one-week window. They are two literals in two languages that cannot
          import each other, so `audit-banner-dismiss-parity` checks they
          agree — a drift here fails silently in the worst direction: the
          attribute is never set, the bar paints, and the shift returns while
          both files look correct.

          The hash is NOT recomputed here. This script only has to know THAT a
          dismissal exists and is fresh; whether it matches the current
          message is `AnnouncementBar`'s job, and duplicating its `Math.imul`
          hash in a second language is a drift waiting to happen. Consequence:
          a visitor who dismissed an OLD banner has the new one hidden for the
          first frame and the component reveals it on mount — one shift for the
          rare case of a changed message, instead of one shift for every
          returning visitor.
        */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            // No normalizeError — see the font-style script's note on why an
            // import cannot exist inside an injected string.
            __html: `try{var r=localStorage.getItem('letitrip:announcement-dismissed');if(r){var d=JSON.parse(r);if(d&&typeof d.at==='number'&&Date.now()-d.at<604800000){document.documentElement.setAttribute('data-banner-dismissed','1');}}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full overflow-x-hidden">{children}</body>
    </html>
  );
}

