"use client";

import { useTranslations } from "next-intl";
import { SectionTabs } from "@/components";
import { ROUTES } from "@/constants";

/**
 * AdminTabs Component
 *
 * Navigation tabs for admin section pages (Dashboard, Users, Site, Carousel, etc.)
 * Thin wrapper around SectionTabs with admin-specific config.
 * - Desktop: Full horizontal tab bar with all tabs visible
 * - Mobile: Styled dropdown select with current tab shown
 *
 * @component
 * @example
 * ```tsx
 * <AdminTabs />
 * ```
 */
export default function AdminTabs() {
  const t = useTranslations("nav");
  const tabs = [
    { href: ROUTES.ADMIN.DASHBOARD, label: t("dashboard") },
    { href: ROUTES.ADMIN.USERS, label: t("users") },
    { href: ROUTES.ADMIN.PRODUCTS, label: t("productsAdmin") },
    { href: ROUTES.ADMIN.SITE, label: t("siteSettings") },
    { href: ROUTES.ADMIN.CAROUSEL, label: t("carousel") },
    { href: ROUTES.ADMIN.SECTIONS, label: t("sections") },
    { href: ROUTES.ADMIN.CATEGORIES, label: t("categories") },
    { href: ROUTES.ADMIN.FAQS, label: t("faqs") },
    { href: ROUTES.ADMIN.REVIEWS, label: t("reviews") },
    { href: ROUTES.ADMIN.MEDIA, label: t("media") },
    { href: ROUTES.ADMIN.BIDS, label: t("bidsAdmin") },
    { href: ROUTES.ADMIN.BLOG, label: t("blogAdmin") },
    { href: ROUTES.ADMIN.PAYOUTS, label: t("payoutsAdmin") },
    { href: ROUTES.ADMIN.NEWSLETTER, label: t("newsletterAdmin") },
    { href: ROUTES.ADMIN.EVENTS, label: t("eventsAdmin") },
  ];
  return <SectionTabs tabs={tabs} variant="admin" />;
}
