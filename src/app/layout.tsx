import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../theme/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsentBanner from "@/components/features/auth/CookieConsentBanner";
import AppLayout from "@/components/shared/layout/AppLayout";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "Noto Sans",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: "JustForView - Premium Hobby Store",
  description:
    "Your one-stop shop for premium hobby products, collectibles, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
        style={{
          fontFamily:
            "Inter, var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
          fontSize: "16px",
          fontWeight: "400",
          lineHeight: "1.6",
          color: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--background))",
        }}
      >
        <AuthProvider>
          <ErrorBoundary>
            <AppLayout>{children}</AppLayout>
          </ErrorBoundary>
          <CookieConsentBanner />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
