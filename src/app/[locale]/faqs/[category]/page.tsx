import type { Metadata } from "next";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import type { FAQCategoryItem } from "@mohasinac/appkit/features/faq/components/FAQCategorySidebar";
import type { FAQCategory } from "@mohasinac/appkit/features/faq/types/index";
import { getTranslations } from "next-intl/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { FAQPageClient } from "@/components/faq/FAQPageClient";

export const revalidate = 3600;

type Props = { params: Promise<{ category: string }> };

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
  // Same rule honoured — see the twin array in `faqs/page.tsx`.
  "selling",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return _gm({
    title: `${label} FAQs — LetItRip Help`,
    description: `Common questions about ${label.toLowerCase()} on LetItRip collectibles marketplace.`,
    path: `/faqs/${category}`,
  });
}

export default async function Page({ params }: Props) {
  const { category } = await params;
  const t = await getTranslations("faq");

  const categories: FAQCategoryItem[] = CATEGORY_KEYS.map((key) => ({
    key,
    label: t(`category.${key}`),
    description: t(`categoryDescription.${key}`),
  }));

  const initialCategory: FAQCategory | "all" = CATEGORY_KEYS.includes(category as FAQCategory)
    ? (category as FAQCategory)
    : "all";

  let contact = { email: "", phone: "" };
  try {
    const settings = await siteSettingsRepository.getSingleton();
    contact = { email: settings.contact?.email ?? "", phone: settings.contact?.phone ?? "" };
  } catch (err) {
    // Firestore unavailable — FAQPageClient still renders with empty contact
    // info, which is indistinguishable from an admin having never set any.
    const normalized = normalizeError(err);
    serverLogger.warn("siteSettings.getSingleton failed — /faqs contact block empty", {
      category,
      error: normalized.message,
    });
  }

  return <FAQPageClient initialCategory={initialCategory} categories={categories} contact={contact} />;
}
