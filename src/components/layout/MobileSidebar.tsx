"use client";

import Link from "next/link";
import { X } from "lucide-react";
import {
  SHOPS,
  USER_MENU_ITEMS,
  ADMIN_MENU_ITEMS,
  SELLER_MENU_ITEMS,
  FEATURED_CATEGORIES,
  COMPANY_NAME,
} from "@/constants/navigation";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 overflow-y-auto lg:hidden">
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
              {USER_MENU_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="block px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Shops */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
              Shops
            </h3>
            <div className="space-y-1">
              {SHOPS.map((shop) => (
                <Link
                  key={shop.id}
                  href={shop.link}
                  className="block px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                  onClick={onClose}
                >
                  {shop.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Categories */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
              Categories
            </h3>
            <div className="space-y-1">
              {FEATURED_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={category.link}
                  className="block px-3 py-2 hover:bg-yellow-50 rounded text-gray-700"
                  onClick={onClose}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Menu (Future) */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
              Admin (Coming Soon)
            </h3>
            <div className="space-y-1 opacity-50">
              {ADMIN_MENU_ITEMS.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="block px-3 py-2 text-gray-500 cursor-not-allowed"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          {/* Seller Menu (Future) */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
              Seller (Coming Soon)
            </h3>
            <div className="space-y-1 opacity-50">
              {SELLER_MENU_ITEMS.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="block px-3 py-2 text-gray-500 cursor-not-allowed"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
