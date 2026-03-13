"use client";

import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Zap,
  MessageCircle,
  Bell,
  Settings,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { Drawer } from "@mohasinac/ui";
import { MediaAvatar, Span, Text, Nav, Aside } from "@/components";
import { ROUTES } from "@/constants";
import { useAuth, useNotifications, useRipCoinBalance } from "@/hooks";

interface UserSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  badge?: number | string;
  highlight?: boolean;
  highlightClass?: string;
}

function useSidebarBadges() {
  const { unreadCount } = useNotifications();
  const { data } = useRipCoinBalance();
  const ripCoins = data?.ripcoinBalance ?? 0;
  return { notifBadge: unreadCount, ripCoinBadge: ripCoins };
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("nav");
  const tHub = useTranslations("userHub");
  const pathname = usePathname();
  const { user } = useAuth();
  const { notifBadge, ripCoinBadge } = useSidebarBadges();

  const navItems: NavItem[] = [
    { href: ROUTES.USER.PROFILE, labelKey: "myProfile", icon: User },
    { href: ROUTES.USER.ORDERS, labelKey: "myOrders", icon: ShoppingBag },
    { href: ROUTES.USER.WISHLIST, labelKey: "myWishlist", icon: Heart },
    { href: ROUTES.USER.ADDRESSES, labelKey: "myAddresses", icon: MapPin },
    {
      href: ROUTES.USER.RIPCOINS,
      labelKey: "myRipCoins",
      icon: Zap,
      badge: ripCoinBadge > 0 ? ripCoinBadge.toLocaleString() : undefined,
    },
    { href: ROUTES.USER.MESSAGES, labelKey: "myMessages", icon: MessageCircle },
    {
      href: ROUTES.USER.NOTIFICATIONS,
      labelKey: "notifications",
      icon: Bell,
      badge: notifBadge > 0 ? notifBadge : undefined,
    },
  ];

  const bottomItems: NavItem[] = [
    ...(user?.role === "user"
      ? [
          {
            href: ROUTES.USER.BECOME_SELLER,
            labelKey: "becomeSeller",
            icon: TrendingUp,
            highlight: true,
            highlightClass:
              "text-cobalt-600 dark:text-cobalt-400 font-semibold",
          } satisfies NavItem,
        ]
      : []),
    { href: ROUTES.USER.SETTINGS, labelKey: "settings", icon: Settings },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Profile header */}
      {user && (
        <div className="px-4 py-5 border-b border-zinc-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <MediaAvatar
              src={user.photoURL ?? undefined}
              alt={user.displayName ?? user.email ?? "User"}
              size="md"
            />
            <div className="min-w-0">
              <Text size="sm" weight="semibold" className="truncate">
                {user.displayName ?? user.email}
              </Text>
              <Text size="xs" variant="secondary" className="capitalize">
                {user.role}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <Nav
        aria-label="User account navigation"
        className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group ${
                active
                  ? "bg-secondary-500/10 text-secondary-600 dark:text-secondary-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <Span className="flex-1">
                {t(item.labelKey as Parameters<typeof t>[0])}
              </Span>
              {item.badge !== undefined && (
                <Span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-xs font-medium bg-secondary-500 text-white">
                  {item.badge}
                </Span>
              )}
            </Link>
          );
        })}
      </Nav>

      {/* Divider */}
      <div className="h-px mx-4 bg-zinc-200 dark:bg-slate-700" />

      {/* Bottom items */}
      <div className="py-3 px-2 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group ${
                item.highlight
                  ? `${item.highlightClass ?? ""} hover:bg-cobalt-50 dark:hover:bg-cobalt-900/20`
                  : active
                    ? "bg-secondary-500/10 text-secondary-600 dark:text-secondary-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <Span className="flex-1">
                {t(item.labelKey as Parameters<typeof t>[0])}
              </Span>
              {item.highlight && (
                <Span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-900/40 dark:text-cobalt-300">
                  {tHub("becomeSellerCta")}
                </Span>
              )}
              {!item.highlight && (
                <ChevronRight
                  className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity"
                  strokeWidth={1.5}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function UserSidebar({ mobileOpen, onMobileClose }: UserSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <Aside className="hidden md:flex flex-col w-56 shrink-0 min-h-screen border-r border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <SidebarContent />
      </Aside>

      {/* Mobile bottom-sheet Drawer */}
      <Drawer
        isOpen={mobileOpen}
        onClose={onMobileClose}
        side="bottom"
        size="lg"
        title="My Account"
        showCloseButton
      >
        <SidebarContent onClose={onMobileClose} />
      </Drawer>
    </>
  );
}
