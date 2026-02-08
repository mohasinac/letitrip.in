import "./globals.css";
import {
  LayoutClient,
  ThemeProvider,
  ToastProvider,
  SessionProvider,
} from "@/index";
import { MonitoringProvider } from "@/components/providers/MonitoringProvider";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";
import type { Metadata } from "next";

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.defaultTitle,
  description: SEO_CONFIG.defaultDescription,
  path: "/",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
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
      <body className="h-full overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <SessionProvider>
            <MonitoringProvider>
              <ToastProvider position="top-right">
                <LayoutClient>{children}</LayoutClient>
              </ToastProvider>
            </MonitoringProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
