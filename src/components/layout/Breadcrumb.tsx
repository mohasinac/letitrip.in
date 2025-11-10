"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useMemo } from "react";
import { generateBreadcrumbSchema, generateJSONLD } from "@/lib/seo/schema";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

// Custom labels for specific routes
const ROUTE_LABELS: Record<string, string> = {
  // User routes
  "/user/favorites": "Favorites",
  "/user/orders": "My Orders",
  "/user/history": "Order History",
  "/user/messages": "Messages",
  "/user/settings": "Settings",

  // Shop routes
  "/shops": "Shops",

  // Product routes
  "/categories": "Categories",
  "/cart": "Shopping Cart",
  "/coupons": "Coupons",

  // Auth routes
  "/login": "Sign In",
  "/register": "Register",
  "/logout": "Logout",

  // Support routes
  "/support/ticket": "Support Ticket",

  // About
  "/about": "About Us",

  // Admin routes
  "/admin": "Admin Dashboard",
  "/admin/users": "Manage Users",
  "/admin/products": "Manage Products",
  "/admin/orders": "Manage Orders",

  // Seller routes
  "/seller": "Seller Dashboard",
  "/seller/products": "My Products",
  "/seller/orders": "My Orders",

  // Other routes
  "/unauthorized": "Unauthorized Access",
};

export default function Breadcrumb() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Don't show breadcrumb on home page
    if (pathname === "/") {
      return [];
    }

    const segments = pathname.split("/").filter((segment) => segment !== "");
    const items: BreadcrumbItem[] = [];

    // Always add home
    items.push({
      label: "Home",
      href: "/",
      isCurrentPage: false,
    });

    // Build breadcrumb trail
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Get label from custom labels or capitalize segment
      let label = ROUTE_LABELS[currentPath];

      if (!label) {
        // Try to format the segment nicely
        label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      items.push({
        label,
        href: currentPath,
        isCurrentPage: isLast,
      });
    });

    return items;
  }, [pathname]);

  // Generate breadcrumb schema for SEO
  const breadcrumbSchema = useMemo(() => {
    if (breadcrumbs.length === 0) return null;

    return generateBreadcrumbSchema(
      breadcrumbs.map((item) => ({
        name: item.label,
        url: item.href,
      })),
    );
  }, [breadcrumbs]);

  // Don't render if no breadcrumbs (home page)
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <>
      {/* JSON-LD Schema */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJSONLD(breadcrumbSchema)}
        />
      )}

      <nav
        aria-label="Breadcrumb"
        className="bg-gray-50 border-b border-gray-200 py-3 px-4"
      >
        <div className="container mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}

                {item.isCurrentPage ? (
                  // Current page - not clickable
                  <span className="flex items-center gap-1.5 text-gray-900 font-medium">
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </span>
                ) : (
                  // Clickable link
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-yellow-600 transition-colors"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
