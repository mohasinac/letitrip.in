/**
 * @fileoverview React Component
 * @module src/app/admin/AdminLayoutClient
 * @description This file contains the AdminLayoutClient component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { MobileAdminSidebar } from "@/components/mobile/MobileAdminSidebar";
import {
  MobileNavRow,
  adminMobileNavItems,
} from "@/components/layout/MobileNavRow";

/**
 * AdminLayoutClientProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AdminLayoutClientProps
 */
interface AdminLayoutClientProps {
  /** Children */
  children: React.ReactNode;
}

/**
 * Function: Admin Layout Client
 */
/**
 * Performs admin layout client operation
 *
 * @param {AdminLayoutClientProps} { children } - The { children }
 *
 * @returns {any} The adminlayoutclient result
 *
 * @example
 * AdminLayoutClient({ children });
 */

/**
 * Performs admin layout client operation
 *
 * @param {AdminLayoutClientProps} { children } - The { children }
 *
 * @returns {any} The adminlayoutclient result
 *
 * @example
 * AdminLayoutClient({ children });
 */

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header - simplified, no hamburger since MobileNavRow provides navigation */}
      <div className="lg:hidden sticky top-0 z-40 bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">Admin Panel</span>
        {/* Only show menu button for accessing full sidebar with grouped sections */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-700 rounded-lg touch-target text-sm flex items-center gap-1"
          aria-label="More options"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs">More</span>
        </button>
      </div>

      {/* Mobile Sidebar - for accessing grouped/nested navigation items */}
      <MobileAdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Page Content */}
      {children}

      {/* Mobile Navigation Row - primary navigation above bottom nav */}
      <MobileNavRow items={adminMobileNavItems} variant="admin" />
    </>
  );
}
