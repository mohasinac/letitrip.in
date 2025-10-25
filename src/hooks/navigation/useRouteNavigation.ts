"use client";

import { useRouter } from "next/navigation";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  SELLER_ROUTES,
  ADMIN_ROUTES,
  ACCOUNT_ROUTES,
  SHOP_ROUTES,
  getRouteGroup,
  ROUTE_GROUPS,
} from "@/constants/routes";

export function useRouteNavigation() {
  const router = useRouter();
  const navigation = useNavigation();

  // Quick navigation functions for different sections
  const navigateToSellerSettings = (section?: keyof typeof SELLER_ROUTES) => {
    const route = section ? SELLER_ROUTES[section] : SELLER_ROUTES.SETTINGS_GENERAL;
    if (typeof route === "string") {
      navigation.navigate(route);
    }
  };

  const navigateToAdminSettings = (section?: keyof typeof ADMIN_ROUTES) => {
    const route = section ? ADMIN_ROUTES[section] : ADMIN_ROUTES.SETTINGS_GENERAL;
    if (typeof route === "string") {
      navigation.navigate(route);
    }
  };

  const navigateToAccountSettings = (section?: keyof typeof ACCOUNT_ROUTES) => {
    const route = section ? ACCOUNT_ROUTES[section] : ACCOUNT_ROUTES.SETTINGS_GENERAL;
    if (typeof route === "string") {
      navigation.navigate(route);
    }
  };

  // Product navigation
  const navigateToProduct = (productId: string, context: "seller" | "admin" | "shop" = "shop") => {
    switch (context) {
      case "seller":
        navigation.navigate(SELLER_ROUTES.EDIT_PRODUCT(productId));
        break;
      case "admin":
        navigation.navigate(ADMIN_ROUTES.PRODUCT_DETAIL(productId));
        break;
      default:
        navigation.navigate(SHOP_ROUTES.PRODUCT_DETAIL(productId));
    }
  };

  // Order navigation
  const navigateToOrder = (orderId: string, context: "seller" | "admin" | "account" = "account") => {
    switch (context) {
      case "seller":
        navigation.navigate(SELLER_ROUTES.ORDER_DETAIL(orderId));
        break;
      case "admin":
        navigation.navigate(ADMIN_ROUTES.ORDER_DETAIL(orderId));
        break;
      default:
        navigation.navigate(ACCOUNT_ROUTES.ORDER_DETAIL(orderId));
    }
  };

  // Smart navigation based on current context
  const navigateInContext = (destination: string) => {
    const currentGroup = getRouteGroup(navigation.currentRoute);
    
    // If we're in a specific context, try to stay within that context
    switch (currentGroup) {
      case ROUTE_GROUPS.SELLER:
        if (destination.includes("product")) {
          navigation.navigate(SELLER_ROUTES.PRODUCTS_ALL);
          return;
        }
        if (destination.includes("order")) {
          navigation.navigate(SELLER_ROUTES.ORDERS_PENDING);
          return;
        }
        if (destination.includes("setting")) {
          navigation.navigate(SELLER_ROUTES.SETTINGS_GENERAL);
          return;
        }
        break;
      
      case ROUTE_GROUPS.ADMIN:
        if (destination.includes("product")) {
          navigation.navigate(ADMIN_ROUTES.PRODUCTS_ALL);
          return;
        }
        if (destination.includes("order")) {
          navigation.navigate(ADMIN_ROUTES.ORDERS_PENDING);
          return;
        }
        if (destination.includes("setting")) {
          navigation.navigate(ADMIN_ROUTES.SETTINGS_GENERAL);
          return;
        }
        break;
      
      case ROUTE_GROUPS.ACCOUNT:
        if (destination.includes("order")) {
          navigation.navigate(ACCOUNT_ROUTES.ORDERS_ACTIVE);
          return;
        }
        if (destination.includes("setting")) {
          navigation.navigate(ACCOUNT_ROUTES.SETTINGS_GENERAL);
          return;
        }
        break;
    }
    
    // Fallback to regular navigation
    navigation.navigate(destination);
  };

  // Get contextual routes based on current location
  const getContextualRoutes = () => {
    const currentGroup = getRouteGroup(navigation.currentRoute);
    
    switch (currentGroup) {
      case ROUTE_GROUPS.SELLER:
        return {
          dashboard: SELLER_ROUTES.DASHBOARD,
          products: SELLER_ROUTES.PRODUCTS_ALL,
          orders: SELLER_ROUTES.ORDERS_PENDING,
          analytics: SELLER_ROUTES.ANALYTICS,
          settings: SELLER_ROUTES.SETTINGS_GENERAL,
        };
      
      case ROUTE_GROUPS.ADMIN:
        return {
          dashboard: ADMIN_ROUTES.DASHBOARD,
          products: ADMIN_ROUTES.PRODUCTS_ALL,
          orders: ADMIN_ROUTES.ORDERS_PENDING,
          customers: ADMIN_ROUTES.CUSTOMERS_ACTIVE,
          analytics: ADMIN_ROUTES.ANALYTICS_SALES,
          settings: ADMIN_ROUTES.SETTINGS_GENERAL,
        };
      
      case ROUTE_GROUPS.ACCOUNT:
        return {
          dashboard: ACCOUNT_ROUTES.DASHBOARD,
          orders: ACCOUNT_ROUTES.ORDERS_ACTIVE,
          profile: ACCOUNT_ROUTES.PROFILE,
          wishlist: ACCOUNT_ROUTES.WISHLIST,
          settings: ACCOUNT_ROUTES.SETTINGS_GENERAL,
        };
      
      default:
        return {
          home: "/",
          shop: SHOP_ROUTES.PRODUCTS,
          categories: SHOP_ROUTES.CATEGORIES,
          stores: SHOP_ROUTES.STORES,
        };
    }
  };

  // Check if we can navigate back within the current section
  const canNavigateBackInSection = () => {
    const segments = navigation.currentRoute.split("/");
    return segments.length > 2; // More than just /section
  };

  // Navigate back within the current section
  const navigateBackInSection = () => {
    if (canNavigateBackInSection()) {
      const segments = navigation.currentRoute.split("/");
      const parentRoute = segments.slice(0, -1).join("/");
      navigation.navigate(parentRoute);
    } else {
      navigation.goBack();
    }
  };

  // Get suggested next routes based on current location
  const getSuggestedRoutes = () => {
    const currentRoute = navigation.currentRoute;
    const suggestions: Array<{ label: string; href: string; reason: string }> = [];

    if (currentRoute.includes("/settings/")) {
      const currentGroup = getRouteGroup(currentRoute);
      
      if (currentGroup === ROUTE_GROUPS.SELLER) {
        suggestions.push(
          { label: "Store Settings", href: SELLER_ROUTES.SETTINGS_STORE, reason: "Configure your store" },
          { label: "Theme Settings", href: SELLER_ROUTES.SETTINGS_THEME, reason: "Customize appearance" }
        );
      } else if (currentGroup === ROUTE_GROUPS.ADMIN) {
        suggestions.push(
          { label: "System Settings", href: ADMIN_ROUTES.SETTINGS_SYSTEM, reason: "Configure system" },
          { label: "Security Settings", href: ADMIN_ROUTES.SETTINGS_SECURITY, reason: "Manage security" }
        );
      }
    }

    if (currentRoute.includes("/products/")) {
      suggestions.push(
        { label: "Add Product", href: SELLER_ROUTES.NEW_PRODUCT, reason: "Create new product" },
        { label: "Inventory", href: SELLER_ROUTES.INVENTORY_MANAGE, reason: "Manage stock" }
      );
    }

    return suggestions;
  };

  return {
    ...navigation,
    
    // Enhanced navigation functions
    navigateToSellerSettings,
    navigateToAdminSettings,
    navigateToAccountSettings,
    navigateToProduct,
    navigateToOrder,
    navigateInContext,
    navigateBackInSection,
    
    // Utility functions
    getContextualRoutes,
    getSuggestedRoutes,
    canNavigateBackInSection,
  };
}

export default useRouteNavigation;
