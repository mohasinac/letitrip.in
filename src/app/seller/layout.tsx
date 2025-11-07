import { Metadata } from "next";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { SellerHeader } from "@/components/seller/SellerHeader";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: {
    template: "%s | Seller Dashboard - JustForView.in",
    default: "Seller Dashboard - JustForView.in",
  },
  description: "Manage your shop, products, orders, and more on JustForView.in",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["seller", "admin"]}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <SellerSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <SellerHeader />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
