import { ChevronRight, Home } from "lucide-react";
import { ComponentType, ReactNode, useMemo } from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

export interface BreadcrumbProps {
  currentPath: string;
  routeLabels?: Record<string, string>;
  showOnHomePage?: boolean;
  LinkComponent: ComponentType<{
    href: string;
    children: ReactNode;
    className?: string;
  }>;
  generateSchema?: (breadcrumbs: Array<{ name: string; url: string }>) => any;
  generateJSONLD?: (schema: any) => { __html: string };
  className?: string;
}

// Default labels for specific routes
const DEFAULT_ROUTE_LABELS: Record<string, string> = {
  // User routes
  "/user/favorites": "Favorites",
  "/user/orders": "My Orders",
  "/user/history": "Order History",
  "/user/messages": "Messages",
  "/user/settings": "Settings",

  // Shop routes
  "/shops": "Shops",

  // Product routes
  "/products": "Products",
  "/categories": "Categories",
  "/auctions": "Auctions",
  "/cart": "Shopping Cart",
  "/coupons": "Coupons",

  // Content routes
  "/blogs": "Blog",
  "/reviews": "Reviews",
  "/orders": "Orders",

  // Auth routes
  "/login": "Sign In",
  "/register": "Register",
  "/logout": "Logout",

  // Support routes
  "/support": "Support",
  "/support/ticket": "Support Ticket",
  "/faq": "FAQ",

  // Legal routes
  "/terms": "Terms of Service",
  "/privacy": "Privacy Policy",
  "/about": "About Us",

  // Admin routes
  "/admin": "Admin Dashboard",
  "/admin/users": "Manage Users",
  "/admin/products": "Manage Products",
  "/admin/orders": "Manage Orders",
  "/admin/categories": "Manage Categories",
  "/admin/shops": "Manage Shops",

  // Seller routes
  "/seller": "Seller Dashboard",
  "/seller/products": "My Products",
  "/seller/orders": "My Orders",
  "/seller/auctions": "My Auctions",

  // Other routes
  "/unauthorized": "Unauthorized Access",
};

/**
 * Breadcrumb Component
 *
 * Displays navigation breadcrumb trail based on current path.
 * Used for site navigation and SEO enhancement.
 *
 * Features:
 * - Automatic breadcrumb generation from URL path
 * - SEO-friendly slug support (buy-*, view-* patterns)
 * - Customizable route labels
 * - Home page icon integration
 * - SEO schema generation support
 * - Current page highlighting
 * - Framework-agnostic with link injection
 * - Dark mode support
 *
 * @example
 * ```tsx
 * // Simple usage
 * <Breadcrumb
 *   currentPath="/user/orders"
 *   LinkComponent={Link}
 * />
 *
 * // With SEO slugs
 * <Breadcrumb
 *   currentPath="/buy-product-orange-juice-500ml"
 *   routeLabels={{
 *     "/buy-product-orange-juice-500ml": "Orange Juice 500ml"
 *   }}
 *   LinkComponent={Link}
 * />
 *
 * // With schema generation
 * <Breadcrumb
 *   currentPath="/buy-category-electronics"
 *   LinkComponent={Link}
 *   generateSchema={generateBreadcrumbSchema}
 *   generateJSONLD={generateJSONLD}
 * />
 * ```
 */
export function Breadcrumb({
  currentPath,
  routeLabels = {},
  showOnHomePage = false,
  LinkComponent,
  generateSchema,
  generateJSONLD,
  className = "",
}: BreadcrumbProps) {
  const breadcrumbs = useMemo(() => {
    // Don't show breadcrumb on home page unless specified
    if (currentPath === "/" && !showOnHomePage) {
      return [];
    }

    const segments = currentPath.split("/").filter((segment) => segment !== "");
    const items: BreadcrumbItem[] = [];

    // Always add home
    items.push({
      label: "Home",
      href: "/",
      isCurrentPage: false,
    });

    // Build breadcrumb trail
    let pathSoFar = "";
    segments.forEach((segment, index) => {
      pathSoFar += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Get label from custom labels, default labels, or format segment
      let label = routeLabels[pathSoFar] || DEFAULT_ROUTE_LABELS[pathSoFar];

      if (!label) {
        // Handle SEO-friendly slugs (buy-*, view-*)
        if (segment.startsWith("buy-") || segment.startsWith("view-")) {
          // Extract type and name from slug
          const parts = segment.split("-");
          const action = parts[0]; // 'buy' or 'view'
          const type = parts[1]; // 'product', 'auction', 'category', etc.
          const nameParts = parts.slice(2); // remaining parts are the name

          // Format type nicely
          const formattedType =
            type.charAt(0).toUpperCase() + type.slice(1) + "s";

          // If we have name parts, use them; otherwise use type
          if (nameParts.length > 0) {
            label = nameParts
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          } else {
            label = formattedType;
          }
        } else {
          // Format the segment nicely (standard hyphen-separated)
          label = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }

      items.push({
        label,
        href: pathSoFar,
        isCurrentPage: isLast,
      });
    });

    return items;
  }, [currentPath, routeLabels, showOnHomePage]);

  // Generate breadcrumb schema for SEO
  const breadcrumbSchema = useMemo(() => {
    if (breadcrumbs.length === 0 || !generateSchema) return null;

    return generateSchema(
      breadcrumbs.map((item) => ({
        name: item.label,
        url: item.href,
      })),
    );
  }, [breadcrumbs, generateSchema]);

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <>
      {/* JSON-LD Schema */}
      {breadcrumbSchema && generateJSONLD && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJSONLD(breadcrumbSchema)}
        />
      )}

      <nav
        aria-label="Breadcrumb"
        className={`bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 ${className}`}
      >
        <div className="container mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />
                )}

                {item.isCurrentPage ? (
                  // Current page - not clickable
                  <span className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </span>
                ) : (
                  // Clickable link
                  <LinkComponent
                    href={item.href}
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </LinkComponent>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
