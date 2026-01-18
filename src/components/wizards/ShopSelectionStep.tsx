"use client";

import ShopSelector from "@/components/seller/ShopSelector";
import type { ShopSelectionStepProps as LibraryShopSelectionStepProps } from "@letitrip/react-library";
import { ShopSelectionStep as LibraryShopSelectionStep } from "@letitrip/react-library";
import { Plus, Store } from "lucide-react";
import Link from "next/link";

export interface ShopSelectionStepProps
  extends Omit<
    LibraryShopSelectionStepProps,
    "selectorComponent" | "LinkComponent" | "icons"
  > {}

/**
 * ShopSelectionStep Component (Next.js Wrapper)
 *
 * Integrates library ShopSelectionStep with Next.js and Firebase.
 * Injects ShopSelector, Link component, and icons.
 */
export function ShopSelectionStep(props: ShopSelectionStepProps) {
  const { value, onChange, ...rest } = props;

  return (
    <LibraryShopSelectionStep
      {...rest}
      value={value}
      onChange={onChange}
      selectorComponent={
        <ShopSelector
          value={value}
          onChange={(shopId: string | undefined) => onChange(shopId || "")}
        />
      }
      LinkComponent={Link as any}
      icons={{
        plus: <Plus className="w-4 h-4" />,
        store: <Store className="w-4 h-4" />,
      }}
    />
  );
}

export default ShopSelectionStep;
