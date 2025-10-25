"use client";

import { ReactNode, useState } from "react";
import SellerSidebar from "./SellerSidebar";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface SellerLayoutProps {
  children: ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard requiredRole="seller">
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
              <SellerSidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <SellerSidebar />

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Mobile header */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
              Seller Panel
            </div>
          </div>

          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
