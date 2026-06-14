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
  ThemeProvider,
  ToastProvider,
  WishlistCapWatcher,
  ZodSetup,
} from "@mohasinac/appkit/client";
import { ClientErrorReporterMount } from "@/components/ClientErrorReporterMount";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { getDisabledRoutes } from "@mohasinac/appkit/server";
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
    const TIER2 = ["/admin", "/store", "/user", "/checkout", "/demo"];
    const localePath = rawPath.replace(new RegExp(`^/${locale}`), "") || "/";
    if (!TIER2.some((t) => localePath.startsWith(t))) {
      const disabledRoutes = await getDisabledRoutes();
      if (disabledRoutes.some((r) => localePath === r || localePath.startsWith(`${r}/`))) {
        notFound();
      }
    }
  }
  const seedPanelEnabled = siteSettings?.featureFlags?.seedPanel ?? true;
  const siteLogoUrl = siteSettings?.logo?.url || "/logo.svg";
  const siteTheme = siteSettings?.theme;

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
        <ThemeProvider>
          <SessionProvider initialUser={null}>
            <ToastProvider position="top-right">
              <ClientErrorReporterMount />
              <WishlistCapWatcher />
              <BottomActionsProvider>
                <DashboardNavProvider>
                  <LayoutClient>
                    <LayoutShellClient seedPanelEnabled={seedPanelEnabled} siteLogoUrl={siteLogoUrl} siteTheme={siteTheme}><Suspense>{children}</Suspense></LayoutShellClient>
                  </LayoutClient>
                </DashboardNavProvider>
              </BottomActionsProvider>
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </QueryProvider>
  );
}