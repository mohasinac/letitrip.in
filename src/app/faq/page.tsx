/**
 * FAQ Page
 *
 * Frequently Asked Questions about Let It Rip platform.
 *
 * @page /faq - FAQ page
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Let It Rip",
  description:
    "Find answers to common questions about buying, selling, auctions, payments, and more on Let It Rip.",
};

export default function FAQPage() {
  const faqCategories = [
    {
      title: "General",
      icon: "❓",
      faqs: [
        {
          question: "What is Let It Rip?",
          answer:
            "Let It Rip is India's leading online marketplace that combines traditional e-commerce with exciting auction features. You can buy products at fixed prices or participate in auctions to get great deals.",
        },
        {
          question: "How do I create an account?",
          answer:
            'Click the "Sign Up" button in the top navigation, fill in your details, and verify your email address. You can also sign up using your Google or Facebook account.',
        },
        {
          question: "Is Let It Rip available across India?",
          answer:
            "Yes! We deliver to all major cities and towns across India. Shipping times and costs vary by location.",
        },
      ],
    },
    {
      title: "Buying",
      icon: "🛒",
      faqs: [
        {
          question: "How do I place an order?",
          answer:
            "Browse products, add items to your cart, proceed to checkout, enter shipping details, and complete payment. You'll receive order confirmation via email.",
        },
        {
          question: "What payment methods are accepted?",
          answer:
            "We accept credit/debit cards, UPI, net banking, wallets (Paytm, PhonePe), and cash on delivery (for eligible orders).",
        },
        {
          question: "Can I cancel or modify my order?",
          answer:
            "You can cancel orders within 24 hours of placement if they haven't been shipped. Once shipped, cancellation is subject to our return policy.",
        },
        {
          question: "What is your return policy?",
          answer:
            "Most items can be returned within 7 days of delivery. Items must be unused and in original packaging. Some categories (electronics, personalized items) have different policies.",
        },
      ],
    },
    {
      title: "Auctions",
      icon: "⚡",
      faqs: [
        {
          question: "How do auctions work?",
          answer:
            "Sellers list items with a starting price and auction duration. Buyers place bids, and the highest bidder when the auction ends wins the item. All bids are binding commitments.",
        },
        {
          question: "Can I retract my bid?",
          answer:
            "Bids are binding and generally cannot be retracted. Only retract if there's a genuine error. Frequent retractions may result in account suspension.",
        },
        {
          question: "What happens if I win an auction?",
          answer:
            "You'll receive an email notification and must complete payment within 48 hours. The seller will then ship the item to your registered address.",
        },
        {
          question: "Is there a buyer's premium on auctions?",
          answer:
            "No, we don't charge buyers any additional fees. The final bid amount is your total purchase price (plus shipping if applicable).",
        },
      ],
    },
    {
      title: "Selling",
      icon: "💼",
      faqs: [
        {
          question: "How do I become a seller?",
          answer:
            'Click "Become a Seller", complete the registration form, and submit required documents (business registration, ID proof, bank details). Verification typically takes 24-48 hours.',
        },
        {
          question: "What fees do sellers pay?",
          answer:
            "We charge a commission on completed sales (5-15% depending on category). There are no listing fees or monthly charges. You only pay when you make a sale.",
        },
        {
          question: "How do I list a product?",
          answer:
            "From your seller dashboard, click 'Add Product', fill in details (title, description, price, images), choose category, and publish. Your listing goes live immediately after review.",
        },
        {
          question: "When do I receive payment?",
          answer:
            "Payments are released to your bank account 7 days after order delivery (or buyer confirmation). This protects both buyers and sellers.",
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      icon: "📦",
      faqs: [
        {
          question: "How long does shipping take?",
          answer:
            "Delivery times vary by location: Metro cities: 2-4 days, Other cities: 4-7 days, Remote areas: 7-10 days. Expedited shipping is available for select products.",
        },
        {
          question: "How can I track my order?",
          answer:
            "You'll receive a tracking number via email once your order ships. Track your order in the 'My Orders' section of your account.",
        },
        {
          question: "What if my order is delayed?",
          answer:
            "Check the tracking status first. If there's unusual delay, contact the seller through your order page. If unresolved, our support team will assist.",
        },
      ],
    },
    {
      title: "Safety & Security",
      icon: "🛡️",
      faqs: [
        {
          question: "Is my payment information secure?",
          answer:
            "Yes! We use industry-standard SSL encryption and work with PCI-compliant payment processors. We never store your complete card details.",
        },
        {
          question: "How do you verify sellers?",
          answer:
            "All sellers must complete KYC verification, providing business registration, ID proof, and bank details. We conduct background checks and monitor seller performance.",
        },
        {
          question: "What if I receive a counterfeit product?",
          answer:
            "Report it immediately through your order page. We take counterfeits seriously and will investigate, refund your purchase, and take action against the seller.",
        },
        {
          question: "How do I report suspicious activity?",
          answer:
            "Contact us at abuse@letitrip.in with details. We investigate all reports and take appropriate action to protect our community.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find answers to common questions about Let It Rip
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {faqCategories.map((category, catIndex) => (
              <div key={catIndex} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-4xl">{category.icon}</span>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {category.faqs.map((faq, faqIndex) => (
                    <details
                      key={faqIndex}
                      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </h3>
                        <svg
                          className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            {/* Still Need Help */}
            <div className="mt-16 text-center bg-primary/5 dark:bg-primary/10 rounded-2xl p-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Can't find the answer you're looking for? Our support team is
                here to help.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
