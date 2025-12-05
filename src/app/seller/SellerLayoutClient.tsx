/**
 * @fileoverview React Component
 * @module src/app/seller/SellerLayoutClient
 * @description This file contains the SellerLayoutClient component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { Menu, Store } from "lucide-react";
import { MobileSellerSidebar } from "@/components/mobile/MobileSellerSidebar";
import {
  MobileNavRow,
  sellerMobileNavItems,
} from "@/components/layout/MobileNavRow";

/**
 * SellerLayoutClientProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SellerLayoutClientProps
 */
interface SellerLayoutClientProps {
  /** Children */
  children: React.ReactNode;
}

/**
 * Function: Seller Layout Client
 */
/**
 * Performs seller layout client operation
 *
 * @param {SellerLayoutClientProps} { children } - The { children }
 *
 * @returns {any} The sellerlayoutclient result
 *
 * @example
 * SellerLayoutClient({ children });
 */

/**
 * Performs seller layout client operation
 *
 * @param {SellerLayoutClientProps} { children } - The { children }
 *
 * @returns {any} The sellerlayoutclient result
 *
 * @example
 * SellerLayoutClient({ children });
 */

export function SellerLayoutClient({ children }: SellerLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header - simplified, no hamburger since MobileNavRow provides navigation */}
      <div className="lg:hidden sticky top-0 z-40 bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          <span className="font-semibold">Seller Hub</span>
        </div>
        {/* Only show menu button for accessing full sidebar with grouped sections */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-blue-700 rounded-lg touch-target text-sm flex items-center gap-1"
          aria-label="More options"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs">More</span>
        </button>
      </div>

      {/* Mobile Sidebar - for accessing grouped/nested navigation items */}
      <MobileSellerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Page Content */}
      {children}

      {/* Mobile Navigation Row - primary navigation above bottom nav */}
      <MobileNavRow items={sellerMobileNavItems} variant="seller" />
    </>
  );
}
