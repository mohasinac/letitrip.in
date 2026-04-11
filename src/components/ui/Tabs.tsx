"use client";

import { Button } from "@mohasinac/appkit/ui";

import { useState, createContext, useContext } from "react";

interface TabsContextValue {
  active: string;
  setActive: (v: string) => void;
}
const TabsContext = createContext<TabsContextValue>({
  active: "",
  setActive: () => {},
});

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}
export interface TabsListProps {
  className?: string;
  children?: React.ReactNode;
}
export interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export interface TabsContentProps {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

export function Tabs({
  defaultValue = "",
  value: controlled,
  onChange,
  className = "",
  children,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = controlled ?? internal;
  const setActive = (v: string) => {
    if (controlled == null) setInternal(v);
    onChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  disabled,
  className = "",
  children,
}: TabsTriggerProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <Button
      role="tab"
      type="button"
      disabled={disabled}
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors disabled:opacity-50
        ${
          isActive
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }
        ${className}`}
    >
      {children}
    </Button>
  );
}

export function TabsContent({
  value,
  className = "",
  children,
}: TabsContentProps) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={`py-4 ${className}`}>
      {children}
    </div>
  );
}

export default Tabs;
