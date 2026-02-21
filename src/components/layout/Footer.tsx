import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { THEME_CONSTANTS, SITE_CONFIG, UI_LABELS, ROUTES } from "@/constants";

export default function Footer() {
  const { colors, layout } = THEME_CONSTANTS;

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
            <p className={`font-bold text-lg mb-2 ${colors.footer.title}`}>
              {SITE_CONFIG.brand.name}
            </p>
            <p className={`text-sm mb-4 ${colors.footer.text}`}>
              {SITE_CONFIG.seo.description}
            </p>
            <div className="flex gap-3 mt-2">
              <a
                href={SITE_CONFIG.social.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={SITE_CONFIG.social.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SITE_CONFIG.social.twitter}
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={SITE_CONFIG.social.linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.footer.text} ${colors.footer.textHover}`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className={`font-bold text-sm mb-3 ${colors.footer.title}`}>
              {UI_LABELS.FOOTER.SHOP}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: ROUTES.PUBLIC.PRODUCTS, label: UI_LABELS.NAV.PRODUCTS },
                { href: ROUTES.PUBLIC.AUCTIONS, label: UI_LABELS.NAV.AUCTIONS },
                {
                  href: ROUTES.PUBLIC.CATEGORIES,
                  label: UI_LABELS.NAV.CATEGORIES,
                },
                {
                  href: ROUTES.PUBLIC.PROMOTIONS,
                  label: UI_LABELS.NAV.PROMOTIONS,
                },
                { href: ROUTES.PUBLIC.SEARCH, label: UI_LABELS.NAV.SEARCH },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${colors.footer.text} ${colors.footer.textHover}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className={`font-bold text-sm mb-3 ${colors.footer.title}`}>
              {UI_LABELS.FOOTER.SUPPORT}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                {
                  href: ROUTES.PUBLIC.HELP,
                  label: UI_LABELS.FOOTER.HELP_CENTER,
                },
                { href: ROUTES.PUBLIC.FAQS, label: UI_LABELS.FOOTER.FAQS },
                {
                  href: ROUTES.PUBLIC.TRACK_ORDER,
                  label: UI_LABELS.FOOTER.TRACK_ORDER,
                },
                {
                  href: ROUTES.PUBLIC.CONTACT,
                  label: UI_LABELS.FOOTER.CONTACT,
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${colors.footer.text} ${colors.footer.textHover}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Sellers */}
          <div>
            <h3 className={`font-bold text-sm mb-3 ${colors.footer.title}`}>
              {UI_LABELS.FOOTER.SELLERS_SECTION}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                {
                  href: ROUTES.PUBLIC.SELLERS,
                  label: UI_LABELS.FOOTER.SELL_ON_PLATFORM,
                },
                {
                  href: ROUTES.PUBLIC.SELLER_GUIDE,
                  label: UI_LABELS.FOOTER.SELLER_GUIDE,
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${colors.footer.text} ${colors.footer.textHover}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h3 className={`font-bold text-sm mb-3 ${colors.footer.title}`}>
              {UI_LABELS.FOOTER.LEGAL}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                {
                  href: ROUTES.PUBLIC.PRIVACY,
                  label: UI_LABELS.FOOTER.PRIVACY_POLICY,
                },
                {
                  href: ROUTES.PUBLIC.TERMS,
                  label: UI_LABELS.FOOTER.TERMS_OF_SERVICE,
                },
                {
                  href: ROUTES.PUBLIC.COOKIE_POLICY,
                  label: UI_LABELS.FOOTER.COOKIE_POLICY,
                },
                {
                  href: ROUTES.PUBLIC.REFUND_POLICY,
                  label: UI_LABELS.FOOTER.REFUND_POLICY,
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${colors.footer.text} ${colors.footer.textHover}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className={`border-t ${colors.footer.border} mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm ${colors.footer.copyright}`}
        >
          <span>
            {UI_LABELS.FOOTER.COPYRIGHT.replace(
              "{year}",
              new Date().getFullYear().toString(),
            ).replace("{brand}", SITE_CONFIG.brand.name)}
          </span>
          <span>{UI_LABELS.FOOTER.MADE_IN}</span>
        </div>
      </div>
    </footer>
  );
}
