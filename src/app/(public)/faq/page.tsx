import { Metadata } from "next";
import FAQSection from "@/components/faq/FAQSection";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { FAQ_ITEMS } from "@/constants/faq";
import { generateFAQSchema, generateJSONLD } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Let It Rip",
  description:
    "Find answers to common questions about shopping imported products from Japan, China, USA, UK. No customs charges, fast India shipping, COD available.",
  keywords: [
    "FAQ",
    "help",
    "support",
    "imported products India",
    "no customs charges",
    "free customs clearance",
    "COD India",
    "fast shipping India",
    "returns India",
  ],
  openGraph: {
    title: "FAQ - Let It Rip Help Center",
    description:
      "Get answers about imported products, shipping, customs, payments & returns in India",
    type: "website",
  },
};

export default function FAQPage() {
  // Generate FAQ schema for rich snippets
  const faqSchema = generateFAQSchema(
    FAQ_ITEMS.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJSONLD(faqSchema)}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-blue-100">
              Find answers to common questions about shopping from Japan
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <FAQSection showSearch={true} />
      </section>

      {/* Still Need Help */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Still have questions?
            </h2>
            <p className="text-gray-600">
              We're here to help! Contact our support team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Customer Support Ticket */}
            <Link
              href="/support/ticket"
              className="block p-6 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Create Support Ticket
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get personalized help from our support team
                  </p>
                </div>
              </div>
            </Link>

            {/* Email Support */}
            <a
              href="mailto:support@letitrip.com"
              className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-600 text-white rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-sm text-gray-600">support@letitrip.com</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Popular Help Topics
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/faq?category=shipping"
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
            >
              <h3 className="font-medium text-gray-900">Shipping</h3>
            </Link>
            <Link
              href="/faq?category=returns"
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
            >
              <h3 className="font-medium text-gray-900">Returns</h3>
            </Link>
            <Link
              href="/faq?category=payments"
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
            >
              <h3 className="font-medium text-gray-900">Payments</h3>
            </Link>
            <Link
              href="/faq?category=auctions"
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
            >
              <h3 className="font-medium text-gray-900">Auctions</h3>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
