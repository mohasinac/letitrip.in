"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChartBarIcon,
  TagIcon,
  TruckIcon,
  CogIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface SellerSidebarProps {
  className?: string;
}

export default function SellerSidebar({ className = "" }: SellerSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/seller/dashboard",
      icon: HomeIcon,
      current: pathname === "/seller/dashboard",
    },
    {
      name: "Products",
      href: "/seller/products",
      icon: CubeIcon,
      current: pathname.startsWith("/seller/products"),
    },
    {
      name: "Orders",
      href: "/seller/orders",
      icon: ShoppingBagIcon,
      current: pathname.startsWith("/seller/orders"),
    },
    {
      name: "Deals & Offers",
      href: "/seller/deals",
      icon: TagIcon,
      current: pathname.startsWith("/seller/deals"),
    },
    {
      name: "Inventory",
      href: "/seller/inventory",
      icon: ClipboardDocumentListIcon,
      current: pathname.startsWith("/seller/inventory"),
    },
    {
      name: "Analytics",
      href: "/seller/analytics",
      icon: ChartBarIcon,
      current: pathname.startsWith("/seller/analytics"),
    },
    {
      name: "Shipping",
      href: "/seller/shipping",
      icon: TruckIcon,
      current: pathname.startsWith("/seller/shipping"),
    },
    {
      name: "Promotions",
      href: "/seller/promotions",
      icon: MegaphoneIcon,
      current: pathname.startsWith("/seller/promotions"),
    },
    {
      name: "Media",
      href: "/seller/media",
      icon: PhotoIcon,
      current: pathname.startsWith("/seller/media"),
    },
    {
      name: "Settings",
      href: "/seller/settings",
      icon: CogIcon,
      current: pathname.startsWith("/seller/settings"),
    },
  ];

  return (
    <nav className={`space-y-1 ${className}`}>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              item.current
                ? "bg-primary text-white"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Icon
              className={`mr-3 h-5 w-5 ${
                item.current
                  ? "text-white"
                  : "text-gray-400 group-hover:text-gray-500"
              }`}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
