import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./modern-globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModernThemeProvider } from "@/contexts/ModernThemeContext";
import ModernLayout from "@/components/layout/ModernLayout";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
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
  title: "JustForView - Premium Beyblade Store",
  description:
    "Your premium destination for authentic Beyblades, collectibles, and accessories",
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
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <AuthProvider>
          <ModernThemeProvider>
            <ErrorBoundary>
              <ModernLayout>{children}</ModernLayout>
            </ErrorBoundary>
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
      </body>
    </html>
  );
}
