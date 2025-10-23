import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import UserDebug from "@/components/debug/UserDebug";
import CookieConsentBanner from "@/components/auth/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <CategoriesProvider>
              {children}
              <UserDebug />
              <CookieConsentBanner />
            </CategoriesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
