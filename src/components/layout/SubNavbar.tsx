"use client";

import { SubNavbar as LibrarySubNavbar } from "@letitrip/react-library";
import {
  BookOpen,
  Gavel,
  Home,
  Layers,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "home", name: "Home", href: "/", icon: Home },
  { id: "products", name: "Products", href: "/products", icon: ShoppingBag },
  { id: "auctions", name: "Auctions", href: "/auctions", icon: Gavel },
  { id: "shops", name: "Shops", href: "/shops", icon: Store },
  { id: "categories", name: "Categories", href: "/categories", icon: Layers },
  { id: "reviews", name: "Reviews", href: "/reviews", icon: Star },
  { id: "blog", name: "Blog", href: "/blog", icon: BookOpen },
];

/**
 * SubNavbar - Secondary navigation bar
 * Hidden on mobile (< lg breakpoint) as MobileSidebar provides navigation
 * Shows on desktop with dark mode support
 */
export default function SubNavbar() {
  const pathname = usePathname();

  return (
    <LibrarySubNavbar
      items={NAV_ITEMS}
      currentPath={pathname}
      LinkComponent={Link as any}
    />
  );
}
