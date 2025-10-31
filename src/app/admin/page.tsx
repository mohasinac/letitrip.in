"use client";

import { ShoppingCart, Users, TrendingUp, AlertTriangle } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  change: string;
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-blue-600 p-3 rounded-lg flex items-center justify-center text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      {value}
    </h3>
    <p className="text-sm text-green-600 dark:text-green-400">{change}</p>
  </div>
);

function AdminDashboardContent() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
      active: true,
    },
  ]);

  const stats = [
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: "1,234",
      change: "+12% from last month",
    },
    {
      icon: Users,
      title: "Total Users",
      value: "892",
      change: "+8% from last month",
    },
    {
      icon: TrendingUp,
      title: "Revenue",
      value: "$45,231",
      change: "+22% from last month",
    },
    {
      icon: AlertTriangle,
      title: "Pending Orders",
      value: "23",
      change: "3 needs attention",
    },
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Recent Activity
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your admin dashboard is ready. Navigate using the sidebar to manage
            products, orders, users, and more.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboardContent />
    </RoleGuard>
  );
}
