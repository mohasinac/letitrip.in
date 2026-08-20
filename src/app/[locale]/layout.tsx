import { Suspense, type ReactNode } from "react";
import { cache } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
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
import { getDisabledRoutes } from "@mohasinac/appkit/server";
import { getFlag } from "@/lib/features";
import LayoutShellClient from "./LayoutShellClient";
import QueryProvider from "./QueryProvider";
import { LOCALE_CONFIG } from "@/constants";
import { resolveLocale } from "@/i18n/resolve-locale";
import ClientProviderInitializer from "@/app/ClientProviderInitializer";
import { ScrollToTop } from "@/components";

const getCachedSiteSettings = cache(() =>
  siteSettingsRepository.getSingleton().catch(() => null)
);

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

  // Block disabled nav-item routes (strips locale prefix, skips Tier 2 paths)
  const reqHeaders = await headers();
  const rawPath = reqHeaders.get("x-invoke-path") ?? reqHeaders.get("x-pathname") ?? "";
  if (rawPath) {
    const TIER2 = ["/admin", "/store", "/user", "/checkout"];
    const localePath = rawPath.replace(new RegExp(`^/${locale}`), "") || "/";
    if (!TIER2.some((t) => localePath.startsWith(t))) {
      const disabledRoutes = await getDisabledRoutes();
      if (disabledRoutes.some((r) => localePath === r || localePath.startsWith(`${r}/`))) {
        notFound();
      }
    }
  }
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