import React from "react";
import { THEME_CONSTANTS } from "@/constants";
import { Nav, Ul, Li } from "../semantic/Semantic";
import NavItem from "./NavItem";

export interface NavbarLayoutItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** When true, renders this nav link as an accented pill (e.g. "Today's Deals"). */
  highlighted?: boolean;
}

export interface NavbarLayoutProps {
  items: NavbarLayoutItem[];
  activeHref: string;
  id?: string;
  ariaLabel?: string;
  /**
   * When true, renders as an inline flex row (no outer Nav wrapper or sticky bg).
   * Used when slotted inside TitleBarLayout for the slim double-nav pattern.
   */
  inline?: boolean;
}

/**
 * NavbarLayout — generic horizontal navigation bar shell.
 *
 * Zero domain imports. Receives all navigation items and the current
 * active href as props. Rendered hidden on mobile (visible md+).
 */
export function NavbarLayout({
  items,
  activeHref,
  id = "main-navbar",
  ariaLabel = "Main navigation",
  inline = false,
}: NavbarLayoutProps) {
  const { layout, flex } = THEME_CONSTANTS;

  if (inline) {
    return (
      <Ul
        aria-label={ariaLabel}
        className="hidden md:flex items-center gap-0.5 lg:gap-1"
      >
        {items.map((item) => (
          <Li key={item.href}>
            <NavItem
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={activeHref === item.href}
              variant="horizontal"
              highlighted={item.highlighted}
            />
          </Li>
        ))}
      </Ul>
    );
  }

  return (
    <Nav
      id={id}
      aria-label={ariaLabel}
      className={`hidden md:block ${layout.navbarBg}`}
    >
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth}`}
      >
        <Ul className={`${flex.start} gap-0.5 lg:gap-1 ${layout.navbarHeight}`}>
          {items.map((item) => (
            <Li key={item.href}>
              <NavItem
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={activeHref === item.href}
                variant="horizontal"
                highlighted={item.highlighted}
              />
            </Li>
          ))}
        </Ul>
      </div>
    </Nav>
  );
}
