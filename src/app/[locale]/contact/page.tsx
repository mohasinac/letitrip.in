"use client";

import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { ContactInfoSidebar, ContactForm } from "@/components";

const { themed } = THEME_CONSTANTS;

export default function ContactPage() {
  const t = useTranslations("contact");
  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-14 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-blue-100 text-lg">{t("subtitle")}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid md:grid-cols-5 gap-12">
          <ContactInfoSidebar />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
