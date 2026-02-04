'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';
import { useClickOutside, useKeyPress } from '@/hooks';

interface MenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

export interface MenuProps {
  children: React.ReactNode;
  className?: string;
}

export interface MenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface MenuContentProps {
  children: React.ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface MenuSeparatorProps {
  className?: string;
}

export default function Menu({ children, className = '' }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useClickOutside(menuRef, () => setIsOpen(false), { enabled: isOpen });

  // Close on Escape key
  useKeyPress('Escape', () => setIsOpen(false), { enabled: isOpen });

  return (
    <MenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={menuRef} className={`relative inline-block ${className}`}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export function MenuTrigger({ children, className = '' }: MenuTriggerProps) {
  const context = useContext(MenuContext);
  
  if (!context) {
    throw new Error('MenuTrigger must be used within Menu');
  }

  const { isOpen, setIsOpen } = context;

  const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      {children}
    </button>
  );
}

export function MenuContent({ children, position = 'bottom-left', className = '' }: MenuContentProps) {
  const context = useContext(MenuContext);
  const { themed } = THEME_CONSTANTS;
  
  if (!context) {
    throw new Error('MenuContent must be used within Menu');
  }

  const { isOpen } = context;

  if (!isOpen) return null;

  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
  };

  return (
    <div
      role="menu"
      className={`
        absolute ${positionClasses[position]} z-50
        min-w-[12rem] ${themed.bgSecondary} rounded-lg shadow-lg border ${themed.border}
        py-1 animate-in fade-in-0 zoom-in-95
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function MenuItem({ children, onClick, disabled = false, className = '' }: MenuItemProps) {
  const context = useContext(MenuContext);
  const { themed } = THEME_CONSTANTS;
  
  if (!context) {
    throw new Error('MenuItem must be used within Menu');
  }

  const { setIsOpen } = context;

  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick?.();
      setIsOpen(false);
    }
  }, [disabled, onClick, setIsOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        w-full text-left px-4 py-2 text-sm
        ${disabled 
          ? `${themed.textMuted} cursor-not-allowed` 
          : `${themed.textPrimary} ${themed.hover} cursor-pointer`
        }
        transition-colors
        ${className}
      `}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </button>
  );
}

export function MenuSeparator({ className = '' }: MenuSeparatorProps) {
  const { themed } = THEME_CONSTANTS;
  
  return (
    <div 
      role="separator" 
      className={`my-1 border-t ${themed.border} ${className}`} 
    />
  );
}
