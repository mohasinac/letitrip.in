"use client";

import { ReactNode } from "react";
import SellerSidebar from "./SellerSidebar";
import RoleGuard from "@/components/auth/RoleGuard";

interface SellerLayoutProps {
  children: ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <RoleGuard requiredRole="seller">
      <div className="flex min-h-screen bg-gray-50">
        <SellerSidebar />

        {/* Main content */}
        <div className="lg:pl-72 flex-1">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
