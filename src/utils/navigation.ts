/**
 * Navigation utilities for the refactored route structure
 */

import {
  ACCOUNT_ROUTES,
  SHOP_ROUTES,
  PUBLIC_ROUTES,
  SELLER_ROUTES,
  ADMIN_ROUTES,
} from "@/constants/routes";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
}

// Main navigation items for the header
export const getMainNavigation = (): NavigationItem[] => [
  {
    label: "Home",
    href: PUBLIC_ROUTES.HOME,
  },
  {
    label: "Products",
    href: SHOP_ROUTES.PRODUCTS,
    children: [
      {
        label: "All Products",
        href: SHOP_ROUTES.PRODUCTS,
        description: "Browse our complete catalog",
      },
      {
        label: "Categories",
        href: SHOP_ROUTES.CATEGORIES,
        description: "Shop by category",
      },
      {
        label: "Compare Products",
        href: SHOP_ROUTES.COMPARE,
        description: "Compare features side by side",
      },
    ],
  },
  {
    label: "Game",
    href: "/game",
    description: "Play Beyblade games and demos",
  },
  {
    label: "Stores",
    href: SHOP_ROUTES.STORES,
    children: [
      {
        label: "All Stores",
        href: SHOP_ROUTES.STORES,
        description: "Browse seller stores",
      },
      {
        label: "Auctions",
        href: SHOP_ROUTES.AUCTIONS,
        description: "Live auctions and bidding",
      },
    ],
  },
  {
    label: "About",
    href: PUBLIC_ROUTES.ABOUT,
  },
  {
    label: "Help",
    href: PUBLIC_ROUTES.HELP,
    children: [
      {
        label: "Help Center",
        href: PUBLIC_ROUTES.HELP,
        description: "Get support and answers",
      },
      {
        label: "FAQ",
        href: PUBLIC_ROUTES.FAQ,
        description: "Frequently asked questions",
      },
      {
        label: "Contact Us",
        href: PUBLIC_ROUTES.CONTACT,
        description: "Get in touch with us",
      },
    ],
  },
];

// Account navigation items for user dashboard
export const getAccountNavigation = (): NavigationItem[] => [
  {
    label: "Dashboard",
    href: ACCOUNT_ROUTES.DASHBOARD,
    description: "Account overview and stats",
  },
  {
    label: "Profile",
    href: ACCOUNT_ROUTES.PROFILE,
    description: "Manage your profile information",
  },
  {
    label: "Orders",
    href: ACCOUNT_ROUTES.ORDERS,
    description: "View and track your orders",
    children: [
      {
        label: "All Orders",
        href: ACCOUNT_ROUTES.ORDERS,
        description: "Complete order history",
      },
      {
        label: "Track Order",
        href: ACCOUNT_ROUTES.TRACK_ORDER,
        description: "Track active shipments",
      },
      {
        label: "Returns",
        href: ACCOUNT_ROUTES.RETURNS,
        description: "Manage returns and refunds",
      },
    ],
  },
  {
    label: "Shopping",
    href: ACCOUNT_ROUTES.CART,
    description: "Cart and shopping preferences",
    children: [
      {
        label: "Shopping Cart",
        href: ACCOUNT_ROUTES.CART,
        description: "Items in your cart",
      },
      {
        label: "Wishlist",
        href: ACCOUNT_ROUTES.WISHLIST,
        description: "Saved items for later",
      },
    ],
  },
  {
    label: "Addresses",
    href: ACCOUNT_ROUTES.ADDRESSES,
    description: "Manage shipping addresses",
  },
  {
    label: "Reviews",
    href: ACCOUNT_ROUTES.REVIEWS,
    description: "Your product reviews",
  },
  {
    label: "Notifications",
    href: ACCOUNT_ROUTES.NOTIFICATIONS,
    description: "Account notifications",
  },
  {
    label: "Settings",
    href: ACCOUNT_ROUTES.SETTINGS,
    description: "Account preferences",
  },
];

// Seller navigation items
export const getSellerNavigation = (): NavigationItem[] => [
  {
    label: "Dashboard",
    href: SELLER_ROUTES.DASHBOARD,
    description: "Seller overview and metrics",
  },
  {
    label: "Analytics",
    href: SELLER_ROUTES.ANALYTICS,
    description: "Sales performance and insights",
  },
  {
    label: "Products",
    href: SELLER_ROUTES.PRODUCTS,
    description: "Manage your products",
    children: [
      {
        label: "All Products",
        href: SELLER_ROUTES.PRODUCTS,
        description: "View all your products",
      },
      {
        label: "Add Product",
        href: SELLER_ROUTES.NEW_PRODUCT,
        description: "Create new product listing",
      },
      {
        label: "Inventory",
        href: SELLER_ROUTES.INVENTORY,
        description: "Manage stock levels",
      },
    ],
  },
  {
    label: "Orders",
    href: SELLER_ROUTES.ORDERS,
    description: "Manage customer orders",
  },
  {
    label: "Auctions",
    href: SELLER_ROUTES.AUCTIONS,
    description: "Manage auction listings",
  },
  {
    label: "Notifications",
    href: SELLER_ROUTES.NOTIFICATIONS,
    description: "Seller notifications",
  },
  {
    label: "Settings",
    href: SELLER_ROUTES.SETTINGS,
    description: "Store and account settings",
  },
];

// Admin navigation items
export const getAdminNavigation = (): NavigationItem[] => [
  {
    label: "Dashboard",
    href: ADMIN_ROUTES.DASHBOARD,
    description: "Platform overview",
  },
  {
    label: "Analytics",
    href: ADMIN_ROUTES.ANALYTICS,
    description: "Platform-wide analytics",
  },
  {
    label: "Content",
    href: ADMIN_ROUTES.PRODUCTS,
    description: "Content management",
    children: [
      {
        label: "Products",
        href: ADMIN_ROUTES.PRODUCTS,
        description: "Manage all products",
      },
      {
        label: "Categories",
        href: ADMIN_ROUTES.CATEGORIES,
        description: "Manage categories",
      },
      {
        label: "Homepage",
        href: ADMIN_ROUTES.HOMEPAGE,
        description: "Configure homepage",
      },
      {
        label: "Auctions",
        href: ADMIN_ROUTES.AUCTIONS,
        description: "Manage auctions",
      },
    ],
  },
  {
    label: "Users",
    href: ADMIN_ROUTES.CUSTOMERS,
    description: "User management",
    children: [
      {
        label: "Customers",
        href: ADMIN_ROUTES.CUSTOMERS,
        description: "Manage customer accounts",
      },
      {
        label: "Orders",
        href: ADMIN_ROUTES.ORDERS,
        description: "Platform orders",
      },
      {
        label: "Reviews",
        href: ADMIN_ROUTES.REVIEWS,
        description: "Moderate reviews",
      },
    ],
  },
  {
    label: "Platform",
    href: ADMIN_ROUTES.SETTINGS,
    description: "Platform management",
    children: [
      {
        label: "Settings",
        href: ADMIN_ROUTES.SETTINGS,
        description: "Platform configuration",
      },
      {
        label: "Coupons",
        href: ADMIN_ROUTES.COUPONS,
        description: "Manage coupons",
      },
      {
        label: "Policies",
        href: ADMIN_ROUTES.POLICIES,
        description: "Legal policies",
      },
      {
        label: "Data Management",
        href: ADMIN_ROUTES.DATA_MANAGEMENT,
        description: "Data tools",
      },
    ],
  },
  {
    label: "Notifications",
    href: ADMIN_ROUTES.NOTIFICATIONS,
    description: "System notifications",
  },
];

// Breadcrumb generation
export const generateBreadcrumbs = (pathname: string): NavigationItem[] => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: NavigationItem[] = [{ label: "Home", href: "/" }];

  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Handle route groups
    if (segment.startsWith("(") && segment.endsWith(")")) {
      const group = segment.slice(1, -1);
      switch (group) {
        case "shop":
          breadcrumbs.push({ label: "Shop", href: currentPath });
          break;
        case "account":
          breadcrumbs.push({ label: "Account", href: currentPath });
          break;
        case "seller":
          breadcrumbs.push({ label: "Seller", href: currentPath });
          break;
        case "admin":
          breadcrumbs.push({ label: "Admin", href: currentPath });
          break;
        case "auth":
          breadcrumbs.push({ label: "Authentication", href: currentPath });
          break;
      }
    } else {
      // Convert segment to readable label
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  return breadcrumbs;
};

// Get navigation based on user role
export const getNavigationForRole = (role: string): NavigationItem[] => {
  switch (role) {
    case "admin":
      return getAdminNavigation();
    case "seller":
      return getSellerNavigation();
    case "user":
    default:
      return getAccountNavigation();
  }
};

export default {
  getMainNavigation,
  getAccountNavigation,
  getSellerNavigation,
  getAdminNavigation,
  generateBreadcrumbs,
  getNavigationForRole,
};
