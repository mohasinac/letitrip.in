"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Package,
  Store,
  Gavel,
  Wallet,
  FileText,
  Images,
  LayoutGrid,
  HelpCircle,
  ImageIcon,
  Users,
  Star,
  CalendarDays,
  Flag,
  Settings,
  FolderTree,
  Tag,
} from "lucide-react";
import { Drawer } from "@mohasinac/ui";
import { Nav, Span, Text, Aside } from "@/components";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: "groupOverview",
    items: [
      {
        href: ROUTES.ADMIN.DASHBOARD,
        labelKey: "dashboard",
        icon: LayoutDashboard,
      },
      { href: ROUTES.ADMIN.ANALYTICS, labelKey: "analytics", icon: BarChart3 },
    ],
  },
  {
    groupKey: "groupMarketplace",
    items: [
      { href: ROUTES.ADMIN.ORDERS, labelKey: "orders", icon: ShoppingCart },
      { href: ROUTES.ADMIN.PRODUCTS, labelKey: "productsAdmin", icon: Package },
      { href: ROUTES.ADMIN.STORES, labelKey: "stores", icon: Store },
      { href: ROUTES.ADMIN.BIDS, labelKey: "bidsAdmin", icon: Gavel },
      { href: ROUTES.ADMIN.PAYOUTS, labelKey: "payoutsAdmin", icon: Wallet },
    ],
  },
  {
    groupKey: "groupContent",
    items: [
      { href: ROUTES.ADMIN.BLOG, labelKey: "blogAdmin", icon: FileText },
      { href: ROUTES.ADMIN.CAROUSEL, labelKey: "carousel", icon: Images },
      { href: ROUTES.ADMIN.SECTIONS, labelKey: "sections", icon: LayoutGrid },
      { href: ROUTES.ADMIN.FAQS, labelKey: "faqs", icon: HelpCircle },
      { href: ROUTES.ADMIN.MEDIA, labelKey: "media", icon: ImageIcon },
    ],
  },
  {
    groupKey: "groupCommunity",
    items: [
      { href: ROUTES.ADMIN.USERS, labelKey: "users", icon: Users },
      { href: ROUTES.ADMIN.REVIEWS, labelKey: "reviews", icon: Star },
      {
        href: ROUTES.ADMIN.EVENTS,
        labelKey: "eventsAdmin",
        icon: CalendarDays,
      },
      {
        href: ROUTES.ADMIN.FEATURE_FLAGS,
        labelKey: "featureFlags",
        icon: Flag,
      },
    ],
  },
  {
    groupKey: "groupPlatform",
    items: [
      { href: ROUTES.ADMIN.SITE, labelKey: "siteSettings", icon: Settings },
      {
        href: ROUTES.ADMIN.CATEGORIES,
        labelKey: "categories",
        icon: FolderTree,
      },
      { href: ROUTES.ADMIN.COUPONS, labelKey: "coupons", icon: Tag },
    ],
  },
];

interface SidebarContentProps {
  pathname: string;
  t: (key: string) => string;
  tNav: (key: string) => string;
  onNavClick?: () => void;
}

function SidebarContent({
  pathname,
  t,
  tNav,
  onNavClick,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo row */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-200 dark:border-white/5">
        <Span className="font-display text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
          LetItRip
        </Span>
        <Span className="bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs rounded-full px-2 py-0.5 font-medium">
          Admin
        </Span>
      </div>

      {/* Nav groups */}
      <Nav
        className="flex-1 overflow-y-auto py-3 px-2"
        aria-label={t("adminNav")}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.groupKey} className="mb-1">
            <Text
              size="xs"
              weight="medium"
              variant="muted"
              className="tracking-widest px-3 mb-1 mt-4 uppercase block"
            >
              {t(group.groupKey)}
            </Text>
            {group.items.map((item) => {
              const isActive =
                item.href === ROUTES.ADMIN.DASHBOARD
                  ? pathname === item.href || pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors mb-0.5 ${
                    isActive
                      ? "bg-primary-500/15 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon
                    className="h-4 w-4 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  {tNav(item.labelKey)}
                </Link>
              );
            })}
          </div>
        ))}
      </Nav>
    </div>
  );
}

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  desktopOpen?: boolean;
}

/**
 * AdminSidebar
 *
 * Fixed left-sidebar for the admin portal.
 * Desktop: always visible w-64 when desktopOpen, collapsible via toggle in AdminTopBar.
 * Mobile: slide-in Drawer triggered from AdminTopBar.
 */
export function AdminSidebar({
  mobileOpen,
  onMobileClose,
  desktopOpen = true,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("adminNav");
  const tNav = useTranslations("nav");

  return (
    <>
      {/* Desktop sidebar */}
      <Aside
        className={`${
          desktopOpen ? "hidden md:flex w-64" : "hidden"
        } bg-white dark:bg-slate-950 flex-shrink-0 flex-col h-full overflow-y-auto border-r border-zinc-200 dark:border-white/5`}
      >
        <SidebarContent pathname={pathname} t={t} tNav={tNav} />
      </Aside>

      {/* Mobile drawer */}
      <Drawer
        isOpen={mobileOpen}
        onClose={onMobileClose}
        side="left"
        size="sm"
        title="Admin Navigation"
      >
        <SidebarContent
          pathname={pathname}
          t={t}
          tNav={tNav}
          onNavClick={onMobileClose}
        />
      </Drawer>
    </>
  );
}
