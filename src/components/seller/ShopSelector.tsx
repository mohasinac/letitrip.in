"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Shop
      </label>
      <select
        value={value || ""}
        onChange={(e) => {
          const val = e.target.value || undefined;
          const sel = options.find((o) => o.value === val);
          onChange(val, sel?.slug);
        }}
        disabled={disabled || loading}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {includeAllOption && <option value="">All Shops</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
