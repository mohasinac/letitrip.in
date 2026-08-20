import type { Metadata } from "next";
import { faqJsonLd, normalizeError, siteSettingsRepository } from "@mohasinac/appkit";
import type { FAQCategory, FAQCategoryItem } from "@mohasinac/appkit";
import { listPublicFaqs } from "@mohasinac/appkit/server";
import { getTranslations } from "next-intl/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { FAQPageClient } from "@/components";

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
];

export default async function Page() {
  const t = await getTranslations("faq");

  // SSR fetch kept only for JSON-LD — the actual rendered/paginated list is
  // now fetched client-side by FAQPageClient via useFaqList.
  const rawFaqs = await listPublicFaqs(undefined, 200).catch(() => []);
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
    void normalizeError(err);
    // Firestore unavailable — FAQPageClient still renders with empty contact info.
  }

  return (
    <>
      {ldFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }}
        />
      )}
      <FAQPageClient categories={categories} contact={contact} />
    </>
  );
}
