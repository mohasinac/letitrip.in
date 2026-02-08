"use client";

import { THEME_CONSTANTS } from "@/constants";
import { SITE_CONFIG } from "@/constants/site";

interface FooterSection {
  title: string;
  links: Array<{ label: string; href: string }>;
}

const footerSections: FooterSection[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press Kit", href: "/press" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Track Order", href: "/track" },
    ],
  },
  {
    title: "For Sellers",
    links: [
      { label: "Sell on Platform", href: "/sell" },
      { label: "Seller Dashboard", href: "/seller/dashboard" },
      { label: "Seller Guide", href: "/seller-guide" },
      { label: "Fees & Pricing", href: "/seller-fees" },
      { label: "Seller Success", href: "/seller-success" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Prohibited Items", href: "/prohibited" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: "📘", href: "https://facebook.com/letitrip" },
  { name: "Instagram", icon: "📷", href: "https://instagram.com/letitrip" },
  { name: "Twitter", icon: "🐦", href: "https://twitter.com/letitrip" },
  {
    name: "LinkedIn",
    icon: "💼",
    href: "https://linkedin.com/company/letitrip",
  },
  { name: "YouTube", icon: "📺", href: "https://youtube.com/@letitrip" },
];

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.border} border-t`}
    >
      {/* Main Footer Content */}
      <div className="w-full py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3
              className={`${THEME_CONSTANTS.typography.h3} ${THEME_CONSTANTS.themed.textPrimary} mb-4`}
            >
              {SITE_CONFIG.brand.name}
            </h3>
            <p
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} mb-6`}
            >
              Your trusted marketplace for buying and selling unique products
              through direct sales and exciting auctions.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl hover:scale-110 transition-transform`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-4`}
              >
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className={`${THEME_CONSTANTS.themed.border} border-t pt-8 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-2`}
              >
                📧 Email
              </h5>
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400`}
              >
                {SITE_CONFIG.contact.email}
              </a>
            </div>
            <div>
              <h5
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-2`}
              >
                📞 Phone
              </h5>
              <a
                href={`tel:${SITE_CONFIG.contact.phone}`}
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400`}
              >
                {SITE_CONFIG.contact.phone}
              </a>
            </div>
            <div>
              <h5
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-2`}
              >
                📍 Address
              </h5>
              <p
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                {SITE_CONFIG.contact.address}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className={`${THEME_CONSTANTS.themed.border} border-t pt-8 mb-8`}>
          <h5
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold mb-4 text-center`}
          >
            Accepted Payment Methods
          </h5>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              "💳 Visa",
              "💳 Mastercard",
              "💳 Amex",
              "📱 UPI",
              "💰 Net Banking",
              "📲 Wallets",
            ].map((method) => (
              <span
                key={method}
                className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} px-3 py-1 ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.md}`}
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`${THEME_CONSTANTS.themed.border} border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4`}
        >
          <p
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} text-center md:text-left`}
          >
            © {currentYear} {SITE_CONFIG.brand.name}. All rights reserved.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <a
              href="/terms"
              className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400`}
            >
              Terms
            </a>
            <span className={THEME_CONSTANTS.themed.textSecondary}>•</span>
            <a
              href="/privacy-policy"
              className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400`}
            >
              Privacy
            </a>
            <span className={THEME_CONSTANTS.themed.textSecondary}>•</span>
            <a
              href="/cookies"
              className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400`}
            >
              Cookies
            </a>
            <span className={THEME_CONSTANTS.themed.textSecondary}>•</span>
            <a
              href="/sitemap.xml"
              className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400`}
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
