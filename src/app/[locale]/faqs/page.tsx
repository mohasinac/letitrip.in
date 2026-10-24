import type { Metadata } from "next";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { faqJsonLd } from "@mohasinac/appkit/seo/json-ld";
import type { FAQCategoryItem } from "@mohasinac/appkit/features/faq/components/FAQCategorySidebar";
import type { FAQCategory } from "@mohasinac/appkit/features/faq/types/index";
import { listPublicFaqs, safeRead } from "@mohasinac/appkit/server";
import { getTranslations } from "next-intl/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { FAQPageClient } from "@/components/faq/FAQPageClient";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const metadata: Metadata = _gm({
  title: "FAQ — LetItRip Help Centre",
  description:
    "Answers to common questions about shipping, returns, payments, auctions and pre-orders on LetItRip.",
  path: "/faqs",
  keywords: ["letitrip faq", "collectibles marketplace help", "auction help india"],
});

export const revalidate = 3600;

// Mirrors the static category list GET /api/faqs already returns, plus
// scam_awareness (a real FAQCategory value the route's list was missing).
const CATEGORY_KEYS: FAQCategory[] = [
  "general",
  "orders_payment",
  "shipping_delivery",
  "returns_refunds",
  "product_information",
  "account_security",
  "technical_support",
  "scam_awareness",
  // A real FAQCategory with a label in FAQ_CATEGORY_LABELS and SIX seeded
  // answers — including the two best GST explanations on the site — that
  // were unreachable because this array omitted it. Adding it here ALONE
  // throws a missing-translation error: faq.category.* and
  // faq.categoryDescription.* in messages/en.json omitted it too.
  // All four edits or none.
  "fees_and_taxes",
  // Same four-edit rule, honoured: the union, FAQ_CATEGORY_LABELS,
  // FAQ_CATEGORY_HELP_GUIDE, this array (and its twin in [category]/page.tsx),
  // plus faq.category.selling / faq.categoryDescription.selling.
  "selling",
];

export default async function Page() {
  const t = await getTranslations("faq");

  // SSR fetch kept only for JSON-LD — the actual rendered/paginated list is
  // now fetched client-side by FAQPageClient via useFaqList.
  const rawFaqs = await safeRead(() => listPublicFaqs(undefined, 200), {
    route: "/faqs",
    key: "faqs.listPublicFaqs",
    fallback: [],
  });
  const ldFaqs = rawFaqs.map((faq) => ({
    question: faq.question,
    answer: typeof faq.answer === "string" ? faq.answer : faq.answer.text,
  }));
  const ldFaq = ldFaqs.length > 0 ? faqJsonLd(ldFaqs) : null;

  const categories: FAQCategoryItem[] = CATEGORY_KEYS.map((key) => ({
    key,
    label: t(`category.${key}`),
    description: t(`categoryDescription.${key}`),
  }));

  let contact = { email: "", phone: "" };
  try {
    const settings = await siteSettingsRepository.getSingleton();
    contact = { email: settings.contact?.email ?? "", phone: settings.contact?.phone ?? "" };
  } catch (err) {
    // Firestore unavailable — FAQPageClient still renders with empty contact
    // info, which is indistinguishable from an admin having never set any.
    const normalized = normalizeError(err);
    serverLogger.warn("siteSettings.getSingleton failed — /faqs contact block empty", {
      error: normalized.message,
    });
  }

  return (
    <>
      <PageViewTracker entityType="listing" entityId="faqs" url="/faqs" />
      <>
        {ldFaq && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }}
          />
        )}
        <FAQPageClient categories={categories} contact={contact} />
      </>
    </>
  );
}
