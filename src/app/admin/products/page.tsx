"use client";

import { Plus } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

function AdminProductsContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Products",
      href: "/admin/products",
      active: true,
    },
  ]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Products management interface coming soon. You'll be able to add,
            edit, and delete products from here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminProductsContent />
    </RoleGuard>
  );
}
