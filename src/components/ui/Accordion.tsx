'use client';

import React, { useState } from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * Accordion Component
 * 
 * Collapsible content sections with smooth animations.
 * Supports single or multiple open items.
 * 
 * @component
 * @example
 * ```tsx
 * <Accordion>
 *   <AccordionItem value="1" title="Section 1">
 *     Content for section 1
 *   </AccordionItem>
 *   <AccordionItem value="2" title="Section 2">
 *     Content for section 2
 *   </AccordionItem>
 * </Accordion>
 * ```
 */

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

const useAccordionContext = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion compound components must be used within Accordion');
  }
  return context;
};

// Main Accordion Container
interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

export default function Accordion({
  type = 'single',
  defaultValue,
  children,
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (defaultValue === undefined) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const isOpen = prev.includes(value);
      
      if (type === 'single') {
        return isOpen ? [] : [value];
      }
      
      return isOpen
        ? prev.filter((item) => item !== value)
        : [...prev, value];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// AccordionItem
interface AccordionItemProps {
  value: string;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function AccordionItem({
  value,
  title,
  children,
  disabled = false,
  className = '',
}: AccordionItemProps) {
  const { openItems, toggleItem } = useAccordionContext();
  const { themed } = THEME_CONSTANTS;
  const isOpen = openItems.includes(value);

  return (
    <div
      className={`
        ${themed.border} border-b last:border-b-0
        ${className}
      `}
    >
      <button
        type="button"
        onClick={() => !disabled && toggleItem(value)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${value}`}
        className={`
          w-full flex items-center justify-between
          px-4 py-4 text-left
          ${themed.textPrimary} font-medium
          hover:${themed.bgSecondary}
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span>{title}</span>
        <svg
          className={`
            w-5 h-5 transition-transform duration-200
            ${isOpen ? 'transform rotate-180' : ''}
          `}
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
      
      {isOpen && (
        <div
          id={`accordion-content-${value}`}
          role="region"
          aria-labelledby={`accordion-trigger-${value}`}
          className={`
            px-4 pb-4 ${themed.textSecondary}
            animate-in fade-in slide-in-from-top-1 duration-200
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
}
