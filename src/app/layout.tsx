import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./modern-globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModernThemeProvider } from "@/contexts/ModernThemeContext";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import ModernLayout from "@/components/layout/ModernLayout";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import ThemeRegistry from "@/components/shared/ThemeRegistry";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: {
    default: "JustForView - Premium Beyblade Store",
    template: "%s | JustForView",
  },
  description:
    "Your premium destination for authentic Beyblades, collectibles, and accessories. Shop the best Beyblade products in India with fast shipping and great prices.",
  keywords: [
    "beyblade",
    "beyblade store",
    "buy beyblades online",
    "beyblade India",
    "beyblade collectibles",
    "beyblade accessories",
    "authentic beyblades",
  ],
  authors: [{ name: "JustForView" }],
  creator: "JustForView",
  publisher: "JustForView",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "JustForView",
    title: "JustForView - Premium Beyblade Store",
    description:
      "Your premium destination for authentic Beyblades, collectibles, and accessories",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JustForView - Premium Beyblade Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JustForView - Premium Beyblade Store",
    description:
      "Your premium destination for authentic Beyblades, collectibles, and accessories",
    images: ["/assets/og-image.jpg"],
    creator: "@justforview",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    // Add other verification codes as needed
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
  category: "ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Mobile Optimization Meta Tags */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="JustForView" />
        <meta
          name="theme-color"
          content="#0095f6"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000000"
          media="(prefers-color-scheme: dark)"
        />

        {/* Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect for performance */}
        <meta name="emotion-insertion-point" content="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <ThemeRegistry>
          <AuthProvider>
            <ModernThemeProvider>
              <BreadcrumbProvider>
                <ErrorBoundary>
                  <ModernLayout>{children}</ModernLayout>
                </ErrorBoundary>
              </BreadcrumbProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1a1a1a",
                    color: "#ffffff",
                    border: "1px solid #333333",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: "#2ed573",
                      color: "white",
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: "#ff4757",
                      color: "white",
                    },
                  },
                }}
              />
            </ModernThemeProvider>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
