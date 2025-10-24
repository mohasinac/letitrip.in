"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CubeIcon,
  TruckIcon,
  TagIcon,
  CogIcon,
  BellIcon,
  EyeSlashIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/ThemeToggle";

const sellerNavItems = [
  {
    name: "Dashboard",
    href: "/seller/dashboard",
    icon: HomeIcon,
    description: "Overview & analytics",
  },
  {
    name: "Add Product",
    href: "/seller/products/new",
    icon: PlusIcon,
    description: "Create new product",
  },
  {
    name: "Products",
    href: "/seller/products",
    icon: BuildingStorefrontIcon,
    description: "View all products",
  },
  {
    name: "Auctions",
    href: "/seller/auctions",
    icon: SparklesIcon,
    description: "Manage auctions",
  },
  {
    name: "Manage Orders",
    href: "/seller/orders",
    icon: ShoppingBagIcon,
    description: "View & process orders",
  },
  {
    name: "Analytics",
    href: "/seller/analytics",
    icon: ChartBarIcon,
    description: "Revenue, orders, customers",
  },
  {
    name: "Inventory",
    href: "/seller/inventory",
    icon: CubeIcon,
    description: "Manage existing products",
  },
  {
    name: "Shipping",
    href: "/seller/shipping",
    icon: TruckIcon,
    description: "Shipping & fulfillment",
  },
  {
    name: "Coupons",
    href: "/seller/coupons",
    icon: TagIcon,
    description: "Manage promotions",
  },
  {
    name: "Notifications",
    href: "/seller/notifications",
    icon: BellIcon,
    description: "Order notifications",
  },
  {
    name: "Settings",
    href: "/seller/settings",
    icon: CogIcon,
    description: "Store & account settings",
  },
];

interface SellerSidebarProps {
  onClose?: () => void;
}

export default function SellerSidebar({ onClose }: SellerSidebarProps = {}) {
  const pathname = usePathname();

  const sidebarContent = (
    <div
      className="flex grow flex-col gap-y-5 overflow-y-auto sidebar-bg px-6 border-r transition-colors duration-200"
      style={{ borderColor: "hsl(var(--header-border))" }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold sidebar-text">JustForView</span>
          <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded transition-colors duration-200">
            Seller
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 sidebar-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {sellerNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`sidebar-item group flex gap-x-3 rounded-md p-3 leading-6 font-semibold ${
                        isActive ? "active" : ""
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 transition-colors duration-200 ${
                          isActive
                            ? "text-current"
                            : "sidebar-text-muted group-hover:text-current"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.description && (
                          <span className="text-xs sidebar-text-muted group-hover:text-current transition-colors duration-200">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Store Status & Quick Actions */}
          <li className="mt-auto">
            <div className="text-xs font-semibold leading-6 sidebar-text-muted mb-2">
              Store Status
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 transition-colors duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium sidebar-text">Active</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <Link
                href="/seller/settings#away-mode"
                className="text-xs sidebar-text-muted hover:text-current flex items-center gap-1 transition-colors duration-200"
              >
                <EyeSlashIcon className="h-3 w-3" />
                Go Away Mode
              </Link>
            </div>

            <div className="text-xs font-semibold leading-6 sidebar-text-muted mb-2">
              Quick Actions
            </div>
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <Link
                  href="/seller/products/new"
                  className="sidebar-item group flex gap-x-3 rounded-md p-2 leading-6 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <PlusIcon
                    className="h-5 w-5 shrink-0 sidebar-text-muted group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200"
                    aria-hidden="true"
                  />
                  Add Product
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="sidebar-item group flex gap-x-3 rounded-md p-2 leading-6 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <HomeIcon
                    className="h-5 w-5 shrink-0 sidebar-text-muted group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200"
                    aria-hidden="true"
                  />
                  View Store
                </Link>
              </li>
            </ul>

            {/* Theme Toggle */}
            <div
              className="mt-4 pt-4 transition-colors duration-200"
              style={{ borderTop: "1px solid hsl(var(--header-border))" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold leading-6 sidebar-text-muted">
                  Theme
                </span>
                <ThemeToggle size="sm" />
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  // Return mobile version if onClose is provided, desktop version otherwise
  if (onClose) {
    return (
      <div className="flex w-full max-w-xs flex-col">{sidebarContent}</div>
    );
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      {sidebarContent}
    </div>
  );
}
