/**
 * @fileoverview React Component
 * @module src/components/seller/ShopSelector
 * @description This file contains the ShopSelector component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useEffect } from "react";
import { FormSelect } from "@/components/forms/FormSelect";
import { shopsService } from "@/services/shops.service";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@/hooks/useLoadingState";

/**
 * Option interface
 * 
 * @interface
 * @description Defines the structure and contract for Option
 */
interface Option {
  /** Label */
  label: string;
  /** Value */
  value: string;
  /** Slug */
  slug: string;
}

/**
 * ShopSelectorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopSelectorProps
 */
interface ShopSelectorProps {
  value?: string; // shopId
  /** On Change */
  onChange: (shopId: string | undefined, slug?: string) => void;
  /** Include All Option */
  includeAllOption?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Class Name */
  className?: string;
}

export default function ShopSelector({
  value,
  onChange,
  includeAllOption = false,
  disabled,
  className = "",
}: ShopSelectorProps) {
  const {
    /** Is Loading */
    isLoading: loading,
    /** Data */
    data: options,
    execute,
  } = useLoadingState<Option[]>({
    /** Initial Data */
    initialData: [],
    /** On Load Error */
    onLoadError: (error) => {
      logError(error as Error, { component: "ShopSelector.loadShops" });
    },
  });

  useEffect(() => {
    execute(async () => {
      const res = await shopsService.list({ limit: 100 });
      return (res.data || []).map((s) => ({
        /** Label */
        label: s.name,
        /** Value */
        value: s.id,
        /** Slug */
        slug: s.slug,
      }));
    });
  }, []);

  const selectOptions = includeAllOption
    ? [{ value: "", label: "All Shops" }, ...(options || [])]
    : options || [];
  return (
    <div className={className}>
      <FormSelect
        id="shop-selector"
        label="Shop"
        value={value || ""}
        onChange={(e) => {
          const val = e.target.value || undefined;
          /**
           * Performs sel operation
           *
           * @param {any} options || []).find((o - The options || []).find((o
           *
           * @returns {any} The sel result
           */

          /**
           * Performs sel operation
           *
           * @param {any} options || []).find((o - The options || []).find((o
           *
           * @returns {any} The sel result
           */

          const sel = (options || []).find((o) => o.value === val);
          onChange(val, sel?.slug);
        }}
        disabled={disabled || loading}
        options={selectOptions}
      />
    </div>
  );
}
