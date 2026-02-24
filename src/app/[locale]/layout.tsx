import { LayoutClient, MonitoringProvider, ToastProvider } from "@/components";
import { ThemeProvider, SessionProvider } from "@/contexts";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Metadata } from "next";

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
  const messages = await getMessages();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none"
      >
        Skip to main content
      </a>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider>
          <SessionProvider>
            <MonitoringProvider>
              <ToastProvider position="top-right">
                <LayoutClient>{children}</LayoutClient>
              </ToastProvider>
            </MonitoringProvider>
          </SessionProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </>
  );
}
