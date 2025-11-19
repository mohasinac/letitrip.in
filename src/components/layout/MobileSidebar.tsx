"use client";

import Link from "next/link";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  ADMIN_MENU_ITEMS,
  SELLER_MENU_ITEMS,
  COMPANY_NAME,
} from "@/constants/navigation";
import {
  Package,
  MessageSquare,
  ShoppingBag,
  Book,
  Grid3x3,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminIcons: Record<string, any> = {
  dashboard: LayoutDashboard,
  users: Users,
  products: Package,
};

const sellerIcons: Record<string, any> = {
  overview: LayoutDashboard,
  products: Package,
  orders: ShoppingBag,
};

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [adminSectionOpen, setAdminSectionOpen] = useState<
    Record<string, boolean>
  >({});
  const [sellerSectionOpen, setSellerSectionOpen] = useState<
    Record<string, boolean>
  >({});
  const { isAuthenticated, isAdmin, isAdminOrSeller } = useAuth();

  if (!isOpen) return null;

  const toggleAdminSection = (id: string) => {
    setAdminSectionOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSellerSection = (id: string) => {
    setSellerSectionOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
          {/* Main Navigation */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
              Navigation
            </h3>
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                onClick={onClose}
              >
                <Package className="w-5 h-5 text-gray-600" />
                <span>Home</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                onClick={onClose}
              >
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <span>Products</span>
              </Link>
              <Link
                href="/categories"
                className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                onClick={onClose}
              >
                <Grid3x3 className="w-5 h-5 text-gray-600" />
                <span>Categories</span>
              </Link>
              <Link
                href="/reviews"
                className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                onClick={onClose}
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span>Reviews</span>
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                onClick={onClose}
              >
                <Book className="w-5 h-5 text-gray-600" />
                <span>Blog</span>
              </Link>
            </div>
          </div>

          {/* Authentication Section */}
          {!isAuthenticated && (
            <div className="space-y-2 pt-4 border-t">
              <Link
                href="/login"
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

          {/* Admin Menu (Collapsible) - Only show if user is admin */}
          {isAdmin && (
            <div className="border-t pt-4">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="w-full flex items-center justify-between font-semibold text-gray-700 mb-3 text-sm uppercase hover:text-yellow-700"
              >
                <span>Admin</span>
                {adminOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {adminOpen && (
                <div className="space-y-1">
                  {ADMIN_MENU_ITEMS.map((item) => {
                    const Icon = adminIcons[item.id] || LayoutDashboard;

                    // If item has children (grouped), show collapsible section
                    if ("children" in item && item.children) {
                      const isOpen = adminSectionOpen[item.id] || false;
                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => toggleAdminSection(item.id)}
                            className="flex items-center justify-between w-full px-3 py-2 hover:bg-yellow-50 rounded text-gray-700 text-sm"
                          >
                            <span>{item.name}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="ml-4 mt-1 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={child.link}
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700 text-sm"
                                  onClick={onClose}
                                >
                                  <span>{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Regular item with direct link
                    if ("link" in item && item.link) {
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
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Seller Menu (Collapsible) - Show if user is admin or seller */}
          {isAdminOrSeller && (
            <div className="border-t pt-4">
              <button
                onClick={() => setSellerOpen(!sellerOpen)}
                className="w-full flex items-center justify-between font-semibold text-gray-700 mb-3 text-sm uppercase hover:text-yellow-700"
              >
                <span>Seller</span>
                {sellerOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {sellerOpen && (
                <div className="space-y-1">
                  {SELLER_MENU_ITEMS.map((item) => {
                    const Icon = sellerIcons[item.id] || LayoutDashboard;

                    // If item has children (grouped), show collapsible section
                    if ("children" in item && item.children) {
                      const isOpen = sellerSectionOpen[item.id] || false;
                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => toggleSellerSection(item.id)}
                            className="flex items-center justify-between w-full px-3 py-2 hover:bg-yellow-50 rounded text-gray-700 text-sm"
                          >
                            <span>{item.name}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="ml-4 mt-1 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={child.link}
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 rounded text-gray-700 text-sm"
                                  onClick={onClose}
                                >
                                  <span>{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Regular item with direct link
                    if ("link" in item && item.link) {
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
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Copyright Footer */}
        <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
