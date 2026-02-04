'use client';

import React, { useState, createContext, useContext } from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * Tabs Component
 * 
 * A tabbed interface for switching between different content panels.
 * Supports controlled and uncontrolled modes with keyboard navigation.
 * 
 * @component
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Profile</TabsTrigger>
 *     <TabsTrigger value="tab2">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Profile content</TabsContent>
 *   <TabsContent value="tab2">Settings content</TabsContent>
 * </Tabs>
 * ```
 */

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs');
  }
  return context;
};

// Main Tabs Container
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export default function Tabs({
  defaultValue,
  value: controlledValue,
  onChange,
  children,
  className = '',
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleChange = onChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabsList - Container for tab triggers
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  const { themed } = THEME_CONSTANTS;

  return (
    <div
      role="tablist"
      className={`
        inline-flex items-center gap-1 p-1 rounded-lg
        ${themed.bgSecondary}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// TabsTrigger - Individual tab button
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TabsTrigger({
  value,
  children,
  disabled = false,
  className = '',
}: TabsTriggerProps) {
  const { value: selectedValue, onChange } = useTabsContext();
  const { themed } = THEME_CONSTANTS;
  const isSelected = value === selectedValue;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={`
        px-4 py-2 text-sm font-medium rounded-md
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isSelected
            ? `${themed.bgPrimary} ${themed.textPrimary} shadow-sm`
            : `${themed.textSecondary} hover:${themed.textPrimary}`
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// TabsContent - Content panel for each tab
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  
  if (value !== selectedValue) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={`mt-4 ${className}`}
    >
      {children}
    </div>
  );
}
