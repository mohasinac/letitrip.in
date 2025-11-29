import { Metadata } from "next";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import { SellerLayoutClient } from "./SellerLayoutClient";

export const metadata: Metadata = {
  title: {
    template: "%s | Seller Dashboard - Letitrip",
    default: "Seller Dashboard - Letitrip",
  },
  description: "Manage your shop, products, orders, and more on Letitrip",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["seller", "admin"]}>
      <SellerLayoutClient>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Desktop Sidebar */}
          <SellerSidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col lg:ml-64">
            {/* Main Content */}
            <main className="flex-1 pb-32 lg:pb-0">
              <div className="container mx-auto px-4 py-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SellerLayoutClient>
    </AuthGuard>
  );
}
