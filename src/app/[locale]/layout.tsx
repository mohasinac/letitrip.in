import type { ReactNode } from "react";
import { cache } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  BottomActionsProvider,
  DashboardNavProvider,
  LayoutClient,
  SkipToMain,
  SessionProvider,
  ThemeProvider,
  ToastProvider,
  WishlistCapWatcher,
  ZodSetup,
} from "@mohasinac/appkit/client";
import { siteSettingsRepository } from "@mohasinac/appkit";
import LayoutShellClient from "./LayoutShellClient";
import { LOCALE_CONFIG } from "@/constants";
import { resolveLocale } from "@/i18n/resolve-locale";
import ClientProviderInitializer from "@/app/ClientProviderInitializer";
import { ScrollToTop } from "@/components/ScrollToTop";

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
  const seedPanelEnabled = siteSettings?.featureFlags?.seedPanel ?? true;
  const siteLogoUrl = siteSettings?.logo?.url || "/logo.svg";
  const siteTheme = siteSettings?.theme;

  return (
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
            <WishlistCapWatcher />
            <BottomActionsProvider>
              <DashboardNavProvider>
                <LayoutClient>
                  <LayoutShellClient seedPanelEnabled={seedPanelEnabled} siteLogoUrl={siteLogoUrl} siteTheme={siteTheme}>{children}</LayoutShellClient>
                </LayoutClient>
              </DashboardNavProvider>
            </BottomActionsProvider>
          </ToastProvider>
        </SessionProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}