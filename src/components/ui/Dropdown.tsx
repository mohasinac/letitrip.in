"use client";

import React, { useState, useRef, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { useClickOutside, useKeyPress } from "@/hooks";

/**
 * Dropdown Component
 *
 * A dropdown menu with trigger button and menu items.
 * Supports keyboard navigation and click-outside-to-close.
 *
 * @component
 * @example
 * ```tsx
 * <Dropdown>
 *   <DropdownTrigger>
 *     <button>Menu</button>
 *   </DropdownTrigger>
 *   <DropdownMenu>
 *     <DropdownItem onClick={handleEdit}>Edit</DropdownItem>
 *     <DropdownItem onClick={handleDelete}>Delete</DropdownItem>
 *   </DropdownMenu>
 * </Dropdown>
 * ```
 */

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(
  undefined,
);

const useDropdownContext = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "Dropdown compound components must be used within Dropdown",
    );
  }
  return context;
};

// Main Dropdown Container
interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export default function Dropdown({ children, className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useClickOutside(dropdownRef, () => setIsOpen(false), { enabled: isOpen });

  // Close on Escape key
  useKeyPress("Escape", () => setIsOpen(false), { enabled: isOpen });

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// DropdownTrigger - Trigger button
interface DropdownTriggerProps {
  children: React.ReactElement;
  className?: string;
}

export function DropdownTrigger({
  children,
  className = "",
}: DropdownTriggerProps) {
  const { isOpen, setIsOpen } = useDropdownContext();

  return React.cloneElement(children, {
    onClick: () => setIsOpen(!isOpen),
    "aria-expanded": isOpen,
    "aria-haspopup": "true" as const,
    className: `${(children.props as any).className || ""} ${className}`,
  } as any);
}

// DropdownMenu - Menu container
interface DropdownMenuProps {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  children,
  align = "left",
  className = "",
}: DropdownMenuProps) {
  const { isOpen } = useDropdownContext();
  const { themed } = THEME_CONSTANTS;

  if (!isOpen) return null;

  const alignClasses = {
    left: "left-0",
    right: "right-0",
  };

  return (
    <div
      role="menu"
      className={`
        absolute z-50 mt-2 min-w-[200px] py-2 rounded-xl shadow-xl
        ${themed.bgPrimary} ${themed.border}
        animate-in fade-in slide-in-from-top-2 duration-200
        ${alignClasses[align]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// DropdownItem - Individual menu item
interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  destructive = false,
  icon,
  className = "",
}: DropdownItemProps) {
  const { setIsOpen } = useDropdownContext();
  const { themed } = THEME_CONSTANTS;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      setIsOpen(false);
    }
  };

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full px-4 py-2.5 text-left text-sm flex items-center gap-3
        transition-colors duration-150
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : destructive
              ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              : `${themed.textPrimary} hover:${themed.bgSecondary}`
        }
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
}

// DropdownSeparator - Visual separator
interface DropdownSeparatorProps {
  className?: string;
}

export function DropdownSeparator({ className = "" }: DropdownSeparatorProps) {
  const { themed } = THEME_CONSTANTS;

  return (
    <div
      role="separator"
      className={`my-1 h-px ${themed.borderLight} ${className}`}
    />
  );
}
