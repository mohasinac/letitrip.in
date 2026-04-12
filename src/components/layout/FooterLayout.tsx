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

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  BlockFooter,
  Caption,
  Grid,
  Li,
  Row,
  Text,
  Ul,
  Span,
  Button,
} from "@mohasinac/appkit/ui";
import { THEME_CONSTANTS } from "@/constants";
import { DEFAULT_TRUST_BAR_ITEMS } from "@/db/schema";
import type { TrustBarItem } from "@/db/schema";
import { TextLink } from "@/components";

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
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});
  const toggleGroup = (idx: number) =>
    setOpenGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));

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
            <Row
              wrap
              gap="md"
              justify="center"
              className="divide-x divide-zinc-200 dark:divide-white/5"
            >
              {visibleTrustItems.map((item) => (
                <Row
                  key={item.label}
                  gap="xs"
                  className="px-4 first:pl-0 last:pr-0"
                >
                  <Span className="text-base" aria-hidden>
                    {item.icon}
                  </Span>
                  <Text
                    size="xs"
                    variant="none"
                    className="text-zinc-600 dark:text-zinc-400 font-medium"
                  >
                    {item.label}
                  </Text>
                </Row>
              ))}
            </Row>
          </div>
        </div>
      )}
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-12 md:py-16`}
      >
        {/* Main grid: brand column + 5 link-group columns (Row 1 on desktop) */}
        <Grid
          gap="none"
          className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 xl:grid-cols-7 2xl:grid-cols-7 gap-x-6 gap-y-0"
        >
          {/* Brand + Social + Newsletter column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 pb-8 border-b border-zinc-200 dark:border-white/5 lg:border-none lg:pb-0 lg:pr-8 mb-2 lg:mb-0">
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
            {newsletterEnabled && newsletterSlot && (
              <div className="mt-5">{newsletterSlot}</div>
            )}
          </div>

          {/* Link groups */}
          {linkGroups.map((group, idx) => (
            <div
              key={group.heading}
              className="border-b border-zinc-200 dark:border-white/5 sm:border-none py-1 sm:py-0 sm:mb-8"
            >
              <Button
                variant="ghost"
                onClick={() => toggleGroup(idx)}
                className="flex w-full items-center justify-between py-3 sm:py-0 sm:mb-4 sm:cursor-default sm:pointer-events-none"
                aria-expanded={openGroups[idx] ?? false}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  variant="none"
                  className={`uppercase tracking-widest ${colors.footer.heading}`}
                >
                  {group.heading}
                </Text>
                <ChevronDown
                  className={`w-4 h-4 sm:hidden shrink-0 transition-transform duration-200 ${openGroups[idx] ? "rotate-180" : ""} text-zinc-400 dark:text-zinc-500`}
                  aria-hidden
                />
              </Button>
              <div
                className={`${openGroups[idx] ? "pb-3" : "hidden"} sm:block`}
              >
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
            </div>
          ))}
        </Grid>

        {/* Row 2: copyright bar */}
        <div
          className={`border-t border-zinc-200 dark:border-white/5 mt-8 pt-6 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm ${colors.footer.copyright}`}
        >
          <Caption>{copyrightText}</Caption>
          <Caption>Built with ❤️ in India · {madeInText}</Caption>
        </div>
      </div>
    </BlockFooter>
  );
}
