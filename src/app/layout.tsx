import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, ThemeScript } from "@/contexts/ThemeContext";
import { defaultMetadata } from "@/lib/seo/metadata";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateJSONLD,
} from "@/lib/seo/schema";
import { ToastContainer } from "@/components/admin/Toast";
import ErrorInitializer from "@/components/common/ErrorInitializer";
import { MobileInstallPrompt } from "@/components/mobile/MobileInstallPrompt";
import { MobileOfflineIndicator } from "@/components/mobile/MobileOfflineIndicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate Organization and WebSite schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme Script - Prevent flash of wrong theme */}
        <ThemeScript />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Color */}
        <meta name="theme-color" content="#2563eb" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Mobile Viewport - cover for safe areas */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
        />

        {/* iOS Web App Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Let It Rip" />

        {/* Disable auto-zoom on iOS for inputs */}
        <meta name="format-detection" content="telephone=no" />

        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJSONLD(organizationSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJSONLD(websiteSchema)}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" enableStorage>
          <AuthProvider>
            <ErrorInitializer />
            <ToastContainer />
            <MobileOfflineIndicator />
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
              <Header />
              <Breadcrumb />
              <main className="flex-1 pb-16 lg:pb-0 bg-white dark:bg-gray-900">
                {children}
              </main>
              <Footer />
              <BottomNav />
              <MobileInstallPrompt />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
