"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  TopNav,
  BottomNav,
  MegaMenu,
  CommandPalette,
  useSidebar,
  useTopNav,
  useBottomNav,
  useMegaMenu,
  useCommandPalette,
} from "@/components/ui/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Tag,
  Truck,
  MessageSquare,
  FileText,
  Search,
  Plus,
  List,
  Star,
  Bell,
  HelpCircle,
  DollarSign,
} from "lucide-react";

export interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: "admin" | "seller" | "customer";
  };
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const pathname = usePathname();
  const sidebar = useSidebar();
  const topNav = useTopNav();
  const bottomNav = useBottomNav();
  const megaMenu = useMegaMenu();
  const commandPalette = useCommandPalette();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Determine menu items based on user role
  const menuItems = React.useMemo(() => {
    if (user?.role === "admin") return adminMenuItems;
    if (user?.role === "seller") return sellerMenuItems;
    return customerMenuItems;
  }, [user?.role]);

  // Command palette commands
  const commands = React.useMemo(
    () => [
      {
        id: "new-product",
        label: "Create New Product",
        category: "Products",
        icon: <Package className="h-4 w-4" />,
        shortcut: ["⌘", "N"],
        action: () => {
          if (typeof window !== "undefined") {
            window.location.href =
              user?.role === "admin"
                ? "/admin/products/new"
                : "/seller/products/new";
          }
        },
      },
      {
        id: "new-order",
        label: "Create New Order",
        category: "Orders",
        icon: <ShoppingCart className="h-4 w-4" />,
        shortcut: ["⌘", "O"],
        action: () => {
          if (typeof window !== "undefined") {
            window.location.href =
              user?.role === "admin"
                ? "/admin/orders/new"
                : "/seller/orders/new";
          }
        },
      },
      {
        id: "dashboard",
        label: "Go to Dashboard",
        category: "Navigation",
        icon: <Home className="h-4 w-4" />,
        shortcut: ["⌘", "D"],
        action: () => {
          if (typeof window !== "undefined") {
            window.location.href =
              user?.role === "admin" ? "/admin" : "/seller/dashboard";
          }
        },
      },
      {
        id: "products",
        label: "View Products",
        category: "Navigation",
        icon: <Package className="h-4 w-4" />,
        action: () => {
          if (typeof window !== "undefined") {
            window.location.href =
              user?.role === "admin" ? "/admin/products" : "/seller/products";
          }
        },
      },
      {
        id: "orders",
        label: "View Orders",
        category: "Navigation",
        icon: <ShoppingCart className="h-4 w-4" />,
        action: () => {
          if (typeof window !== "undefined") {
            window.location.href =
              user?.role === "admin" ? "/admin/orders" : "/seller/orders";
          }
        },
      },
      {
        id: "analytics",
        label: "View Analytics",
        category: "Navigation",
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => {
          if (typeof window !== "undefined") {
            window.location.href =
              user?.role === "admin" ? "/admin/analytics" : "/seller/analytics";
          }
        },
      },
      {
        id: "settings",
        label: "Settings",
        category: "Navigation",
        icon: <Settings className="h-4 w-4" />,
        shortcut: ["⌘", ","],
        action: () => {
          if (typeof window !== "undefined") {
            window.location.href =
              user?.role === "admin" ? "/admin/settings" : "/seller/shop";
          }
        },
      },
    ],
    [user?.role]
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <Sidebar
          items={menuItems}
          mode={sidebar.mode}
          onModeChange={sidebar.setMode}
          collapsible={true}
          persistState={true}
        />

        <div className="flex-1">
          <TopNav
            logo={<span className="text-xl font-bold">JustForView</span>}
            logoHref="/"
            user={user}
            onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onSearchClick={() => commandPalette.open()}
            notifications={topNav.notifications}
            onNotificationsClick={() => {}}
          />

          <main className="p-6">{children}</main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <TopNav
          logo={<span className="text-xl font-bold">JustForView</span>}
          logoHref="/"
          user={user}
          onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          onSearchClick={() => commandPalette.open()}
          notifications={topNav.notifications}
        />

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 transform transition-transform lg:hidden",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 border-b border-white/10">
            <span className="text-xl font-bold">JustForView</span>
          </div>
          {/* Mobile menu items would go here */}
        </aside>

        <main className="pt-16 pb-20 px-4">{children}</main>

        <BottomNav items={getBottomNavItems(user?.role)} />
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        commands={commands}
        open={commandPalette.isOpen}
        onClose={commandPalette.close}
      />
    </div>
  );
}

// Menu configurations
const adminMenuItems = [
  {
    id: "dashboard",
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
    href: "/admin",
  },
  {
    id: "products",
    icon: <Package className="h-5 w-5" />,
    label: "Products",
    href: "/admin/products",
    children: [
      { id: "all-products", label: "All Products", href: "/admin/products" },
      { id: "add-product", label: "Add Product", href: "/admin/products/new" },
      { id: "categories", label: "Categories", href: "/admin/categories" },
    ],
  },
  {
    id: "orders",
    icon: <ShoppingCart className="h-5 w-5" />,
    label: "Orders",
    href: "/admin/orders",
  },
  {
    id: "users",
    icon: <Users className="h-5 w-5" />,
    label: "Users",
    href: "/admin/users",
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Analytics",
    href: "/admin/analytics",
  },
  {
    id: "coupons",
    icon: <Tag className="h-5 w-5" />,
    label: "Coupons",
    href: "/admin/coupons",
  },
  {
    id: "shipments",
    icon: <Truck className="h-5 w-5" />,
    label: "Shipments",
    href: "/admin/shipments",
  },
  {
    id: "support",
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Support",
    href: "/admin/support",
  },
  {
    id: "reviews",
    icon: <Star className="h-5 w-5" />,
    label: "Reviews",
    href: "/admin/reviews",
  },
  {
    id: "settings",
    icon: <Settings className="h-5 w-5" />,
    label: "Settings",
    href: "/admin/settings",
  },
];

const sellerMenuItems = [
  {
    id: "dashboard",
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
    href: "/seller/dashboard",
  },
  {
    id: "products",
    icon: <Package className="h-5 w-5" />,
    label: "Products",
    href: "/seller/products",
    children: [
      { id: "all-products", label: "All Products", href: "/seller/products" },
      { id: "add-product", label: "Add Product", href: "/seller/products/new" },
    ],
  },
  {
    id: "orders",
    icon: <ShoppingCart className="h-5 w-5" />,
    label: "Orders",
    href: "/seller/orders",
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Analytics",
    href: "/seller/analytics",
  },
  {
    id: "coupons",
    icon: <Tag className="h-5 w-5" />,
    label: "Coupons",
    href: "/seller/coupons",
  },
  {
    id: "sales",
    icon: <DollarSign className="h-5 w-5" />,
    label: "Sales",
    href: "/seller/sales",
  },
  {
    id: "shipments",
    icon: <Truck className="h-5 w-5" />,
    label: "Shipments",
    href: "/seller/shipments",
  },
  {
    id: "shop",
    icon: <Settings className="h-5 w-5" />,
    label: "Shop Setup",
    href: "/seller/shop",
  },
];

const customerMenuItems = [
  { id: "home", icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
  {
    id: "shop",
    icon: <Package className="h-5 w-5" />,
    label: "Shop",
    href: "/shop",
  },
  {
    id: "orders",
    icon: <ShoppingCart className="h-5 w-5" />,
    label: "My Orders",
    href: "/account/orders",
  },
  {
    id: "wishlist",
    icon: <Star className="h-5 w-5" />,
    label: "Wishlist",
    href: "/account/wishlist",
  },
  {
    id: "support",
    icon: <HelpCircle className="h-5 w-5" />,
    label: "Support",
    href: "/support",
  },
];

function getBottomNavItems(role?: "admin" | "seller" | "customer") {
  if (role === "admin") {
    return [
      {
        id: "dashboard",
        icon: <Home className="h-5 w-5" />,
        label: "Home",
        href: "/admin",
      },
      {
        id: "products",
        icon: <Package className="h-5 w-5" />,
        label: "Products",
        href: "/admin/products",
      },
      {
        id: "orders",
        icon: <ShoppingCart className="h-5 w-5" />,
        label: "Orders",
        href: "/admin/orders",
      },
      {
        id: "users",
        icon: <Users className="h-5 w-5" />,
        label: "Users",
        href: "/admin/users",
      },
      {
        id: "settings",
        icon: <Settings className="h-5 w-5" />,
        label: "Settings",
        href: "/admin/settings",
      },
    ];
  }

  if (role === "seller") {
    return [
      {
        id: "dashboard",
        icon: <Home className="h-5 w-5" />,
        label: "Home",
        href: "/seller/dashboard",
      },
      {
        id: "products",
        icon: <Package className="h-5 w-5" />,
        label: "Products",
        href: "/seller/products",
      },
      {
        id: "add",
        icon: <Plus className="h-5 w-5" />,
        label: "Add",
        href: "/seller/products/new",
      },
      {
        id: "orders",
        icon: <ShoppingCart className="h-5 w-5" />,
        label: "Orders",
        href: "/seller/orders",
      },
      {
        id: "shop",
        icon: <Settings className="h-5 w-5" />,
        label: "Shop",
        href: "/seller/shop",
      },
    ];
  }

  return [
    {
      id: "home",
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/",
    },
    {
      id: "shop",
      icon: <Package className="h-5 w-5" />,
      label: "Shop",
      href: "/shop",
    },
    {
      id: "cart",
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Cart",
      href: "/cart",
    },
    {
      id: "orders",
      icon: <List className="h-5 w-5" />,
      label: "Orders",
      href: "/account/orders",
    },
    {
      id: "account",
      icon: <Users className="h-5 w-5" />,
      label: "Account",
      href: "/account",
    },
  ];
}

function getCurrentActiveId(pathname: string | null): string {
  if (!pathname) return "dashboard";

  // Logic to determine active menu item from pathname
  if (
    pathname === "/" ||
    pathname === "/admin" ||
    pathname === "/seller/dashboard"
  ) {
    return "dashboard";
  }
  if (pathname.includes("/products")) return "products";
  if (pathname.includes("/orders")) return "orders";
  if (pathname.includes("/users")) return "users";
  if (pathname.includes("/analytics")) return "analytics";
  if (pathname.includes("/coupons")) return "coupons";
  if (pathname.includes("/shipments")) return "shipments";
  if (pathname.includes("/support")) return "support";
  if (pathname.includes("/reviews")) return "reviews";
  if (pathname.includes("/sales")) return "sales";
  if (pathname.includes("/categories")) return "categories";
  if (pathname.includes("/settings") || pathname.includes("/shop"))
    return "settings";
  if (pathname.includes("/wishlist")) return "wishlist";
  if (pathname.includes("/cart")) return "cart";
  if (pathname.includes("/account")) return "account";

  return "dashboard";
}
