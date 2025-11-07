"use client";

import { useState, useRef, useEffect } from "react";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "danger" | "success";
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  icon?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

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
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

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

  const handleItemClick = (item: ActionMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const variantStyles = {
    default:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    success:
      "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
  };

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
            {items.map((item, index) => (
              <button
                key={index}
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
