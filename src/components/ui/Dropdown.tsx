"use client";

import { Button } from "@/components";
import { useState, useRef, useEffect, createContext, useContext } from "react";

interface DropdownCtxValue {
  isOpen: boolean;
  close: () => void;
}
const DropdownCtx = createContext<DropdownCtxValue>({
  isOpen: false,
  close: () => {},
});

export interface DropdownProps {
  className?: string;
  children?: React.ReactNode;
}
export interface DropdownTriggerProps {
  className?: string;
  children?: React.ReactNode;
}
export interface DropdownMenuProps {
  className?: string;
  children?: React.ReactNode;
}
export interface DropdownItemProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export interface DropdownSeparatorProps {
  className?: string;
}

function Dropdown({ className = "", children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <DropdownCtx.Provider value={{ isOpen, close: () => setIsOpen(false) }}>
      <div
        ref={ref}
        className={`relative inline-block ${className}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        {children}
      </div>
    </DropdownCtx.Provider>
  );
}

function DropdownTrigger({ className = "", children }: DropdownTriggerProps) {
  return <div className={`cursor-pointer ${className}`}>{children}</div>;
}

function DropdownMenu({ className = "", children }: DropdownMenuProps) {
  const { isOpen } = useContext(DropdownCtx);
  if (!isOpen) return null;
  return (
    <div
      className={`absolute right-0 z-50 mt-1 min-w-[160px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function DropdownItem({
  onClick,
  disabled,
  className = "",
  children,
}: DropdownItemProps) {
  const { close } = useContext(DropdownCtx);
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        close();
      }}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </Button>
  );
}

function DropdownSeparator({ className = "" }: DropdownSeparatorProps) {
  return (
    <div
      className={`my-1 border-t border-gray-200 dark:border-gray-700 ${className}`}
    />
  );
}

export default Dropdown;
export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
};
