"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Plus,
  Gavel,
  ShoppingCart,
  Wallet,
  CreditCard,
  Store,
  MapPin,
  Truck,
  Tag,
} from "lucide-react";
import { Drawer } from "@mohasinac/ui";

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
        href: ROUTES.SELLER.DASHBOARD,
        labelKey: "dashboard",
        icon: LayoutDashboard,
      },
      { href: ROUTES.SELLER.ANALYTICS, labelKey: "analytics", icon: BarChart3 },
    ],
  },
  {
    groupKey: "groupProducts",
    items: [
      { href: ROUTES.SELLER.PRODUCTS, labelKey: "myProducts", icon: Package },
      {
        href: ROUTES.SELLER.PRODUCTS_NEW,
        labelKey: "createProduct",
        icon: Plus,
      },
      { href: ROUTES.SELLER.AUCTIONS, labelKey: "myAuctions", icon: Gavel },
      { href: ROUTES.SELLER.COUPONS, labelKey: "coupons", icon: Tag },
    ],
  },
  {
    groupKey: "groupSales",
    items: [
      { href: ROUTES.SELLER.ORDERS, labelKey: "mySales", icon: ShoppingCart },
      { href: ROUTES.SELLER.PAYOUTS, labelKey: "payoutsAdmin", icon: Wallet },
      {
        href: ROUTES.SELLER.PAYOUT_SETTINGS,
        labelKey: "payoutSettings",
        icon: CreditCard,
      },
    ],
  },
  {
    groupKey: "groupStore",
    items: [
      { href: ROUTES.SELLER.STORE, labelKey: "myStore", icon: Store },
      { href: ROUTES.SELLER.ADDRESSES, labelKey: "myAddresses", icon: MapPin },
      {
        href: ROUTES.SELLER.SHIPPING,
        labelKey: "shippingSettings",
        icon: Truck,
      },
    ],
  },
];

interface SidebarContentProps {
  pathname: string;
  t: (key: string) => string;
  tNav: (key: string) => string;
}

function SidebarContent({ pathname, t, tNav }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo row */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-200 dark:border-slate-700">
        <span className="font-display text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
          LetItRip
        </span>
        <span className="bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 text-xs rounded-full px-2 py-0.5 font-medium">
          Seller
        </span>
      </div>

      {/* Nav groups */}
      <nav
        className="flex-1 overflow-y-auto py-3 px-2"
        aria-label={t("sellerNav")}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.groupKey} className="mb-1">
            <p className="text-zinc-400 dark:text-zinc-500 text-xs tracking-widest px-3 mb-1 mt-4 uppercase font-medium">
              {t(group.groupKey)}
            </p>
            {group.items.map((item) => {
              const isActive =
                item.href === ROUTES.SELLER.DASHBOARD
                  ? pathname === item.href || pathname === "/seller"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors mb-0.5 ${
                    isActive
                      ? "bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400"
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
      </nav>
    </div>
  );
}

interface SellerSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * SellerSidebar
 *
 * Fixed left-sidebar for the seller portal.
 * Desktop: always visible w-56, light/dark bg.
 * Mobile: slide-in Drawer triggered from the seller layout header.
 */
export function SellerSidebar({
  mobileOpen,
  onMobileClose,
}: SellerSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("sellerNav");
  const tNav = useTranslations("nav");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white dark:bg-slate-950 flex-shrink-0 flex-col h-full overflow-y-auto border-r border-zinc-200 dark:border-slate-800">
        <SidebarContent pathname={pathname} t={t} tNav={tNav} />
      </aside>

      {/* Mobile drawer */}
      <Drawer
        isOpen={mobileOpen}
        onClose={onMobileClose}
        side="left"
        size="sm"
        title="Seller Navigation"
      >
        <SidebarContent pathname={pathname} t={t} tNav={tNav} />
      </Drawer>
    </>
  );
}
