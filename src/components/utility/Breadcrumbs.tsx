"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { THEME_CONSTANTS } from "@/constants/theme";

/**
 * Breadcrumbs Component
 *
 * Generates and displays breadcrumb navigation based on current URL path.
 * Automatically creates clickable links for each path segment.
 *
 * @component
 * @example
 * ```tsx
 * <Breadcrumbs />
 * ```
 */

// Map of path segments to readable labels
const pathLabels: Record<string, string> = {
  auth: "Authentication",
  login: "Login",
  register: "Register",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "verify-email": "Verify Email",
  profile: "Profile",
  settings: "Settings",
  admin: "Admin",
  users: "Users",
  dashboard: "Dashboard",
  products: "Products",
  auctions: "Auctions",
  shops: "Shops",
  stickers: "Stickers",
  cart: "Cart",
  wishlist: "Wishlist",
  orders: "Orders",
  user: "My Account",
  addresses: "Addresses",
  view: "View",
  add: "Add",
  edit: "Edit",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label =
        pathLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href };
    }),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.border}`}
    >
      <div className="container mx-auto px-4 py-3 md:px-6">
        <ol className="flex items-center gap-2 flex-wrap">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {index > 0 && (
                  <svg
                    className={`w-4 h-4 ${THEME_CONSTANTS.themed.textSecondary}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}

                {isLast ? (
                  <span
                    className={`text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary}`}
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} hover:${THEME_CONSTANTS.themed.textPrimary} transition-colors`}
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
