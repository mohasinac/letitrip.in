/**
 * Navigation Constants
 *
 * Icon/href data for site navigation. Labels are provided by each consuming
 * component via useTranslations("nav") — NOT hardcoded here.
 *
 * Exports:
 * - MAIN_NAV_ITEMS: href + icon data for MainNavbar.
 *   Translation keys (in order): home · products · auctions · pre-orders · categories · stores · events · blog · reviews
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
import { ROUTES } from "./routes";

/**
 * Navigation Item Shape
 * href + icon data only; labels are provided by consuming components via useTranslations.
 */
export interface NavItem {
  /** Stable identifier matching the nav translation key (e.g. "products", "blog"). */
  key: string;
  href: string;
  icon: ReactNode;
  /** When true, renders the item as an accented pill in the desktop navbar. */
  highlighted?: boolean;
}

/**
 * Main Navigation Items (icon + href data)
 * Labels injected by MainNavbar via useTranslations("nav").
 * Translation key order: home, products, auctions, preOrders, categories, stores, events, blog, reviews
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    href: String(ROUTES.HOME),
    icon: <Home className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  },
  {
    key: "products",
    href: String(ROUTES.PUBLIC.PRODUCTS),
    icon: (
      <ShoppingBag className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
    ),
  },
  {
    key: "auctions",
    href: String(ROUTES.PUBLIC.AUCTIONS),
    icon: <Gavel className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  },
  {
    key: "preOrders",
    href: String(ROUTES.PUBLIC.PRE_ORDERS),
    icon: (
      <CalendarCheck className="w-5 h-5 text-purple-500 dark:text-purple-400" />
    ),
  },
  {
    key: "categories",
    href: String(ROUTES.PUBLIC.CATEGORIES),
    icon: (
      <LayoutGrid className="w-5 h-5 text-violet-500 dark:text-violet-400" />
    ),
  },
  {
    key: "stores",
    href: String(ROUTES.PUBLIC.STORES),
    icon: <Store className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
  },
  {
    key: "events",
    href: String(ROUTES.PUBLIC.EVENTS),
    icon: <CalendarDays className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
  },
  {
    key: "blog",
    href: String(ROUTES.PUBLIC.BLOG),
    icon: <BookOpen className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
  },
  {
    key: "reviews",
    href: String(ROUTES.PUBLIC.REVIEWS),
    icon: <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />,
  },
];

