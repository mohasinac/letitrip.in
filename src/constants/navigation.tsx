/**
 * Navigation Constants
 *
 * Icon/href data for site navigation. Labels are provided by each consuming
 * component via useTranslations("nav") — NOT hardcoded here.
 *
 * Exports:
 * - MAIN_NAV_ITEMS: href + icon data for MainNavbar.
 *   Translation keys (in order): home · products · auctions · sellers · promotions
 *
 * @constant
 */

import { ReactNode } from "react";
import { Home, ShoppingBag, Gavel, Store, Tag } from "lucide-react";
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
 * Translation key order: home, products, auctions, stores, promotions
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: SITE_CONFIG.nav.home, icon: <Home className="w-5 h-5" /> },
  { href: SITE_CONFIG.nav.products, icon: <ShoppingBag className="w-5 h-5" /> },
  { href: SITE_CONFIG.nav.auctions, icon: <Gavel className="w-5 h-5" /> },
  { href: SITE_CONFIG.nav.stores, icon: <Store className="w-5 h-5" /> },
  { href: SITE_CONFIG.nav.promotions, icon: <Tag className="w-5 h-5" /> },
];
