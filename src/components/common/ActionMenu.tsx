/**
 * @fileoverview React Component
 * @module src/components/common/ActionMenu
 * @description This file contains the ActionMenu component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState, useRef, useEffect } from "react";

/**
 * ActionMenuItem interface
 * 
 * @interface
 * @description Defines the structure and contract for ActionMenuItem
 */
export interface ActionMenuItem {
  /** Label */
  label: string;
  /** On Click */
  onClick: () => void;
  /** Icon */
  icon?: React.ReactNode;
  /** Variant */
  variant?: "default" | "danger" | "success";
  /** Disabled */
  disabled?: boolean;
}

/**
 * ActionMenuProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ActionMenuProps
 */
export interface ActionMenuProps {
  /** Items */
  items: ActionMenuItem[];
  /** Label */
  label?: string;
  /** Icon */
  icon?: React.ReactNode;
  /** Align */
  align?: "left" | "right";
  /** Class Name */
  className?: string;
}

/**
 * Function: Action Menu
 */
/**
 * Performs action menu operation
 *
 * @returns {any} The actionmenu result
 *
 * @example
 * ActionMenu();
 */

/**
 * Performs action menu operation
 *
 * @returns {any} The actionmenu result
 *
 * @example
 * ActionMenu();
 */

export function ActionMenu({
  items,
  label = "Actions",
  icon,
  align = "right",
  className = "",
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /**
     * Handles click outside event
     *
     * @param {MouseEvent} event - The event
     *
     * @returns {any} The handleclickoutside result
     */

    /**
     * Handles click outside event
     *
     * @param {MouseEvent} event - The event
     *
     * @returns {any} The handleclickoutside result
     */

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    /**
     * Handles escape event
     *
     * @param {KeyboardEvent} event - The event
     *
     * @returns {any} The handleescape result
     */

    /**
     * Handles escape event
     *
     * @param {KeyboardEvent} event - The event
     *
     * @returns {any} The handleescape result
     */

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
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

  /**
   * Handles item click event
   *
   * @param {ActionMenuItem} item - The item
   *
   * @returns {any} The handleitemclick result
   */

  /**
   * Handles item click event
   *
   * @param {ActionMenuItem} item - The item
   *
   * @returns {any} The handleitemclick result
   */

  const handleItemClick = (item: ActionMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const variantStyles = {
    /** Default */
    default:
      "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
    /** Danger */
    danger:
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    /** Success */
    success:
      "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
  };

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {icon || (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        )}
        <span>{label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-10 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="py-1">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : variantStyles[item.variant || "default"]
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
