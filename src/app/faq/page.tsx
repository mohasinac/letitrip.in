"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqData, setFAQData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "FAQ",
      href: "/faq",
      active: true,
    },
  ]);

  useEffect(() => {
    async function loadFAQData() {
      try {
        // Simulate loading FAQ data
        await new Promise((resolve) => setTimeout(resolve, 500));

        const faqs: FAQItem[] = [
          {
            question: "How can I contact customer support?",
            answer:
              "You can reach us through our contact form, email us at support@justforview.in, or call us during business hours at +91 98765 43210.",
            category: "Support",
          },
          {
            question: "How long does shipping take?",
            answer:
              "We offer free shipping on orders above ₹1000. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days within India.",
            category: "Shipping",
          },
          {
            question: "Do you sell authentic Beyblades?",
            answer:
              "Yes, we guarantee 100% authentic products. We work directly with authorized distributors and provide certificates of authenticity where applicable.",
            category: "Products",
          },
          {
            question: "How do Beyblade auctions work?",
            answer:
              "Our live auctions allow you to bid on rare and exclusive Beyblades. You can place bids during the auction period, and the highest bidder wins when the auction ends.",
            category: "Auctions",
          },
          {
            question: "What is your return policy?",
            answer:
              "We offer easy returns within 7 days of delivery for unopened items in original condition. For auction items, returns are subject to specific terms mentioned in the auction.",
            category: "Returns",
          },
          {
            question: "How can I track my order?",
            answer:
              "Once your order ships, you'll receive a tracking number via email and SMS. You can also check your order status in your account dashboard.",
            category: "Orders",
          },
          {
            question: "Do you offer international shipping?",
            answer:
              "Currently, we only ship within India. We're working on expanding our shipping to international locations. Please check back for updates.",
            category: "Shipping",
          },
          {
            question: "What payment methods do you accept?",
            answer:
              "We accept all major credit/debit cards, UPI, net banking, and cash on delivery for orders within India. All payments are processed securely.",
            category: "Payment",
          },
          {
            question: "How do I participate in tournaments?",
            answer:
              "We regularly host Beyblade tournaments. Follow our social media or subscribe to our newsletter to get notified about upcoming events and registration details.",
            category: "Tournaments",
          },
          {
            question: "Do you offer bulk discounts?",
            answer:
              "Yes, we offer special pricing for bulk orders and retailers. Please contact our sales team at sales@justforview.in for bulk pricing information.",
            category: "Pricing",
          },
        ];

        setFAQData(faqs);
      } catch (error) {
        console.error("Error loading FAQ data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFAQData();
  }, []);

  // Get unique categories from FAQ data
  const categories = [
    { id: "all", name: "All Categories", count: faqData.length },
    ...Array.from(
      new Set(faqData.map((item) => item.category || "General"))
    ).map((category) => ({
      id: category.toLowerCase(),
      name: category,
      count: faqData.filter((item) => (item.category || "General") === category)
        .length,
    })),
  ];

  const filteredFAQs = faqData.filter((item) => {
    const itemCategory = (item.category || "General").toLowerCase();
    const matchesCategory =
      selectedCategory === "all" || itemCategory === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-base text-gray-600 dark:text-gray-400">
            Loading FAQ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
              Find answers to common questions about our Beyblade products,
              shipping, returns, and more. Can't find what you're looking for?
              Contact our support team.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            {/* Categories Sidebar */}
            <div>
              <div className="p-6 rounded-2xl sticky top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <h6 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Categories
                </h6>
                <div className="flex flex-col gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 text-left rounded-lg transition-all duration-300 hover:translate-x-1 ${
                        selectedCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div>
              {filteredFAQs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFAQs.map((item, index) => (
                    <div
                      key={`${item.question}-${index}`}
                      className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() =>
                          setExpandedIndex(
                            expandedIndex === index ? null : index
                          )
                        }
                        className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
                          expandedIndex === index
                            ? "border-b border-gray-200 dark:border-gray-800"
                            : ""
                        }`}
                      >
                        <h6 className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                          {item.question}
                        </h6>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                            expandedIndex === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedIndex === index && (
                        <div className="px-6 py-4">
                          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h6 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    No results found
                  </h6>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Try adjusting your search or browse different categories.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <h3 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Still need help?
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our customer support
              team is here to help. Get in touch with us through any of the
              following methods.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <a
                href="mailto:support@justforview.in"
                className="p-8 text-center rounded-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 no-underline"
              >
                <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Email Support
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Get detailed help via email
                </p>
                <span className="inline-block px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white">
                  Email Us
                </span>
              </a>

              <div className="p-8 text-center rounded-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Live Chat
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Chat with us in real-time
                </p>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white">
                  Start Chat
                </button>
              </div>

              <a
                href="tel:+919876543210"
                className="p-8 text-center rounded-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 no-underline"
              >
                <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Phone Support
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Call us during business hours
                </p>
                <span className="inline-block px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white">
                  Call Us
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
