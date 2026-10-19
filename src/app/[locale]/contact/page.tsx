import type { Metadata } from "next";
import { ContactPageView } from "@mohasinac/appkit/features/contact/components/ContactPageView";
import { ROUTES } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import appkitConfig from "@/lib/appkit-config";
import {
  BUSINESS,
  businessAddressLines,
  businessWhatsAppLink,
} from "@/constants/business";

export const metadata: Metadata = _gm({
  title: "Contact Us — LetItRip",
  description: "Get in touch with the LetItRip team. We're here to help with orders, listings, disputes and general enquiries.",
  path: "/contact",
  keywords: ["letitrip contact", "collectibles marketplace support", "contact letitrip india"],
});

export const revalidate = 3600;

export default function Page() {
  /*
   * Everything below came from HARDCODED LITERALS inside ContactPageView until
   * 2026-10-19 — `support@letitrip.in`, `+91 89196 65811`, business hours, the
   * community invite. The component ignored both the `contact` i18n namespace
   * (which exists, is fully written, and was never consumed) and
   * `siteSettings.contact`, so the contact page could and did disagree with
   * every other place the same facts appear.
   *
   * Resolved here, in the consumer, because `appkit.config.js` is the one
   * owner and an appkit component must not reach into it.
   */
  return (
    <ContactPageView
      business={{
        legalName: BUSINESS.legalName,
        proprietor: BUSINESS.proprietor ?? null,
        structure: BUSINESS.structure ?? null,
        gstin: BUSINESS.gstin ?? null,
        addressLines: businessAddressLines(),
        supportEmail: BUSINESS.support?.email ?? null,
        supportPhone: BUSINESS.support?.phone ?? null,
        // Built here so the "strip to digits for wa.me" rule lives in exactly
        // one place rather than being re-derived by every renderer.
        whatsAppLink: businessWhatsAppLink(),
        whatsAppDisplay: BUSINESS.support?.whatsapp ?? null,
        supportHours: BUSINESS.support?.hours ?? null,
        // A community group invite is marketing, not a support channel — it
        // stays on `brand.socialUrls` rather than moving into `business`.
        communityUrl: appkitConfig.brand?.socialUrls?.whatsapp ?? null,
        grievanceHref: String(ROUTES.PUBLIC.GRIEVANCE),
      }}
    />
  );
}
