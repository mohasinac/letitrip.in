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
} from "@heroicons/react/24/outline";

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

export default function SellerSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">JustForView</span>
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Seller
            </span>
          </Link>
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
                        className={`
                          group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors
                          ${
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-blue-700"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-gray-500 group-hover:text-blue-600">
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
              <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">
                Store Status
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <Link
                  href="/seller/settings#away-mode"
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <EyeSlashIcon className="h-3 w-3" />
                  Go Away Mode
                </Link>
              </div>

              <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">
                Quick Actions
              </div>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <Link
                    href="/seller/products/new"
                    className="text-gray-700 hover:text-green-700 hover:bg-green-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <PlusIcon
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-green-700"
                      aria-hidden="true"
                    />
                    Add Product
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <HomeIcon
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-purple-700"
                      aria-hidden="true"
                    />
                    View Store
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
