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
} from "@heroicons/react/24/outline";

const adminNavItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: HomeIcon,
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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">JustForView</span>
            <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
              Admin
            </span>
          </Link>
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
                        className={`
                          group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors
                          ${
                            isActive
                              ? "bg-red-50 text-red-700"
                              : "text-gray-700 hover:text-red-700 hover:bg-red-50"
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive ? "text-red-700" : "text-gray-400 group-hover:text-red-700"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-gray-500 group-hover:text-red-600">
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
              <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">
                Quick Actions
              </div>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <Link
                    href="/seller/dashboard"
                    className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <ClipboardDocumentListIcon
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-blue-700"
                      aria-hidden="true"
                    />
                    Seller Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reviews"
                    className="text-gray-700 hover:text-green-700 hover:bg-green-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <EyeIcon
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-green-700"
                      aria-hidden="true"
                    />
                    View Public Reviews
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
