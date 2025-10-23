"use client";

import { useState } from "react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const faqData: FAQItem[] = [
    // Shipping & Delivery
    {
      id: "1",
      category: "shipping",
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business days. International shipping may take 7-14 business days depending on the destination.",
    },
    {
      id: "2",
      category: "shipping",
      question: "Do you ship internationally?",
      answer:
        "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by destination. Please check our shipping calculator at checkout for specific rates.",
    },
    {
      id: "3",
      category: "shipping",
      question: "Can I track my order?",
      answer:
        "Absolutely! Once your order ships, you'll receive a tracking number via email. You can also track your orders by logging into your account and visiting the 'Order History' section.",
    },
    {
      id: "4",
      category: "shipping",
      question: "What if my package is damaged or lost?",
      answer:
        "If your package arrives damaged or gets lost in transit, please contact us within 48 hours of the expected delivery date. We'll work with the shipping carrier to resolve the issue and ensure you receive your items.",
    },

    // Orders & Returns
    {
      id: "5",
      category: "orders",
      question: "How can I cancel or modify my order?",
      answer:
        "You can cancel or modify your order within 1 hour of placing it by contacting our customer service team. After that, your order may have already been processed and shipped.",
    },
    {
      id: "6",
      category: "orders",
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for unused items in original packaging. Items must be returned in the same condition they were received. Custom or personalized items are not eligible for return.",
    },
    {
      id: "7",
      category: "orders",
      question: "How do I return an item?",
      answer:
        "To return an item, log into your account, go to 'Order History', and click 'Return Item' next to the product. Follow the instructions to print a return label and ship the item back to us.",
    },
    {
      id: "8",
      category: "orders",
      question: "When will I receive my refund?",
      answer:
        "Refunds are processed within 3-5 business days after we receive your returned item. The refund will be credited to your original payment method and may take an additional 2-3 business days to appear in your account.",
    },

    // Products
    {
      id: "9",
      category: "products",
      question: "Are your Beyblades authentic?",
      answer:
        "Yes, all our Beyblades are 100% authentic and sourced directly from official manufacturers like Takara Tomy and Hasbro. We guarantee the authenticity of every product we sell.",
    },
    {
      id: "10",
      category: "products",
      question: "Do you sell spare parts for Beyblades?",
      answer:
        "Yes, we offer a wide selection of Beyblade parts including performance tips, energy layers, forge discs, and more. Check our 'Parts & Accessories' section for available components.",
    },
    {
      id: "11",
      category: "products",
      question: "What's the difference between Beyblade Burst and Metal Fight?",
      answer:
        "Beyblade Burst features a burst mechanism where Beyblades can 'burst' apart during battle, while Metal Fight (Metal Fusion) uses heavier metal wheels for more intense battles. Both are official Beyblade series but have different gameplay mechanics.",
    },
    {
      id: "12",
      category: "products",
      question: "Are Beyblade stadiums necessary?",
      answer:
        "While not absolutely necessary, official Beyblade stadiums provide the best battling experience and are designed to contain the Beyblades safely during battles. We recommend using official stadiums for competitive play.",
    },

    // Account & Payment
    {
      id: "13",
      category: "account",
      question: "Do I need an account to place an order?",
      answer:
        "You can place orders as a guest, but creating an account allows you to track orders, save addresses, maintain a wishlist, and access exclusive member benefits.",
    },
    {
      id: "14",
      category: "account",
      question: "How do I reset my password?",
      answer:
        "Click 'Forgot Password' on the login page and enter your email address. We'll send you a secure link to reset your password. If you don't receive the email, check your spam folder.",
    },
    {
      id: "15",
      category: "account",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through encrypted connections.",
    },
    {
      id: "16",
      category: "account",
      question: "Is my payment information secure?",
      answer:
        "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers and comply with PCI DSS security standards.",
    },

    // Auctions
    {
      id: "17",
      category: "auctions",
      question: "How do Beyblade auctions work?",
      answer:
        "Our auctions feature rare and limited edition Beyblades. Place bids during the auction period, and the highest bidder wins when the auction ends. All auction winners must complete payment within 24 hours.",
    },
    {
      id: "18",
      category: "auctions",
      question: "Can I retract a bid?",
      answer:
        "Bids are binding and generally cannot be retracted. However, in exceptional circumstances (such as entering the wrong amount), contact us immediately and we'll review your request on a case-by-case basis.",
    },
    {
      id: "19",
      category: "auctions",
      question: "What happens if I win an auction but don't pay?",
      answer:
        "Failure to pay for won auctions may result in account restrictions or suspension. We may also offer the item to the second-highest bidder at their bid price.",
    },

    // Technical Support
    {
      id: "20",
      category: "support",
      question: "The website isn't working properly. What should I do?",
      answer:
        "Try clearing your browser cache and cookies, or try using a different browser. If problems persist, contact our technical support team with details about your browser and the issue you're experiencing.",
    },
    {
      id: "21",
      category: "support",
      question: "How can I contact customer support?",
      answer:
        "You can reach us through our contact form, email us at support@justforview.in, or call us at 1-800-BEYBLADE during business hours (9 AM - 6 PM EST, Monday-Friday).",
    },
    {
      id: "22",
      category: "support",
      question: "Do you offer live chat support?",
      answer:
        "Yes, live chat is available during business hours (9 AM - 6 PM EST, Monday-Friday). Look for the chat icon in the bottom right corner of your screen.",
    },
  ];

  const categories = [
    { id: "all", name: "All Categories", count: faqData.length },
    {
      id: "shipping",
      name: "Shipping & Delivery",
      count: faqData.filter((item) => item.category === "shipping").length,
    },
    {
      id: "orders",
      name: "Orders & Returns",
      count: faqData.filter((item) => item.category === "orders").length,
    },
    {
      id: "products",
      name: "Products",
      count: faqData.filter((item) => item.category === "products").length,
    },
    {
      id: "account",
      name: "Account & Payment",
      count: faqData.filter((item) => item.category === "account").length,
    },
    {
      id: "auctions",
      name: "Auctions",
      count: faqData.filter((item) => item.category === "auctions").length,
    },
    {
      id: "support",
      name: "Technical Support",
      count: faqData.filter((item) => item.category === "support").length,
    },
  ];

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (itemId: string) => {
    setOpenItem(openItem === itemId ? null : itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our Beyblade products,
            shipping, returns, and more. Can't find what you're looking for?
            Contact our support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{category.name}</span>
                    <span
                      className={`text-sm ${
                        selectedCategory === category.id
                          ? "text-primary-100"
                          : "text-gray-400"
                      }`}
                    >
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:w-3/4">
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-medium text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      <svg
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          openItem === item.id ? "transform rotate-180" : ""
                        }`}
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
                    </button>
                    {openItem === item.id && (
                      <div className="px-6 pb-4">
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No results found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or browse different categories.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our customer support team
            is here to help. Get in touch with us through any of the following
            methods.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Email Support
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Get detailed help via email
              </p>
              <a
                href="mailto:support@justforview.in"
                className="btn btn-outline btn-sm"
              >
                Email Us
              </a>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-3">
                Chat with us in real-time
              </p>
              <button className="btn btn-outline btn-sm">Start Chat</button>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Phone Support
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Call us during business hours
              </p>
              <a href="tel:1-800-BEYBLADE" className="btn btn-outline btn-sm">
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
