import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import { ContactInfoSidebar, ContactForm } from "@/features/contact";
import { Heading, Text, Section } from "@/components";

export const revalidate = 3600;

const { page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <Section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-14 md:py-16 lg:py-20">
        <div className={`${page.container.md} text-center`}>
          <Heading level={1} className="mb-4">
            {t("title")}
          </Heading>
          <Text className="text-blue-100 text-lg">{t("subtitle")}</Text>
        </div>
      </Section>

      <div className={`${page.container.lg} py-14 md:py-16`}>
        <div className="grid md:grid-cols-5 gap-12">
          <ContactInfoSidebar />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
