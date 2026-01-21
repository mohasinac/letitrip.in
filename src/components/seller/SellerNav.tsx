import { ROUTES } from "@/constants/routes";
import { ClientLink } from "@mohasinac/react-library";
import {
  BarChart3,
  Gavel,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";

const navItems = [
  {
    href: ROUTES.SELLER.DASHBOARD,
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: ROUTES.SELLER.PRODUCTS,
    icon: Package,
    label: "Products",
  },
  {
    href: ROUTES.SELLER.AUCTIONS,
    icon: Gavel,
    label: "Auctions",
  },
  {
    href: ROUTES.SELLER.ORDERS,
    icon: ShoppingBag,
    label: "Orders",
  },
  {
    href: ROUTES.SELLER.SHOP,
    icon: Store,
    label: "Shop Settings",
  },
  {
    href: ROUTES.SELLER.ANALYTICS,
    icon: BarChart3,
    label: "Analytics",
  },
];

export function SellerNav({ currentPath }: { currentPath?: string }) {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;

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
