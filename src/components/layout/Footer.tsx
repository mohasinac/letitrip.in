"use client";

import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";
import { SITE_CONFIG, ROUTES } from "@/constants";
import { currentYear } from "@/utils";
import { FooterLayout } from "./FooterLayout";
import type { FooterSocialLink, FooterLinkGroup } from "./FooterLayout";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const socialLinks: FooterSocialLink[] = [
    {
      platform: "facebook",
      href: SITE_CONFIG.social.facebook,
      icon: <Facebook className="w-5 h-5" />,
      ariaLabel: "Facebook",
    },
    {
      platform: "instagram",
      href: SITE_CONFIG.social.instagram,
      icon: <Instagram className="w-5 h-5" />,
      ariaLabel: "Instagram",
    },
    {
      platform: "twitter",
      href: SITE_CONFIG.social.twitter,
      icon: <Twitter className="w-5 h-5" />,
      ariaLabel: "Twitter",
    },
    {
      platform: "linkedin",
      href: SITE_CONFIG.social.linkedin,
      icon: <Linkedin className="w-5 h-5" />,
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
      heading: t("legal"),
      links: [
        { href: ROUTES.PUBLIC.PRIVACY, label: t("privacyPolicy") },
        { href: ROUTES.PUBLIC.TERMS, label: t("termsOfService") },
        { href: ROUTES.PUBLIC.COOKIE_POLICY, label: t("cookiePolicy") },
        { href: ROUTES.PUBLIC.REFUND_POLICY, label: t("refundPolicy") },
      ],
    },
  ];

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
    />
  );
}
