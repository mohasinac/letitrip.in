/**
 * Unified Dropdown Component
 * Menu, context menu, and dropdown functionality
 * Keyboard navigation and accessibility
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  submenu?: DropdownItem[];
  onClick?: () => void;
}

export interface UnifiedDropdownProps {
  // Trigger
  trigger: React.ReactElement;

  // Items
  items: DropdownItem[];

  // Behavior
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  closeOnSelect?: boolean;

  // Style
  className?: string;
  menuClassName?: string;
}

export const UnifiedDropdown: React.FC<UnifiedDropdownProps> = ({
  trigger,
  items,
  placement = "bottom-start",
  closeOnSelect = true,
  className,
  menuClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = rect.bottom + window.scrollY;
      let left = rect.left + window.scrollX;

      if (placement.startsWith("top")) {
        top = rect.top + window.scrollY - (menuRef.current?.offsetHeight || 0);
      }
      if (placement.endsWith("end")) {
        left =
          rect.right + window.scrollX - (menuRef.current?.offsetWidth || 0);
      }

      setPosition({ top, left });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, placement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    if (item.submenu) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else {
      item.onClick?.();
      if (closeOnSelect) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    }
  };

  const triggerWithRef = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      setIsOpen(!isOpen);
      trigger.props.onClick?.(e);
    },
  });

  const menuContent =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              zIndex: 9999,
            }}
            className={cn(
              "bg-surface rounded-lg shadow-xl border-2 border-border",
              "py-2 min-w-[200px] animate-slideDown",
              menuClassName
            )}
            role="menu"
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider ? (
                  <div className="my-2 border-t border-border" />
                ) : (
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={cn(
                      "w-full px-4 py-2 text-left flex items-center gap-3",
                      "text-sm transition-colors",
                      item.disabled
                        ? "text-textTertiary cursor-not-allowed"
                        : item.danger
                        ? "text-error hover:bg-error/10"
                        : "text-text hover:bg-surfaceVariant",
                      "focus:outline-none focus:bg-surfaceVariant"
                    )}
                    role="menuitem"
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                    {item.submenu && <ChevronRight className="w-4 h-4" />}
                  </button>
                )}

                {/* Submenu */}
                {item.submenu && activeSubmenu === item.id && (
                  <div className="ml-4 mt-1 border-l-2 border-border pl-2">
                    {item.submenu.map((subitem) => (
                      <button
                        key={subitem.id}
                        onClick={() => handleItemClick(subitem)}
                        disabled={subitem.disabled}
                        className={cn(
                          "w-full px-4 py-2 text-left flex items-center gap-3",
                          "text-sm transition-colors",
                          subitem.disabled
                            ? "text-textTertiary cursor-not-allowed"
                            : "text-text hover:bg-surfaceVariant"
                        )}
                        role="menuitem"
                      >
                        {subitem.icon && (
                          <span className="w-5 h-5">{subitem.icon}</span>
                        )}
                        <span className="flex-1">{subitem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {triggerWithRef}
      {menuContent}
    </>
  );
};

// ============================================================================
// DROPDOWN SELECT (Single/Multi Select)
// ============================================================================

export interface DropdownSelectProps {
  trigger: React.ReactElement;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  trigger,
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
  className,
}) => {
  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = isSelected(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
    }
  };

  const items: DropdownItem[] = options.map((option) => ({
    id: option.value,
    label: option.label,
    disabled: option.disabled,
    icon: isSelected(option.value) ? (
      <Check className="w-4 h-4 text-primary" />
    ) : null,
    onClick: () => handleSelect(option.value),
  }));

  return (
    <UnifiedDropdown
      trigger={trigger}
      items={items}
      closeOnSelect={!multiple}
      className={className}
    />
  );
};

export default UnifiedDropdown;
