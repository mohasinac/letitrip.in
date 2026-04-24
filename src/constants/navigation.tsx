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
import { THEME_CONSTANTS } from "./theme";
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
const { navIcons } = THEME_CONSTANTS.colors;
const iconSm = THEME_CONSTANTS.icon.size.sm;

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    href: String(ROUTES.HOME),
    icon: <Home className={`${iconSm} ${navIcons.home}`} />,
  },
  {
    key: "products",
    href: String(ROUTES.PUBLIC.PRODUCTS),
    icon: <ShoppingBag className={`${iconSm} ${navIcons.products}`} />,
  },
  {
    key: "auctions",
    href: String(ROUTES.PUBLIC.AUCTIONS),
    icon: <Gavel className={`${iconSm} ${navIcons.auctions}`} />,
  },
  {
    key: "preOrders",
    href: String(ROUTES.PUBLIC.PRE_ORDERS),
    icon: <CalendarCheck className={`${iconSm} ${navIcons.preOrders}`} />,
  },
  {
    key: "categories",
    href: String(ROUTES.PUBLIC.CATEGORIES),
    icon: <LayoutGrid className={`${iconSm} ${navIcons.categories}`} />,
  },
  {
    key: "stores",
    href: String(ROUTES.PUBLIC.STORES),
    icon: <Store className={`${iconSm} ${navIcons.stores}`} />,
  },
  {
    key: "events",
    href: String(ROUTES.PUBLIC.EVENTS),
    icon: <CalendarDays className={`${iconSm} ${navIcons.events}`} />,
  },
  {
    key: "blog",
    href: String(ROUTES.PUBLIC.BLOG),
    icon: <BookOpen className={`${iconSm} ${navIcons.blog}`} />,
  },
  {
    key: "reviews",
    href: String(ROUTES.PUBLIC.REVIEWS),
    icon: <Star className={`${iconSm} ${navIcons.reviews}`} />,
  },
];

