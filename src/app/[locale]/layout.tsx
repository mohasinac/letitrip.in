import { Suspense, type ReactNode } from "react";
import { cache } from "react";
import type { Metadata } from "next";
// `headers` and `notFound` were imported here for the disabled-route gate that
// now lives in src/proxy.ts. Do not reintroduce a dynamic API in this file —
// see the note in the Layout body.
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  BottomActionsProvider,
  DashboardNavProvider,
  LayoutClient,
  SessionProvider,
  SyncManagerMount,
  ToastProvider,
  TourProvider,
  WishlistCapWatcher,
  ZodSetup,
} from "@mohasinac/appkit/client";
import { ClientErrorReporterMount } from "@/components";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { getFlag } from "@/lib/features";
import LayoutShellClient from "./LayoutShellClient";
import QueryProvider from "./QueryProvider";
import { LOCALE_CONFIG } from "@/constants";
import { resolveLocale } from "@/i18n/resolve-locale";
import { routing } from "@/i18n/routing";
import ClientProviderInitializer from "@/app/ClientProviderInitializer";
import { ScrollToTop } from "@/components";

const getCachedSiteSettings = cache(() =>
  siteSettingsRepository.getSingleton().catch(() => null)
);

/**
 * Required for the `[locale]` segment to render statically. Without it Next
 * treats the dynamic segment as unknown at build time and renders it per
 * request — so removing the `headers()` call below is necessary but NOT
 * sufficient to make the site cacheable.
 *
 * `routing.locales` is a single-entry list today (`["en"]`, with
 * `localePrefix: "never"`), so this generates exactly one param.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const logoUrl = settings?.logo?.url || "/logo.svg";
  return {
    icons: { icon: logoUrl, shortcut: logoUrl, apple: logoUrl },
  };
}
type Props = {
  children: ReactNode;
  params: Promise<unknown>;
};

export default async function Layout({ children, params }: Props) {
  const { locale: rawLocale } = (await params) as { locale: string };
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const messages = await getMessages();

  const siteSettings = await getCachedSiteSettings();

  // 🛑 The disabled-nav-route gate USED TO LIVE HERE. It has moved to
  // `src/proxy.ts`. Do not move it back, and do not call `headers()`, `cookies()`
  // or any other dynamic API in this file.
  //
  // Why: this is the ROOT locale layout, so a dynamic API here opts EVERY PAGE
  // ON THE SITE into dynamic rendering. Every request — including every crawler
  // hit — paid a full cold render, every response was
  // `Cache-Control: private, no-cache, no-store`, `X-Vercel-Cache: MISS`, and the
  // `export const revalidate = 120` those pages declare was silently overridden.
  // Verified on `/terms` and `/privacy`, which have no per-request data at all.
  //
  // And it bought nothing: the code read `x-invoke-path` / `x-pathname`, and
  // NOTHING has ever set either header (`x-invoke-path` is a Next 12/13 internal
  // that Next 16 no longer emits; `x-pathname` is not a Next header and the proxy
  // never set it). `rawPath` was always "", so the gate never ran — a dead
  // feature charging a function invocation on every request.
  //
  // The proxy has `request.nextUrl.pathname` natively, needs no dynamic API, and
  // fails open on a settings-fetch error.
  // No fallback here (unlike generateMetadata's favicon use above) — TitleBarLayout
  // treats an empty siteLogoUrl as "no admin logo configured" and renders the
  // desktop center nav slot instead. Falling back to "/logo.svg" would always be
  // truthy, permanently hiding that nav slot and duplicating the wordmark.
  const siteLogoUrl = siteSettings?.logo?.url || "";
  // siteSettings.theme drives the registry-aware <ThemeProvider> mounted
  // inside LayoutShellClient (built-ins + admin records + default ids).
  const siteSettingsTheme = siteSettings?.theme;
  // siteSettings.background drives AppLayoutShell's lightBackground/darkBackground
  // props (BackgroundRenderer) — admin-configured via Site Settings → Appearance.
  const siteSettingsBackground = siteSettings?.background;

  // P-1: feature flags control which public nav items are visible.
  const navFeatureFlags = {
    auctions: getFlag("AUCTIONS"),
    preOrders: getFlag("PREORDERS"),
    prizeDraws: getFlag("PRIZE_DRAWS"),
    events: getFlag("EVENTS"),
    blog: getFlag("BLOG"),
    scams: getFlag("SCAM_REGISTRY"),
  };

  return (
    <QueryProvider>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={LOCALE_CONFIG.TIMEZONE}
        now={new Date()}
      >
        <ClientProviderInitializer />
        <ScrollToTop />
        <ZodSetup />
        <SessionProvider initialUser={null}>
          <ToastProvider position="top-right">
            <ClientErrorReporterMount />
            <WishlistCapWatcher />
            <SyncManagerMount />
            <BottomActionsProvider>
              <DashboardNavProvider>
                <LayoutClient>
                  <TourProvider>
                    <LayoutShellClient siteLogoUrl={siteLogoUrl} siteSettingsTheme={siteSettingsTheme} siteSettingsBackground={siteSettingsBackground} navFeatureFlags={navFeatureFlags}><Suspense>{children}</Suspense></LayoutShellClient>
                  </TourProvider>
                </LayoutClient>
              </DashboardNavProvider>
            </BottomActionsProvider>
          </ToastProvider>
        </SessionProvider>
      </NextIntlClientProvider>
    </QueryProvider>
  );
}