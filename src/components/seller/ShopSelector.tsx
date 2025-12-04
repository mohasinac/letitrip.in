"use client";

import { useEffect } from "react";
import { FormSelect } from "@/components/forms";
import { shopsService } from "@/services/shops.service";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@/hooks/useLoadingState";

interface Option {
  label: string;
  value: string;
  slug: string;
}

interface ShopSelectorProps {
  value?: string; // shopId
  onChange: (shopId: string | undefined, slug?: string) => void;
  includeAllOption?: boolean;
  disabled?: boolean;
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
    isLoading: loading,
    data: options,
    execute,
  } = useLoadingState<Option[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error as Error, { component: "ShopSelector.loadShops" });
    },
  });

  useEffect(() => {
    execute(async () => {
      const res = await shopsService.list({ limit: 100 });
      return (res.data || []).map((s) => ({
        label: s.name,
        value: s.id,
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
          const sel = (options || []).find((o) => o.value === val);
          onChange(val, sel?.slug);
        }}
        disabled={disabled || loading}
        options={selectOptions}
      />
    </div>
  );
}
