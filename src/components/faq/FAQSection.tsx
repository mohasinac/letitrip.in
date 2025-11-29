"use client";

import { useState } from "react";
import FAQItem from "./FAQItem";
import {
  getFAQsByCategory,
  FAQ_CATEGORIES,
  type FAQCategory,
} from "@/constants/faq";
import * as Icons from "lucide-react";

interface FAQSectionProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  maxItemsToShow?: number;
  defaultCategory?: string;
}

export default function FAQSection({
  title = "Frequently Asked Questions",
  description,
  showSearch = false,
  maxItemsToShow,
  defaultCategory,
}: FAQSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    defaultCategory || null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Get FAQs for selected category or all
  let faqs = selectedCategory
    ? getFAQsByCategory(selectedCategory)
    : FAQ_CATEGORIES.flatMap((cat) => getFAQsByCategory(cat.id));

  // Filter by search query
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    faqs = faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery),
    );
  }

  // Limit items if specified
  if (maxItemsToShow) {
    faqs = faqs.slice(0, maxItemsToShow);
  }

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <section className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{description}</p>
        )}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            All Categories
          </button>
          {FAQ_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {getIcon(category.icon)}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {faqs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No FAQs found. Try a different search term or category.
          </div>
        ) : (
          faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              defaultOpen={index === 0}
            />
          ))
        )}
      </div>

      {/* View More Link */}
      {maxItemsToShow && faqs.length >= maxItemsToShow && (
        <div className="text-center mt-6">
          <a
            href="/faq"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View all FAQs
            <Icons.ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </section>
  );
}
