import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Public Layout
 *
 * Layout for public pages that don't require authentication.
 * These pages are accessible to all visitors and include:
 * - Product listings and details
 * - Shop pages
 * - Category pages
 * - Blog posts
 * - Auctions
 * - Static pages (about, contact, policies, etc.)
 *
 * The root layout already provides:
 * - Header with navigation
 * - Footer
 * - Bottom navigation (mobile)
 * - Breadcrumbs
 * - All context providers
 *
 * This layout is intentionally minimal to allow public pages
 * to render with full width and flexibility.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
