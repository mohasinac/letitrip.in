"use client";

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { BreadcrumbItem } from "@/components/shared/Breadcrumb";

interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  setBreadcrumbItems: (items: BreadcrumbItem[]) => void;
  addBreadcrumbItem: (item: BreadcrumbItem) => void;
  clearBreadcrumbs: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  const setBreadcrumbItems = useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);

  const addBreadcrumbItem = useCallback((item: BreadcrumbItem) => {
    setItems((prevItems) => [...prevItems, item]);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{
        items,
        setBreadcrumbItems,
        addBreadcrumbItem,
        clearBreadcrumbs,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return context;
};

export default BreadcrumbContext;
