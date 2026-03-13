"use client";

/**
 * FooterLayout Component
 *
 * Generic site footer shell used by Footer.
 * Receives all domain data as props — zero domain imports.
 * Domain shell (Footer.tsx) reads SITE_CONFIG, ROUTES, and useTranslations
 * and passes the resulting values in.
 *
 * @component
 * @example
 * ```tsx
 * <FooterLayout
 *   brandName="LetItRip"
 *   brandDescription="Discover unique products..."
 *   socialLinks={[{ platform: 'facebook', href: '...', icon: <Facebook />, ariaLabel: 'Facebook' }]}
 *   linkGroups={[{ heading: 'Shop', links: [{ label: 'Products', href: '/products' }] }]}
 *   copyrightText="© 2026 LetItRip. All rights reserved."
 *   madeInText="Made in India 🇮🇳"
 * />
 * ```
 */

import React from "react";
import { THEME_CONSTANTS } from "@/constants";
import { DEFAULT_TRUST_BAR_ITEMS } from "@/db/schema";
import type { TrustBarItem } from "@/db/schema";
import { BlockFooter, Caption, Li, Text, TextLink, Ul } from "@/components";

export interface FooterLinkGroup {
  heading: string;
  links: { label: string; href: string }[];
}

export interface FooterSocialLink {
  platform: string;
  href: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

export interface FooterLayoutProps {
  brandName: string;
  brandDescription: string;
  socialLinks: FooterSocialLink[];
  linkGroups: FooterLinkGroup[];
  copyrightText: string;
  madeInText: string;
  /** Optional newsletter subscription slot. Hidden when newsletterEnabled=false. */
  newsletterSlot?: React.ReactNode;
  /** Whether to render the newsletter slot. Defaults to true. */
  newsletterEnabled?: boolean;
  /** When true, renders the trust bar above the main footer content. */
  showTrustBar?: boolean;
  /** Per-item trust bar data — overrides built-in defaults. */
  trustBarItems?: TrustBarItem[];
  id?: string;
}

export function FooterLayout({
  brandName,
  brandDescription,
  socialLinks,
  linkGroups,
  copyrightText,
  madeInText,
  newsletterSlot,
  newsletterEnabled = true,
  showTrustBar = false,
  trustBarItems = DEFAULT_TRUST_BAR_ITEMS,
  id = "footer",
}: FooterLayoutProps) {
  const { colors, layout } = THEME_CONSTANTS;

  const visibleTrustItems = trustBarItems.filter((item) => item.visible);

  return (
    <BlockFooter
      id={id}
      className={`mt-auto mb-16 md:mb-0 bg-zinc-50 dark:bg-[#0b0f1e] border-t border-zinc-200 dark:border-white/5`}
    >
      {/* Trust bar */}
      {showTrustBar && visibleTrustItems.length > 0 && (
        <div className="border-b border-zinc-200 dark:border-white/5">
          <div
            className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-4`}
          >
            <div className="flex flex-wrap gap-4 justify-center items-center divide-x divide-zinc-200 dark:divide-white/5">
              {visibleTrustItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 px-4 first:pl-0 last:pr-0"
                >
                  <span className="text-base" aria-hidden>
                    {item.icon}
                  </span>
                  <Text
                    size="xs"
                    variant="none"
                    className="text-zinc-600 dark:text-zinc-400 font-medium"
                  >
                    {item.label}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-12 md:py-16`}
      >
        {/* Row 1: Brand + tagline + social (left) | Newsletter (right, capped) */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-10">
          <div className="shrink-0">
            <Text
              weight="bold"
              variant="none"
              className={`text-lg mb-1 ${colors.footer.title}`}
            >
              {brandName}
            </Text>
            <Text
              size="sm"
              variant="none"
              className={`mb-3 max-w-xs ${colors.footer.text}`}
            >
              {brandDescription}
            </Text>
            <div className="flex gap-1.5">
              {socialLinks.map((social) => (
                <TextLink
                  key={social.platform}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  variant="bare"
                  className={`h-8 w-8 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 hover:border-primary/50 hover:bg-primary/10 ${THEME_CONSTANTS.flex.center} transition-all`}
                >
                  {social.icon}
                </TextLink>
              ))}
            </div>
          </div>
          {newsletterEnabled && newsletterSlot && (
            <div className="w-full sm:w-80 shrink-0">{newsletterSlot}</div>
          )}
        </div>

        {/* Row 2: Link groups — all in one row */}
        <div className="border-t border-zinc-200 dark:border-white/5 pt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-x-6 gap-y-8">
          {linkGroups.map((group) => (
            <div key={group.heading}>
              <Text
                size="xs"
                weight="semibold"
                variant="none"
                className={`uppercase tracking-widest ${colors.footer.heading} mb-4`}
              >
                {group.heading}
              </Text>
              <Ul className="space-y-2.5 text-sm">
                {group.links.map((link) => (
                  <Li key={link.href}>
                    <TextLink
                      href={link.href}
                      variant="bare"
                      className={`${colors.footer.text} ${colors.footer.textHover}`}
                    >
                      {link.label}
                    </TextLink>
                  </Li>
                ))}
              </Ul>
            </div>
          ))}
        </div>

        {/* Bottom row: copyright + made-in */}
        <div
          className={`border-t border-zinc-200 dark:border-white/5 mt-10 pt-6 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm ${colors.footer.copyright}`}
        >
          <Caption>{copyrightText}</Caption>
          <Caption>Built with ❤️ in India · {madeInText}</Caption>
        </div>
      </div>
    </BlockFooter>
  );
}
