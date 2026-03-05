"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, MAIN_NAV_ITEMS } from "@/constants";
import NavItem from "./NavItem";
import { Nav, Ul, Li } from "../semantic/Semantic";

/**
 * MainNavbar Component
 *
 * The primary horizontal navigation bar displaying main site links.
 * Visible on desktop/tablet (hidden on mobile, replaced by BottomNavbar).
 * Highlights the currently active page based on pathname.
 *
 * @component
 * @example
 * ```tsx
 * <MainNavbar />
 * ```
 */

export default function MainNavbar() {
  const { layout, zIndex, flex } = THEME_CONSTANTS;
  const pathname = usePathname();
  const t = useTranslations("nav");
  const navTranslationKeys = [
    "home",
    "products",
    "auctions",
    "categories",
    "stores",
    "events",
    "blog",
    "promotions",
    "reviews",
  ] as const;

  return (
    <Nav
      id="main-navbar"
      aria-label="Main navigation"
      className={`hidden md:block ${layout.navbarBg}`}
    >
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth}`}
      >
        <Ul className={`${flex.start} gap-0.5 lg:gap-1 ${layout.navbarHeight}`}>
          {MAIN_NAV_ITEMS.map((item, i) => (
            <Li key={item.href}>
              <NavItem
                href={item.href}
                label={t(navTranslationKeys[i])}
                icon={item.icon}
                isActive={pathname === item.href}
                variant="horizontal"
              />
            </Li>
          ))}
        </Ul>
      </div>
    </Nav>
  );
}
