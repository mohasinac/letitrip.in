"use client";

import Link from "next/link";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  SHOPS,
  USER_MENU_ITEMS,
  ADMIN_MENU_ITEMS,
  SELLER_MENU_ITEMS,
  COMPANY_NAME,
} from "@/constants/navigation";
import {
  Package,
  Clock,
  MessageSquare,
  Heart,
  Settings,
  LogOut,
  ShoppingBag,
  Store,
  Book,
  ShoppingCart,
  Grid3x3,
  LayoutDashboard,
  Users,
  BarChart,
} from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const userMenuIcons: Record<string, any> = {
  orders: Package,
  history: Clock,
  messages: MessageSquare,
  favorites: Heart,
  settings: Settings,
  logout: LogOut,
};

const shopIcons: Record<string, any> = {
  "1": Package,
  "2": ShoppingBag,
  "3": Store,
  "4": ShoppingCart,
  "5": Book,
  more: Grid3x3,
};

const adminIcons: Record<string, any> = {
  dashboard: LayoutDashboard,
  users: Users,
  products: Package,
};

const sellerIcons: Record<string, any> = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ShoppingBag,
};

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const isSignedIn = true; // Replace with actual auth check

  if (!isOpen) return null;

  // Filter out logout from main menu
  const userMenuWithoutLogout = USER_MENU_ITEMS.filter(
    (item) => item.id !== "logout"
  );
  const logoutItem = USER_MENU_ITEMS.find((item) => item.id === "logout");

  return (
    <>
      {/* Overlay */}
      <div
        id="mobile-sidebar-overlay"
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className="fixed top-0 left-0 h-full w-80 bg-white z-[60] overflow-y-auto lg:hidden pb-20"
      >
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <span className="font-bold text-lg">{COMPANY_NAME}</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Sections */}
        <div className="p-4 space-y-6">
          {/* User Menu */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
              User Menu
            </h3>
            <div className="space-y-1">
              {userMenuWithoutLogout.map((item) => {
                const Icon = userMenuIcons[item.id] || Package;
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                    onClick={onClose}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout or Sign In at bottom of user menu */}
            <div className="mt-4 pt-4 border-t">
              {isSignedIn ? (
                logoutItem && (
                  <Link
                    href={logoutItem.link}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded text-red-600"
                    onClick={onClose}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{logoutItem.name}</span>
                  </Link>
                )
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/signin"
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-gray-900 font-semibold"
                    onClick={onClose}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded text-gray-700 font-semibold"
                    onClick={onClose}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Admin Menu (Collapsible) */}
          <div className="border-t pt-4">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between font-semibold text-gray-700 mb-3 text-sm uppercase hover:text-yellow-700"
            >
              <span>Admin (Coming Soon)</span>
              {adminOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {adminOpen && (
              <div className="space-y-1 opacity-50">
                {ADMIN_MENU_ITEMS.slice(0, 3).map((item) => {
                  const Icon = adminIcons[item.id] || LayoutDashboard;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 text-gray-500 cursor-not-allowed"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seller Menu (Collapsible) */}
          <div className="border-t pt-4">
            <button
              onClick={() => setSellerOpen(!sellerOpen)}
              className="w-full flex items-center justify-between font-semibold text-gray-700 mb-3 text-sm uppercase hover:text-yellow-700"
            >
              <span>Seller (Coming Soon)</span>
              {sellerOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {sellerOpen && (
              <div className="space-y-1 opacity-50">
                {SELLER_MENU_ITEMS.slice(0, 3).map((item) => {
                  const Icon = sellerIcons[item.id] || LayoutDashboard;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 text-gray-500 cursor-not-allowed"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
