"use client";

import { useEffect, useState } from "react";
import { FormSelect } from "@/components/forms";
import { shopsService } from "@/services/shops.service";

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
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await shopsService.list({ limit: 100 });
        const opts = (res.data || []).map((s) => ({
          label: s.name,
          value: s.id,
          slug: s.slug,
        }));
        setOptions(opts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectOptions = includeAllOption
    ? [{ value: "", label: "All Shops" }, ...options]
    : options;

  return (
    <div className={className}>
      <FormSelect
        id="shop-selector"
        label="Shop"
        value={value || ""}
        onChange={(e) => {
          const val = e.target.value || undefined;
          const sel = options.find((o) => o.value === val);
          onChange(val, sel?.slug);
        }}
        disabled={disabled || loading}
        options={selectOptions}
      />
    </div>
  );
}
