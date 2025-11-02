"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Package,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Gamepad2,
  Tag,
  Megaphone,
  Bell,
  FileText,
  TrendingUp,
  Shield,
  Store,
  Truck,
  TicketPercent,
  DollarSign,
  User,
  Heart,
  MapPin,
  LogOut,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { SELLER_ROUTES } from "@/constants/routes";

interface UnifiedSidebarProps {
  open?: boolean;
  onToggle?: (open: boolean) => void;
  unreadAlerts?: number;
}

// Admin menu items
const adminMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", badge: false },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    badge: false,
  },
  {
    label: "Products",
    icon: ShoppingCart,
    href: "/admin/products",
    badge: false,
  },
  {
    label: "Categories",
    icon: FolderTree,
    href: "/admin/categories",
    badge: false,
  },
  { label: "Orders", icon: Package, href: "/admin/orders", badge: false },
  { label: "Users", icon: Users, href: "/admin/users", badge: false },
  { label: "Coupons", icon: Tag, href: "/admin/coupons", badge: false },
  { label: "Sales", icon: Megaphone, href: "/admin/sales", badge: false },
  { label: "Reviews", icon: FileText, href: "/admin/reviews", badge: false },
  {
    label: "Support",
    icon: HeadphonesIcon,
    href: "/admin/support",
    badge: false,
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/admin/notifications",
    badge: false,
  },
  {
    label: "Game",
    icon: Gamepad2,
    href: "/admin/game/beyblades",
    badge: false,
  },
  { label: "Settings", icon: Settings, href: "/admin/settings", badge: false },
];

// Seller menu items
const sellerMenuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: SELLER_ROUTES.DASHBOARD,
    badge: false,
  },
  {
    label: "Shop Setup",
    icon: Store,
    href: SELLER_ROUTES.SHOP_SETUP,
    badge: false,
  },
  {
    label: "Products",
    icon: ShoppingCart,
    href: SELLER_ROUTES.PRODUCTS,
    badge: false,
  },
  { label: "Orders", icon: Package, href: SELLER_ROUTES.ORDERS, badge: false },
  {
    label: "Shipments",
    icon: Truck,
    href: SELLER_ROUTES.SHIPMENTS,
    badge: false,
  },
  {
    label: "Coupons",
    icon: TicketPercent,
    href: SELLER_ROUTES.COUPONS,
    badge: false,
  },
  { label: "Sales", icon: Megaphone, href: SELLER_ROUTES.SALES, badge: false },
  {
    label: "Analytics",
    icon: BarChart3,
    href: SELLER_ROUTES.ANALYTICS,
    badge: false,
  },
  {
    label: "Revenue",
    icon: DollarSign,
    href: `${SELLER_ROUTES.ANALYTICS}?tab=revenue`,
    badge: false,
  },
  { label: "Alerts", icon: Bell, href: SELLER_ROUTES.ALERTS, badge: true },
  {
    label: "Settings",
    icon: Settings,
    href: SELLER_ROUTES.SETTINGS,
    badge: false,
  },
];

// User menu items (for logged-in users on non-admin/seller routes)
const userMenuItems = [
  { label: "Profile", icon: User, href: "/profile", badge: false },
  { label: "Orders", icon: Package, href: "/account/orders", badge: false },
  { label: "Wishlist", icon: Heart, href: "/account/wishlist", badge: false },
  {
    label: "Track Order",
    icon: MapPin,
    href: "/account/track-order",
    badge: false,
  },
];

export default function UnifiedSidebar({
  open = true,
  onToggle,
  unreadAlerts = 0,
}: UnifiedSidebarProps) {
  const { isDark } = useModernTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname() || "";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.(!isCollapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Determine which menu items to show based on route and user role
  const isAdminRoute = pathname.startsWith("/admin");
  const isSellerRoute = pathname.startsWith("/seller");

  let menuItems = userMenuItems;
  let headerTitle = "My Account";
  let gradientFrom = "from-blue-600";
  let gradientTo = "to-blue-700";
  let hoverColor = "hover:bg-blue-50";
  let activeGradient = "from-blue-600 to-blue-700";

  if (user?.role === "admin" && isAdminRoute) {
    menuItems = adminMenuItems;
    headerTitle = "Admin Panel";
    gradientFrom = "from-blue-600";
    gradientTo = "to-purple-600";
    hoverColor = "hover:bg-blue-50";
    activeGradient = "from-blue-600 to-blue-700";
  } else if (
    (user?.role === "seller" || user?.role === "admin") &&
    isSellerRoute
  ) {
    menuItems = sellerMenuItems;
    headerTitle = "Seller Panel";
    gradientFrom = "from-green-600";
    gradientTo = "to-emerald-600";
    hoverColor = "hover:bg-green-50";
    activeGradient = "from-green-600 to-green-700";
  }

  const isItemActive = (href: string) => {
    if (href === "/admin" || href === SELLER_ROUTES.DASHBOARD) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Don't show sidebar if user is not logged in
  if (!user || !open) return null;

  // Only show on admin/seller routes, or for logged-in users
  const shouldShowSidebar = isAdminRoute || isSellerRoute || user;
  if (!shouldShowSidebar) return null;

  return (
    <aside
      className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col sticky top-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{ minWidth: isCollapsed ? "5rem" : "16rem" }}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 min-h-16">
        {!isCollapsed && (
          <h2
            className={`text-base font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
          >
            {headerTitle}
          </h2>
        )}
        <button
          onClick={handleToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          const showBadge = item.badge && unreadAlerts > 0;

          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 no-underline group ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg`
                    : `text-gray-700 dark:text-gray-300 ${hoverColor} dark:hover:bg-gray-800`
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="relative flex items-center">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-white animate-pulse"
                        : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="ml-3 flex-1 font-medium">{item.label}</span>
                )}
                {!isCollapsed && showBadge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadAlerts > 99
                      ? "99+"
                      : unreadAlerts > 9
                      ? "9+"
                      : unreadAlerts}
                  </span>
                )}
              </Link>
              {/* Add separators for logical grouping */}
              {isAdminRoute && (index === 1 || index === 5 || index === 10) && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4"></div>
              )}
              {isSellerRoute && (index === 1 || index === 4 || index === 7) && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4"></div>
              )}
            </React.Fragment>
          );
        })}

        {/* User-specific items shown on all routes */}
        {!isAdminRoute && !isSellerRoute && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4"></div>

            {/* Show admin/seller panel links if user has those roles */}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 no-underline group text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
                title={isCollapsed ? "Admin Panel" : undefined}
              >
                <Shield className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {!isCollapsed && (
                  <span className="ml-3 flex-1 font-medium">Admin Panel</span>
                )}
              </Link>
            )}

            {(user?.role === "seller" || user?.role === "admin") && (
              <Link
                href="/seller/dashboard"
                className="flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 no-underline group text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800"
                title={isCollapsed ? "Seller Panel" : undefined}
              >
                <Store className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {!isCollapsed && (
                  <span className="ml-3 flex-1 font-medium">Seller Panel</span>
                )}
              </Link>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4"></div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 no-underline group text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-800"
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {!isCollapsed && (
                <span className="ml-3 flex-1 font-medium">Logout</span>
              )}
            </button>
          </>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div
        className={`p-4 border-t border-gray-200 dark:border-gray-800 ${
          isCollapsed ? "text-center" : ""
        }`}
      >
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* User info */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center text-white font-bold text-sm`}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Version and status */}
            {(isAdminRoute || isSellerRoute) && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{isSellerRoute ? "Store Status" : "Version"}</span>
                  {isSellerRoute ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  ) : (
                    <span className="font-semibold">v1.2.0</span>
                  )}
                </div>
                {!isSellerRoute && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      75%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div
            className={`w-8 h-8 mx-auto rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}
          >
            {isSellerRoute ? (
              <Store className="h-4 w-4 text-white" />
            ) : (
              <Shield className="h-4 w-4 text-white" />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
