import "./globals.css";
import { getLocale } from "next-intl/server";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a5f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "LetItRip",
  description: "Discover and shop amazing products",
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
