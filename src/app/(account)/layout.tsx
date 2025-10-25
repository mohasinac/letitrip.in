"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSidebar from "@/components/layout/AccountSidebar";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <AccountSidebar />
          </div>

          {/* Mobile Sidebar */}
          <AccountSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  My Account
                </h1>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </div>

            {/* Page Content */}
            <main className="flex-1 p-4 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
