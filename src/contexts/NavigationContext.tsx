"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRouteGroup, ROUTE_GROUPS } from "@/constants/routes";

interface NavigationState {
  currentRoute: string;
  routeGroup: string;
  breadcrumbs: BreadcrumbItem[];
  isNavigating: boolean;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface NavigationContextValue extends NavigationState {
  navigate: (
    href: string,
    options?: { replace?: boolean; scroll?: boolean }
  ) => Promise<void>;
  goBack: () => void;
  setNavigating: (isNavigating: boolean) => void;
  getNavigationTitle: () => string;
  isCurrentRoute: (href: string) => boolean;
  isRouteActive: (href: string) => boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const routeGroup = getRouteGroup(pathname);

  const navigate = useCallback(
    async (
      href: string,
      options: { replace?: boolean; scroll?: boolean } = {}
    ) => {
      setIsNavigating(true);
      try {
        if (options.replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 300);
      } catch (error) {
        console.error("Navigation error:", error);
        setIsNavigating(false);
      }
    },
    [router]
  );

  const goBack = useCallback(() => {
    setIsNavigating(true);
    router.back();
    setTimeout(() => setIsNavigating(false), 300);
  }, [router]);

  const generateBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({
      label: "Home",
      href: "/",
    });

    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      const isLast = i === segments.length - 1;

      let label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Enhanced label generation for nested routes
      switch (segment) {
        case "account":
          label = "Account";
          break;
        case "seller":
          label = "Seller Panel";
          break;
        case "admin":
          label = "Admin Panel";
          break;
        case "settings":
          label = "Settings";
          break;
        case "products":
          label = "Products";
          break;
        case "orders":
          label = "Orders";
          break;
        case "analytics":
          label = "Analytics";
          break;
        case "notifications":
          label = "Notifications";
          break;
        case "general":
          label = "General";
          break;
        case "theme":
          label = "Theme";
          break;
        case "security":
          label = "Security";
          break;
        case "privacy":
          label = "Privacy";
          break;
        case "billing":
          label = "Billing";
          break;
        case "inventory":
          label = "Inventory";
          break;
        case "pending":
          label = "Pending";
          break;
        case "processing":
          label = "Processing";
          break;
        case "shipped":
          label = "Shipped";
          break;
        case "completed":
          label = "Completed";
          break;
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isActive: isLast,
      });
    }

    return breadcrumbs;
  }, [pathname]);

  const getNavigationTitle = useCallback((): string => {
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment) return "Home";

    const title = lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Add context based on route group
    switch (routeGroup) {
      case ROUTE_GROUPS.ADMIN:
        return `Admin - ${title}`;
      case ROUTE_GROUPS.SELLER:
        return `Seller - ${title}`;
      case ROUTE_GROUPS.ACCOUNT:
        return `Account - ${title}`;
      default:
        return title;
    }
  }, [pathname, routeGroup]);

  const isCurrentRoute = useCallback(
    (href: string): boolean => {
      return pathname === href;
    },
    [pathname]
  );

  const isRouteActive = useCallback(
    (href: string): boolean => {
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const value: NavigationContextValue = {
    currentRoute: pathname,
    routeGroup,
    breadcrumbs: generateBreadcrumbs(),
    isNavigating,
    navigate,
    goBack,
    setNavigating: setIsNavigating,
    getNavigationTitle,
    isCurrentRoute,
    isRouteActive,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

export default NavigationContext;
