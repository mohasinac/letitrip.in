"use client";

import { useState } from "react";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";
import { SITE_CONFIG, ROUTES } from "@/constants";
import { currentYear } from "@/utils";
import { DEFAULT_TRUST_BAR_ITEMS } from "@/db/schema";
import type { SiteSettingsDocument } from "@/db/schema";
import { FooterLayout } from "./FooterLayout";
import type { FooterSocialLink, FooterLinkGroup } from "./FooterLayout";
import { THEME_CONSTANTS } from "@/constants";
import { Text } from "@/components";

interface FooterProps {
  footerConfig?: SiteSettingsDocument["footerConfig"];
}

export default function Footer({ footerConfig }: FooterProps) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const [email, setEmail] = useState("");

  const socialLinks: FooterSocialLink[] = [
    {
      platform: "facebook",
      href: SITE_CONFIG.social.facebook,
      icon: <Facebook className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      ariaLabel: "Facebook",
    },
    {
      platform: "instagram",
      href: SITE_CONFIG.social.instagram,
      icon: <Instagram className="w-5 h-5 text-pink-500 dark:text-pink-400" />,
      ariaLabel: "Instagram",
    },
    {
      platform: "twitter",
      href: SITE_CONFIG.social.twitter,
      icon: <Twitter className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
      ariaLabel: "Twitter",
    },
    {
      platform: "linkedin",
      href: SITE_CONFIG.social.linkedin,
      icon: <Linkedin className="w-5 h-5 text-blue-700 dark:text-blue-500" />,
      ariaLabel: "LinkedIn",
    },
  ];

  const linkGroups: FooterLinkGroup[] = [
    {
      heading: t("shop"),
      links: [
        { href: ROUTES.PUBLIC.PRODUCTS, label: tNav("products") },
        { href: ROUTES.PUBLIC.AUCTIONS, label: tNav("auctions") },
        { href: ROUTES.PUBLIC.CATEGORIES, label: tNav("categories") },
        { href: ROUTES.PUBLIC.PROMOTIONS, label: tNav("promotions") },
        { href: ROUTES.PUBLIC.SEARCH, label: tNav("search") },
      ],
    },
    {
      heading: t("support"),
      links: [
        { href: ROUTES.PUBLIC.HELP, label: t("helpCenter") },
        { href: ROUTES.PUBLIC.FAQS, label: t("faqs") },
        { href: ROUTES.PUBLIC.TRACK_ORDER, label: t("trackOrder") },
        { href: ROUTES.PUBLIC.CONTACT, label: t("contact") },
      ],
    },
    {
      heading: t("sellersSection"),
      links: [
        { href: ROUTES.PUBLIC.SELLERS, label: t("sellOnPlatform") },
        { href: ROUTES.PUBLIC.SELLER_GUIDE, label: t("sellerGuide") },
      ],
    },
    {
      heading: t("learnSection"),
      links: [
        { href: ROUTES.PUBLIC.HOW_AUCTIONS_WORK, label: t("howAuctionsWork") },
        {
          href: ROUTES.PUBLIC.HOW_PRE_ORDERS_WORK,
          label: t("howPreOrdersWork"),
        },
        { href: ROUTES.PUBLIC.SHIPPING_POLICY, label: t("shippingPolicy") },
      ],
    },
    {
      heading: t("legal"),
      links: [
        { href: ROUTES.PUBLIC.PRIVACY, label: t("privacyPolicy") },
        { href: ROUTES.PUBLIC.TERMS, label: t("termsOfService") },
        { href: ROUTES.PUBLIC.COOKIE_POLICY, label: t("cookiePolicy") },
        { href: ROUTES.PUBLIC.REFUND_POLICY, label: t("refundPolicy") },
      ],
    },
  ];

  const trustBarItems =
    footerConfig?.trustBar?.items ?? DEFAULT_TRUST_BAR_ITEMS;
  const showTrustBar = footerConfig?.trustBar?.enabled ?? true;
  const newsletterEnabled = footerConfig?.newsletterEnabled ?? true;

  return (
    <FooterLayout
      brandName={SITE_CONFIG.brand.name}
      brandDescription={SITE_CONFIG.seo.description}
      socialLinks={socialLinks}
      linkGroups={linkGroups}
      copyrightText={t("copyright", {
        year: currentYear(),
        brand: SITE_CONFIG.brand.name,
      })}
      madeInText={t("madeIn")}
      showTrustBar={showTrustBar}
      trustBarItems={trustBarItems}
      newsletterEnabled={newsletterEnabled}
      newsletterSlot={
        <div
          className={`${THEME_CONSTANTS.accentBanner.gradientSubtle} rounded-xl p-4 text-white relative overflow-hidden`}
        >
          <div
            className="absolute -top-8 -right-8 h-24 w-24 rounded-full border border-white/10 pointer-events-none"
            aria-hidden
          />
          <Text
            size="xs"
            weight="semibold"
            variant="none"
            className="uppercase tracking-wider mb-2 opacity-90"
          >
            {t("newsletterLabel")}
          </Text>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              className="flex-1 min-w-0 rounded-lg px-3 py-1.5 text-sm text-zinc-900 bg-white/95 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="button"
              onClick={() => setEmail("")}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white text-primary-700 text-sm font-semibold hover:bg-zinc-100 transition-colors"
            >
              {t("newsletterCta")}
            </button>
          </div>
        </div>
      }
    />
  );
}
