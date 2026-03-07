/**
 * Navigation Constants
 *
 * Icon/href data for site navigation. Labels are provided by each consuming
 * component via useTranslations("nav") — NOT hardcoded here.
 *
 * Exports:
 * - MAIN_NAV_ITEMS: href + icon data for MainNavbar.
 *   Translation keys (in order): home · products · auctions · pre-orders · categories · sellers · events · blog · reviews
 *
 * @constant
 */

import { ReactNode } from "react";
import {
  Home,
  ShoppingBag,
  Gavel,
  CalendarCheck,
  LayoutGrid,
  Store,
  CalendarDays,
  BookOpen,
  Star,
} from "lucide-react";
import { SITE_CONFIG } from "./site";

/**
 * Navigation Item Shape
 * href + icon data only; labels are provided by consuming components via useTranslations.
 */
export interface NavItem {
  href: string;
  icon: ReactNode;
}

/**
 * Main Navigation Items (icon + href data)
 * Labels injected by MainNavbar via useTranslations("nav").
 * Translation key order: home, products, auctions, preOrders, categories, stores, events, blog, reviews
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    href: SITE_CONFIG.nav.home,
    icon: <Home className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  },
  {
    href: SITE_CONFIG.nav.products,
    icon: (
      <ShoppingBag className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
    ),
  },
  {
    href: SITE_CONFIG.nav.auctions,
    icon: <Gavel className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  },
  {
    href: SITE_CONFIG.nav.preOrders,
    icon: (
      <CalendarCheck className="w-5 h-5 text-purple-500 dark:text-purple-400" />
    ),
  },
  {
    href: SITE_CONFIG.nav.categories,
    icon: (
      <LayoutGrid className="w-5 h-5 text-violet-500 dark:text-violet-400" />
    ),
  },
  {
    href: SITE_CONFIG.nav.stores,
    icon: <Store className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
  },
  {
    href: SITE_CONFIG.nav.events,
    icon: <CalendarDays className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
  },
  {
    href: SITE_CONFIG.nav.blog,
    icon: <BookOpen className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
  },
  {
    href: SITE_CONFIG.nav.reviews,
    icon: <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />,
  },
];
