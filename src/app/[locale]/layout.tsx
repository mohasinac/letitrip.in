import { ToastProvider } from "@mohasinac/appkit/ui";
import { MonitoringProvider, QueryProvider, SkipToMain } from "@/components";
import { LayoutClient } from "@mohasinac/appkit/features/layout";
import { ZodSetup } from "@mohasinac/appkit/validation";
import LayoutShellClient from "./LayoutShellClient";
import {
  ThemeProvider,
  SessionProvider,
  BottomActionsProvider,
  DashboardNavProvider,
} from "@/contexts";
import { GuestCartMergerEffect } from "@/features/cart";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";
import { LOCALE_CONFIG } from "@/constants";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { resolveLocale } from "@/i18n/resolve-locale";
import type { Metadata } from "next";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.defaultTitle,
  description: SEO_CONFIG.defaultDescription,
  path: "/",
});

/** Tell Next.js all valid [locale] values so routes can be pre-rendered at
    build time and served from Vercel's CDN (ISR). Without this, all routes
    are treated as on-demand dynamic and never cached. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Locale-aware application layout.
 *
 * Responsibilities:
 * - Receives `params.locale` from the [locale] dynamic segment
 * - Loads the locale's translation messages and provides them via NextIntlClientProvider
 * - Wraps all pages with ThemeProvider, SessionProvider, and UI providers
 * - Renders the skip-navigation link and LayoutClient (navbar, footer, etc.)
 *
 * The outer <html> and <body> tags live in src/app/layout.tsx (root shell).
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Load messages for the resolved locale — locale from URL params (static,
  // avoids headers() which would force all routes into dynamic SSR).
  // setRequestLocale populates async local storage so all subsequent
  // getTranslations() / getMessages() calls use params locale, not headers.
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={LOCALE_CONFIG.TIMEZONE}
        now={new Date()}
      >
        <SkipToMain />
        <ZodSetup />
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider initialUser={null}>
              <GuestCartMergerEffect />
              <MonitoringProvider>
                <ToastProvider position="top-right">
                  <BottomActionsProvider>
                    <DashboardNavProvider>
                      <LayoutClient>
                        <LayoutShellClient>{children}</LayoutShellClient>
                      </LayoutClient>
                    </DashboardNavProvider>
                  </BottomActionsProvider>
                </ToastProvider>
              </MonitoringProvider>
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </>
  );
}
