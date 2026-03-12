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
import {
  BlockFooter,
  Caption,
  Heading,
  Li,
  Text,
  TextLink,
  Ul,
} from "@/components";

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
  /** Optional newsletter subscription slot rendered in the brand column. */
  newsletterSlot?: React.ReactNode;
  /** When true, renders the 5-chip trust bar above the main footer content. */
  showTrustBar?: boolean;
  /** Labels for the 5 trust chips (order: shipping, returns, payment, support, authentic). */
  trustLabels?: [string, string, string, string, string];
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
  showTrustBar = false,
  trustLabels = [
    "Free Shipping",
    "Easy Returns",
    "Secure Payment",
    "24/7 Support",
    "Authentic Sellers",
  ],
  id = "footer",
}: FooterLayoutProps) {
  const { colors, layout } = THEME_CONSTANTS;

  const TRUST_ICONS = ["🚚", "🔄", "🔒", "🎧", "✅"] as const;

  return (
    <BlockFooter
      id={id}
      className={`mt-auto mb-16 md:mb-0 bg-gradient-to-b from-slate-950 to-cobalt-950/50 border-t border-white/5`}
    >
      {/* Trust bar */}
      {showTrustBar && (
        <div className="border-b border-white/5">
          <div
            className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-6`}
          >
            <div className="flex flex-wrap gap-6 justify-center">
              {trustLabels.map((label, i) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm text-zinc-400"
                >
                  <span aria-hidden>{TRUST_ICONS[i]}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-12 md:py-16`}
      >
        {/* 5-column grid: brand column + link groups */}
        <div
          className={`grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-${Math.min(linkGroups.length + 1, 5)}`}
        >
          {/* Column 1: Brand + tagline + social + newsletter */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Text
              weight="bold"
              className={`text-lg mb-2 ${colors.footer.title}`}
            >
              {brandName}
            </Text>
            <Text size="sm" className={`mb-4 ${colors.footer.text}`}>
              {brandDescription}
            </Text>
            {/* Social icons */}
            <div className="flex gap-2 mt-2">
              {socialLinks.map((social) => (
                <TextLink
                  key={social.platform}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className="h-9 w-9 rounded-full border border-white/10 hover:border-primary/40 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all text-zinc-400"
                >
                  {social.icon}
                </TextLink>
              ))}
            </div>
            {/* Newsletter slot */}
            {newsletterSlot && <div className="mt-6">{newsletterSlot}</div>}
          </div>

          {/* Link group columns */}
          {linkGroups.map((group) => (
            <div key={group.heading}>
              <Heading
                level={3}
                className={`font-bold text-sm mb-3 ${colors.footer.title}`}
              >
                {group.heading}
              </Heading>
              <Ul className="space-y-2 text-sm">
                {group.links.map((link) => (
                  <Li key={link.href}>
                    <TextLink
                      href={link.href}
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
          className={`border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-zinc-400`}
        >
          <Caption>{copyrightText}</Caption>
          <Caption>Built with ❤️ in India · {madeInText}</Caption>
        </div>
      </div>
    </BlockFooter>
  );
}
