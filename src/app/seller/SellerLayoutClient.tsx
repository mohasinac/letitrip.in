"use client";

import { useState } from "react";
import { Menu, Store } from "lucide-react";
import { MobileSellerSidebar } from "@/components/mobile/MobileSellerSidebar";
import {
  MobileNavRow,
  sellerMobileNavItems,
} from "@/components/layout/MobileNavRow";

interface SellerLayoutClientProps {
  children: React.ReactNode;
}

export function SellerLayoutClient({ children }: SellerLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Menu Toggle */}
      <div className="lg:hidden sticky top-0 z-40 bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-blue-700 rounded-lg touch-target"
          aria-label="Open seller menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Store className="w-5 h-5" />
        <span className="font-semibold">Seller Hub</span>
      </div>

      {/* Mobile Sidebar */}
      <MobileSellerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Page Content */}
      {children}

      {/* Mobile Navigation Row - above bottom nav, hidden on desktop */}
      <MobileNavRow items={sellerMobileNavItems} variant="seller" />
    </>
  );
}
