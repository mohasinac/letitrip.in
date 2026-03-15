import React, { useState } from "react";
import type { FAQ, FAQCategory } from "../types";

interface FAQAccordionItemProps {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ faq, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div className="border-b border-neutral-200 last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-neutral-900 transition hover:text-primary"
      >
        <span>{faq.question}</span>
        <span
          className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-neutral-600">
          {faq.answer.format === "html" ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: faq.answer.text }}
            />
          ) : (
            <p className="whitespace-pre-line">{faq.answer.text}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface FAQAccordionProps {
  faqs: FAQ[];
  className?: string;
}

export function FAQAccordion({ faqs, className = "" }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div
      className={`divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white px-5 ${className}`}
    >
      {faqs.map((faq) => (
        <FAQAccordionItem
          key={faq.id}
          faq={faq}
          isOpen={openId === faq.id}
          onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
        />
      ))}
    </div>
  );
}

interface FAQCategoryTabsProps {
  categories: FAQCategory[];
  active?: FAQCategory | null;
  onSelect: (cat: FAQCategory | null) => void;
  labels?: Partial<Record<FAQCategory | "all", string>>;
}

export function FAQCategoryTabs({
  categories,
  active,
  onSelect,
  labels = {},
}: FAQCategoryTabsProps) {
  return (
    <div className="scrollbar-none flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${!active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
      >
        {labels.all ?? "All"}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${active === cat ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
        >
          {labels[cat] ?? cat.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
