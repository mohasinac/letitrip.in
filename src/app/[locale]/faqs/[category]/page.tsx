import type { Metadata } from "next";
import { normalizeError, serverLogger, siteSettingsRepository } from "@mohasinac/appkit";
import type { FAQCategory, FAQCategoryItem } from "@mohasinac/appkit";
import { getTranslations } from "next-intl/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { FAQPageClient } from "@/components";

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
