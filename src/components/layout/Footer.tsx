"use client";

import { THEME_CONSTANTS, SITE_CONFIG, UI_LABELS, ROUTES } from "@/constants";
import { ReactNode } from "react";

/**
 * Footer Component
 *
 * The main site footer with brand information, quick links, support links,
 * social media icons, and copyright notice.
 * Uses a gradient background and is responsive with multi-column layout.
 *
 * @component
 * @example
 * ```tsx
 * <Footer />
 * ```
 */

type FooterSection = {
  title: string;
  content:
    | { type: "text"; text: string }
    | { type: "links"; links: Array<{ href: string; label: string }> }
    | {
        type: "social";
        socials: Array<{ name: string; href: string; icon: ReactNode }>;
      };
};

const footerSections: FooterSection[] = [
  {
    title: SITE_CONFIG.brand.name,
    content: {
      type: "text" as const,
      text: SITE_CONFIG.seo.description,
    },
  },
  {
    title: UI_LABELS.FOOTER.QUICK_LINKS,
    content: {
      type: "links" as const,
      links: [
        { href: SITE_CONFIG.nav.about, label: UI_LABELS.FOOTER.ABOUT_US },
        { href: SITE_CONFIG.nav.contact, label: UI_LABELS.FOOTER.CONTACT },
        { href: SITE_CONFIG.nav.blog, label: UI_LABELS.FOOTER.BLOG },
      ],
    },
  },
  {
    title: UI_LABELS.FOOTER.SUPPORT,
    content: {
      type: "links" as const,
      links: [
        { href: ROUTES.PUBLIC.TERMS, label: UI_LABELS.FOOTER.TERMS_OF_SERVICE },
        { href: ROUTES.PUBLIC.PRIVACY, label: UI_LABELS.FOOTER.PRIVACY_POLICY },
      ],
    },
  },
  {
    title: UI_LABELS.FOOTER.CONNECT,
    content: {
      type: "social" as const,
      socials: [
        {
          name: "Facebook",
          href: SITE_CONFIG.social.facebook,
          icon: (
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          ),
        },
        {
          name: "Twitter",
          href: SITE_CONFIG.social.twitter,
          icon: (
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          ),
        },
      ],
    },
  },
];

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className={`font-bold text-lg mb-4 ${colors.footer.title}`}>
                {section.title}
              </h3>

              {section.content.type === "text" && (
                <p className={`${colors.footer.text} text-sm`}>
                  {section.content.text}
                </p>
              )}

              {section.content.type === "links" && (
                <ul className="space-y-2 text-sm">
                  {section.content.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className={`${colors.footer.text} ${colors.footer.textHover}`}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {section.content.type === "social" && (
                <div className="flex gap-3">
                  {section.content.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`${colors.footer.text} ${colors.footer.textHover}`}
                      aria-label={social.name}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {social.icon}
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className={`border-t ${colors.footer.border} mt-8 pt-6 text-center text-sm ${colors.footer.copyright}`}
        >
          {UI_LABELS.FOOTER.COPYRIGHT.replace(
            "{year}",
            new Date().getFullYear().toString(),
          ).replace("{brand}", SITE_CONFIG.brand.name)}
        </div>
      </div>
    </footer>
  );
}
