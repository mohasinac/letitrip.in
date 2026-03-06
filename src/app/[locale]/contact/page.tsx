"use client";

import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { ContactInfoSidebar, ContactForm } from "@/features/contact";
import { Heading, Text, Section } from "@/components";

const { themed, page } = THEME_CONSTANTS;

export default function ContactPage() {
  const t = useTranslations("contact");
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
