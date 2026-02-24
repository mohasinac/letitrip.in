"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { ContactInfoSidebar, ContactForm } from "@/components";

const LABELS = UI_LABELS.CONTACT_PAGE;
const { themed } = THEME_CONSTANTS;

export default function ContactPage() {
  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{LABELS.TITLE}</h1>
          <p className="text-blue-100 text-lg">{LABELS.SUBTITLE}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-12">
          <ContactInfoSidebar />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
