"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { MobileAdminSidebar } from "@/components/mobile/MobileAdminSidebar";
import {
  MobileNavRow,
  adminMobileNavItems,
} from "@/components/layout/MobileNavRow";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Menu Toggle */}
      <div className="lg:hidden sticky top-0 z-40 bg-gray-800 text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-700 rounded-lg touch-target"
          aria-label="Open admin menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-semibold">Admin Panel</span>
      </div>

      {/* Mobile Sidebar */}
      <MobileAdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Page Content */}
      {children}

      {/* Mobile Navigation Row - above bottom nav, hidden on desktop */}
      <MobileNavRow items={adminMobileNavItems} variant="admin" />
    </>
  );
}
