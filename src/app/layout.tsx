import "./globals.css";
import { LayoutClient, ThemeProvider, ToastProvider } from "@/index";
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
    <html lang="en" suppressHydrationWarning>
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
      <body>
        <ThemeProvider>
          <ToastProvider position="top-right">
            <LayoutClient>{children}</LayoutClient>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
