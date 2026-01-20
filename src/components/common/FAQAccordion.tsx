"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  allowMultiple?: boolean;
  defaultOpenIndex?: number;
  className?: string;
}

interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-4">
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {item.answer}
          </div>
        </div>
      )}
    </div>
  );
}

export function FAQAccordion({
  items,
  allowMultiple = false,
  defaultOpenIndex = -1,
  className = "",
}: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(
    defaultOpenIndex >= 0 ? new Set([defaultOpenIndex]) : new Set(),
  );

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    } else {
      setOpenItems(openItems.has(index) ? new Set() : new Set([index]));
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}

export default FAQAccordion;
