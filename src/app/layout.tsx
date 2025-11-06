import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LET IT RIP - Buy From Japan",
  description: "International e-commerce platform for Japanese products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
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
