/**
 * Unified Accordion Component
 * Collapsible sections with animation
 * Single or multiple panels open
 */

"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface UnifiedAccordionProps {
  items: AccordionItem[];
  defaultOpen?: string | string[];
  allowMultiple?: boolean;
  onChange?: (openItems: string[]) => void;
  variant?: "default" | "separated" | "bordered";
  className?: string;
}

export const UnifiedAccordion: React.FC<UnifiedAccordionProps> = ({
  items,
  defaultOpen = [],
  allowMultiple = false,
  onChange,
  variant = "default",
  className,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(
    Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]
  );

  const isOpen = (id: string) => openItems.includes(id);

  const toggleItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.disabled) return;

    let newOpenItems: string[];

    if (allowMultiple) {
      newOpenItems = isOpen(id)
        ? openItems.filter((itemId) => itemId !== id)
        : [...openItems, id];
    } else {
      newOpenItems = isOpen(id) ? [] : [id];
    }

    setOpenItems(newOpenItems);
    onChange?.(newOpenItems);
  };

  const variantClasses = {
    default: {
      container: "divide-y divide-border",
      item: "",
      header: "hover:bg-surfaceVariant",
    },
    separated: {
      container: "space-y-4",
      item: "bg-surface rounded-lg border-2 border-border overflow-hidden",
      header: "hover:bg-surfaceVariant",
    },
    bordered: {
      container:
        "border-2 border-border rounded-lg overflow-hidden divide-y divide-border",
      item: "",
      header: "hover:bg-surfaceVariant",
    },
  };

  const styles = variantClasses[variant];

  return (
    <div className={cn(styles.container, className)} role="region">
      {items.map((item) => {
        const open = isOpen(item.id);

        return (
          <div key={item.id} className={styles.item}>
            {/* Header */}
            <button
              onClick={() => toggleItem(item.id)}
              disabled={item.disabled}
              aria-expanded={open}
              aria-controls={`accordion-content-${item.id}`}
              className={cn(
                "w-full px-6 py-4 flex items-center gap-3 text-left",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                styles.header,
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Icon */}
              {item.icon && (
                <span className="w-5 h-5 text-primary flex-shrink-0">
                  {item.icon}
                </span>
              )}

              {/* Title */}
              <span
                className={cn(
                  "flex-1 font-semibold transition-colors",
                  open ? "text-primary" : "text-text"
                )}
              >
                {item.title}
              </span>

              {/* Chevron */}
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  open ? "rotate-180" : "rotate-0",
                  item.disabled ? "text-textTertiary" : "text-textSecondary"
                )}
              />
            </button>

            {/* Content */}
            <div
              id={`accordion-content-${item.id}`}
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              )}
              aria-hidden={!open}
            >
              <div className="px-6 py-4 text-textSecondary leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// SIMPLE ACCORDION ITEM (Standalone)
// ============================================================================

export interface SimpleAccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const SimpleAccordionItem: React.FC<SimpleAccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  icon,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "border-2 border-border rounded-lg overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-surfaceVariant transition-colors"
      >
        {icon && (
          <span className="w-5 h-5 text-primary flex-shrink-0">{icon}</span>
        )}
        <span
          className={cn(
            "flex-1 font-semibold transition-colors",
            isOpen ? "text-primary" : "text-text"
          )}
        >
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-textSecondary transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-4 text-textSecondary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAccordion;
