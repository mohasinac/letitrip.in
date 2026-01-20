"use client";

import { ClientLink } from "@/components/common/ClientLink";
import {
  BarChart3,
  Gavel,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/admin/users",
    icon: Users,
    label: "Users",
  },
  {
    href: "/admin/products",
    icon: Package,
    label: "Products",
  },
  {
    href: "/admin/categories",
    icon: Tag,
    label: "Categories",
  },
  {
    href: "/admin/auctions",
    icon: Gavel,
    label: "Auctions",
  },
  {
    href: "/admin/shops",
    icon: Store,
    label: "Shops",
  },
  {
    href: "/admin/orders",
    icon: ShoppingBag,
    label: "Orders",
  },
  {
    href: "/admin/coupons",
    icon: Tag,
    label: "Coupons",
  },
  {
    href: "/admin/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <ClientLink
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </ClientLink>
        );
      })}
    </nav>
  );
}
