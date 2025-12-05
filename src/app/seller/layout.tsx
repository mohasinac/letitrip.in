/**
 * @fileoverview React Component
 * @module src/app/seller/layout
 * @description This file contains the layout component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Metadata } from "next";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import { SellerLayoutClient } from "./SellerLayoutClient";

export const metadata: Metadata = {
  /** Title */
  title: {
    /** Template */
    template: "%s | Seller Dashboard - Letitrip",
    /** Default */
    default: "Seller Dashboard - Letitrip",
  },
  /** Description */
  description: "Manage your shop, products, orders, and more on Letitrip",
};

export default function SellerLayout({
  children,
}: {
  /** Children */
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
