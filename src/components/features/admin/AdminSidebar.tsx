"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  TagIcon,
  BellIcon,
  CogIcon,
  StarIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  DocumentTextIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/ThemeToggle";

const adminNavItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Homepage",
    href: "/admin/homepage",
    icon: PhotoIcon,
    description: "Configure homepage sections",
  },
  {
    name: "Policies",
    href: "/admin/policies",
    icon: DocumentTextIcon,
    description: "Manage legal policies",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: BuildingStorefrontIcon,
    description: "Manage all store products",
  },
  {
    name: "Auctions",
    href: "/admin/auctions",
    icon: SparklesIcon,
    description: "Monitor all auctions",
  },
  {
    name: "Orders Management",
    href: "/admin/orders",
    icon: ShoppingBagIcon,
    description: "View all users' orders",
  },
  {
    name: "Customer Management",
    href: "/admin/customers",
    icon: UsersIcon,
    description: "Manage users, roles & badges",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: ChartBarIcon,
    description: "Site metrics & reports",
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: TagIcon,
    description: "Manage product categories",
  },
  {
    name: "Reviews Management",
    href: "/admin/reviews",
    icon: StarIcon,
    description: "Approve/remove reviews",
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: BellIcon,
    description: "Website notifications",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: CogIcon,
    description: "Site configuration",
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps = {}) {
  const pathname = usePathname();

  const sidebarContent = (
    <div
      className="flex grow flex-col gap-y-5 overflow-y-auto sidebar-bg px-6 border-r transition-colors duration-200"
      style={{ borderColor: "hsl(var(--header-border))" }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold sidebar-text">JustForView</span>
          <span className="text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded transition-colors duration-200">
            Admin
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
              {adminNavItems.map((item) => {
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

          {/* Quick Actions */}
          <li className="mt-auto">
            <div className="text-xs font-semibold leading-6 sidebar-text-muted mb-2">
              Quick Actions
            </div>
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <Link
                  href="/seller/dashboard"
                  className="sidebar-item group flex gap-x-3 rounded-md p-2 leading-6 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <ClipboardDocumentListIcon
                    className="h-5 w-5 shrink-0 sidebar-text-muted group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
                    aria-hidden="true"
                  />
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="sidebar-item group flex gap-x-3 rounded-md p-2 leading-6 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <EyeIcon
                    className="h-5 w-5 shrink-0 sidebar-text-muted group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200"
                    aria-hidden="true"
                  />
                  View Public Reviews
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
