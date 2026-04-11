"use client";

import { Button } from "@/components";
import { useState, useRef, useEffect, createContext, useContext } from "react";

interface MenuContextValue {
  isOpen: boolean;
  close: () => void;
}
const MenuCtx = createContext<MenuContextValue>({
  isOpen: false,
  close: () => {},
});

export interface MenuProps {
  className?: string;
  children?: React.ReactNode;
}
export interface MenuTriggerProps {
  className?: string;
  children?: React.ReactNode;
}
export interface MenuContentProps {
  className?: string;
  children?: React.ReactNode;
}
export interface MenuItemProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export interface MenuSeparatorProps {
  className?: string;
}

function Menu({ className = "", children }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <MenuCtx.Provider value={{ isOpen, close: () => setIsOpen(false) }}>
      <div
        ref={ref}
        className={`relative inline-block ${className}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        {children}
      </div>
    </MenuCtx.Provider>
  );
}

function MenuTrigger({ className = "", children }: MenuTriggerProps) {
  return <div className={`cursor-pointer ${className}`}>{children}</div>;
}

function MenuContent({ className = "", children }: MenuContentProps) {
  const { isOpen } = useContext(MenuCtx);
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

function MenuItem({
  onClick,
  disabled,
  className = "",
  children,
}: MenuItemProps) {
  const { close } = useContext(MenuCtx);
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

function MenuSeparator({ className = "" }: MenuSeparatorProps) {
  return (
    <div
      className={`my-1 border-t border-gray-200 dark:border-gray-700 ${className}`}
    />
  );
}

export default Menu;
export { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator };
