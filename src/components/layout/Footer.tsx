"use client";

import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, SITE_CONFIG, ROUTES } from "@/constants";
import { currentYear } from "@/utils";
import { Heading, Text, Span, Caption, TextLink, Ul, Li } from "@/components";

export default function Footer() {
  const { colors, layout } = THEME_CONSTANTS;
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer
      id="footer"
      className={`mt-auto mb-16 md:mb-0 ${layout.footerBg} border-t ${THEME_CONSTANTS.themed.border}`}
    >
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-12 md:py-16`}
      >
        {/* 5-column grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Column 1: Brand + tagline + social */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Text
              weight="bold"
              className={`text-lg mb-2 ${colors.footer.title}`}
            >
              {SITE_CONFIG.brand.name}
            </Text>
            <Text size="sm" className={`mb-4 ${colors.footer.text}`}>
              {SITE_CONFIG.seo.description}
            </Text>
            <div className="flex gap-3 mt-2">
              <TextLink
                href={SITE_CONFIG.social.facebook}
                aria-label="Facebook"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Facebook className="w-5 h-5" />
              </TextLink>
              <TextLink
                href={SITE_CONFIG.social.instagram}
                aria-label="Instagram"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Instagram className="w-5 h-5" />
              </TextLink>
              <TextLink
                href={SITE_CONFIG.social.twitter}
                aria-label="Twitter"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Twitter className="w-5 h-5" />
              </TextLink>
              <TextLink
                href={SITE_CONFIG.social.linkedin}
                aria-label="LinkedIn"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Linkedin className="w-5 h-5" />
              </TextLink>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <Heading
              level={3}
              className={`font-bold text-sm mb-3 ${colors.footer.title}`}
            >
              {t("shop")}
            </Heading>
            <Ul className="space-y-2 text-sm">
              {[
                { href: ROUTES.PUBLIC.PRODUCTS, label: tNav("products") },
                { href: ROUTES.PUBLIC.AUCTIONS, label: tNav("auctions") },
                { href: ROUTES.PUBLIC.CATEGORIES, label: tNav("categories") },
                { href: ROUTES.PUBLIC.PROMOTIONS, label: tNav("promotions") },
                { href: ROUTES.PUBLIC.SEARCH, label: tNav("search") },
              ].map((link) => (
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

          {/* Column 3: Support */}
          <div>
            <Heading
              level={3}
              className={`font-bold text-sm mb-3 ${colors.footer.title}`}
            >
              {t("support")}
            </Heading>
            <Ul className="space-y-2 text-sm">
              {[
                { href: ROUTES.PUBLIC.HELP, label: t("helpCenter") },
                { href: ROUTES.PUBLIC.FAQS, label: t("faqs") },
                { href: ROUTES.PUBLIC.TRACK_ORDER, label: t("trackOrder") },
                { href: ROUTES.PUBLIC.CONTACT, label: t("contact") },
              ].map((link) => (
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

          {/* Column 4: Sellers */}
          <div>
            <Heading
              level={3}
              className={`font-bold text-sm mb-3 ${colors.footer.title}`}
            >
              {t("sellersSection")}
            </Heading>
            <Ul className="space-y-2 text-sm">
              {[
                { href: ROUTES.PUBLIC.SELLERS, label: t("sellOnPlatform") },
                { href: ROUTES.PUBLIC.SELLER_GUIDE, label: t("sellerGuide") },
              ].map((link) => (
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

          {/* Column 5: Legal */}
          <div>
            <Heading
              level={3}
              className={`font-bold text-sm mb-3 ${colors.footer.title}`}
            >
              {t("legal")}
            </Heading>
            <Ul className="space-y-2 text-sm">
              {[
                { href: ROUTES.PUBLIC.PRIVACY, label: t("privacyPolicy") },
                { href: ROUTES.PUBLIC.TERMS, label: t("termsOfService") },
                { href: ROUTES.PUBLIC.COOKIE_POLICY, label: t("cookiePolicy") },
                { href: ROUTES.PUBLIC.REFUND_POLICY, label: t("refundPolicy") },
              ].map((link) => (
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
        </div>

        {/* Bottom row */}
        <div
          className={`border-t ${colors.footer.border} mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm ${colors.footer.copyright}`}
        >
          <Caption>
            {t("copyright", {
              year: currentYear(),
              brand: SITE_CONFIG.brand.name,
            })}
          </Caption>
          <Caption>{t("madeIn")}</Caption>
        </div>
      </div>
    </footer>
  );
}
