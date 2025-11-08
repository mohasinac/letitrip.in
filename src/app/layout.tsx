import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { AuthProvider } from "@/contexts/AuthContext";
import { defaultMetadata } from "@/lib/seo/metadata";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateJSONLD,
} from "@/lib/seo/schema";
import { ToastContainer } from "@/components/admin/Toast";

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
    <html lang="en">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Color */}
        <meta name="theme-color" content="#2563eb" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

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
        <AuthProvider>
          <ToastContainer />
          <div className="flex flex-col min-h-screen">
            <Header />
            <Breadcrumb />
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
            <Footer />
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
