"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  getAvailableDashboards,
  getRoleDisplayName,
  getRoleBadgeClasses,
  UserRole,
} from "@/lib/auth/roles";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function DashboardNavigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  const availableDashboards = getAvailableDashboards(user.role);

  const getIcon = (path: string) => {
    if (path.includes("/admin")) return Squares2X2Icon;
    if (path.includes("/seller")) return ShoppingBagIcon;
    return UserIcon;
  };

  return (
    <div className="bg-background border-b border-border sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-foreground">
              JustForView
            </Link>
          </div>

          {/* Dashboard Links */}
          <div className="hidden md:flex items-center space-x-1">
            {availableDashboards.map((dashboard) => {
              const Icon = getIcon(dashboard.path);
              const isActive = pathname.startsWith(dashboard.path);

              return (
                <Link
                  key={dashboard.path}
                  href={dashboard.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{dashboard.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email
                      ? user.email.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>{" "}
                <div className="hidden sm:block text-left">
                  <div className="font-medium text-foreground">
                    {user.name || user.email || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email || "No email"}
                  </div>
                </div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.email
                          ? user.email.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {user.name || user.email || "User"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email || "No email"}
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getRoleBadgeClasses(
                          user.role
                        )}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Links */}
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Available Dashboards
                  </div>
                  {availableDashboards.map((dashboard) => {
                    const Icon = getIcon(dashboard.path);
                    const isActive = pathname.startsWith(dashboard.path);

                    return (
                      <Link
                        key={dashboard.path}
                        href={dashboard.path}
                        className={`flex items-center space-x-3 px-4 py-2 text-sm hover:bg-accent transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground"
                        }`}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{dashboard.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {dashboard.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Logout */}
                <div className="border-t border-border pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dashboard Links */}
      <div className="md:hidden border-t border-border bg-muted/30">
        <div className="flex space-x-1 px-4 py-2 overflow-x-auto">
          {availableDashboards.map((dashboard) => {
            const Icon = getIcon(dashboard.path);
            const isActive = pathname.startsWith(dashboard.path);

            return (
              <Link
                key={dashboard.path}
                href={dashboard.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{dashboard.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
