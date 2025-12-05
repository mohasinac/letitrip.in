/**
 * @fileoverview React Component
 * @module src/components/faq/FAQItem
 * @description This file contains the FAQItem component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * FAQItemProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FAQItemProps
 */
interface FAQItemProps {
  /** Question */
  question: string;
  /** Answer */
  answer: string;
  /** Default Open */
  defaultOpen?: boolean;
}

export default /**
 * Performs f a q item operation
 *
 * @param {FAQItemProps} [{
  question,
  answer,
  defaultOpen = false,
}] - The {
  question,
  answer,
  defaultopen = false,
}
 *
 * @returns {any} The faqitem result
 *
 */
function FAQItem({
  question,
  answer,
  defaultOpen = false,
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 px-6 flex items-start justify-between gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 dark:text-white flex-1">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
