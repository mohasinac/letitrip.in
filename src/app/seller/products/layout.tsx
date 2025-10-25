"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  PlusIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface SellerProductsLayoutProps {
  children: React.ReactNode;
}

export default function SellerProductsLayout({
  children,
}: SellerProductsLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "all",
      name: "All Products",
      icon: Squares2X2Icon,
      href: "/seller/products/all",
    },
    {
      id: "new",
      name: "Add Product",
      icon: PlusIcon,
      href: "/seller/products/new",
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: ArchiveBoxIcon,
      href: "/seller/products/inventory",
    },
    {
      id: "manage",
      name: "Manage Stock",
      icon: PencilIcon,
      href: "/seller/products/inventory/manage",
    },
    {
      id: "alerts",
      name: "Stock Alerts",
      icon: ExclamationTriangleIcon,
      href: "/seller/products/inventory/alerts",
    },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Product Management
              </h1>
              <p className="mt-1 text-sm text-muted">
                Manage your products, inventory, and stock levels
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;

                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="admin-card p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
