"use client";

import React from "react";
import { MobileNavRow as LibraryMobileNavRow, type MobileNavRowItem } from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Eye,
  Gavel,
  MapPin,
  Star,
  Settings,
  Users,
  Store,
  Package,
  ShoppingCart,
  CreditCard,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface MobileNavRowProps {
  items: MobileNavRowItem[];
  className?: string;
  variant?: "admin" | "seller" | "user";
}

/**
 * MobileNavRow - Horizontally scrollable navigation row for mobile
 * Used above BottomNav on admin/seller/user routes to provide secondary navigation
 * Hidden on desktop (lg+) where sidebars are visible
 */
export function MobileNavRow({
  items,
  className,
  variant = "user",
}: MobileNavRowProps) {
  const pathname = usePathname();

  return (
    <LibraryMobileNavRow
      items={items}
      currentPath={pathname}
      LinkComponent={Link as any}
      variant={variant}
      icons={{
        chevronLeft: ChevronLeft,
        chevronRight: ChevronRight,
      }}
      className={className}
    />
  );
}

// Navigation items for User dashboard
export const userMobileNavItems: MobileNavRowItem[] = [
  { title: "Dashboard", href: "/user", icon: LayoutDashboard },
  { title: "Orders", href: "/user/orders", icon: ShoppingBag },
  { title: "Favorites", href: "/user/favorites", icon: Heart },
  { title: "Watchlist", href: "/user/watchlist", icon: Eye },
  { title: "Bids", href: "/user/bids", icon: Gavel },
  { title: "Addresses", href: "/user/addresses", icon: MapPin },
  { title: "Reviews", href: "/user/reviews", icon: Star },
  { title: "Settings", href: "/user/settings", icon: Settings },
];

// Navigation items for Admin dashboard
export const adminMobileNavItems: MobileNavRowItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Shops", href: "/admin/shops", icon: Store },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Auctions", href: "/admin/auctions", icon: Gavel },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Settings", href: "/admin/settings/general", icon: Settings },
];

// Navigation items for Seller dashboard
export const sellerMobileNavItems: MobileNavRowItem[] = [
  { title: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { title: "Shops", href: "/seller/my-shops", icon: Store },
  { title: "Products", href: "/seller/products", icon: Package },
  { title: "Auctions", href: "/seller/auctions", icon: Gavel },
  { title: "Orders", href: "/seller/orders", icon: ShoppingCart },
  { title: "Revenue", href: "/seller/revenue", icon: DollarSign },
  { title: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { title: "Reviews", href: "/seller/reviews", icon: Star },
];
