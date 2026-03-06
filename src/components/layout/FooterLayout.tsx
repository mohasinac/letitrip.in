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
  id?: string;
}

export function FooterLayout({
  brandName,
  brandDescription,
  socialLinks,
  linkGroups,
  copyrightText,
  madeInText,
  id = "footer",
}: FooterLayoutProps) {
  const { colors, layout } = THEME_CONSTANTS;

  return (
    <BlockFooter
      id={id}
      className={`mt-auto mb-16 md:mb-0 ${layout.footerBg} border-t ${THEME_CONSTANTS.themed.border}`}
    >
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-12 md:py-16`}
      >
        {/* 5-column grid: brand column + link groups */}
        <div
          className={`grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-${Math.min(linkGroups.length + 1, 5)}`}
        >
          {/* Column 1: Brand + tagline + social */}
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
            <div className="flex gap-3 mt-2">
              {socialLinks.map((social) => (
                <TextLink
                  key={social.platform}
                  href={social.href}
                  aria-label={social.ariaLabel}
                  className={`${colors.footer.text} ${colors.footer.textHover}`}
                >
                  {social.icon}
                </TextLink>
              ))}
            </div>
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
          className={`border-t ${colors.footer.border} mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm ${colors.footer.copyright}`}
        >
          <Caption>{copyrightText}</Caption>
          <Caption>{madeInText}</Caption>
        </div>
      </div>
    </BlockFooter>
  );
}
