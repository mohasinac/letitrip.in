import {
  LayoutClient,
  MonitoringProvider,
  QueryProvider,
  SkipToMain,
  ToastProvider,
  ZodSetup,
} from "@/components";
import {
  ThemeProvider,
  SessionProvider,
  BottomActionsProvider,
  DashboardNavProvider,
} from "@/contexts";
import { GuestCartMergerEffect } from "@/features/cart";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { cookies } from "next/headers";
import type { ThemeMode } from "@/constants";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.defaultTitle,
  description: SEO_CONFIG.defaultDescription,
  path: "/",
});

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
  // Load messages for the resolved locale (set by next-intl middleware)
  const locale = await getLocale();
  const messages = await getMessages();

  // Pre-fetch the authenticated user server-side so SessionProvider can start
  // with user data immediately — eliminates the loading flash on hard reloads.
  const serverUser = await getServerSessionUser();

  // Read the theme cookie so ThemeProvider starts with the correct theme on
  // SSR — prevents a hydration mismatch in theme-dependent inline styles.
  const cookieStore = await cookies();
  const initialTheme: ThemeMode =
    cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SkipToMain />
        <ZodSetup />
        <ThemeProvider initialTheme={initialTheme}>
          <QueryProvider>
            <SessionProvider initialUser={serverUser}>
              <GuestCartMergerEffect />
              <MonitoringProvider>
                <ToastProvider position="top-right">
                  <BottomActionsProvider>
                    <DashboardNavProvider>
                      <LayoutClient>{children}</LayoutClient>
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
