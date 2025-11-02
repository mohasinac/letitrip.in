"use client";

import React from "react";
import {
  UnifiedInput,
  UnifiedSwitch,
  UnifiedSelect,
  SecondaryButton,
} from "@/components/ui/unified";
import { RotateCcw } from "lucide-react";

interface PricingInventoryStepProps {
  data: any;
  addresses: any[];
  onChange: (updates: any) => void;
}

export default function PricingInventoryStep({
  data,
  addresses,
  onChange,
}: PricingInventoryStepProps) {
  const generateSKU = () => {
    // Smart SKU generation with category and product name
    const productName = data.name || "PRODUCT";
    const categoryName = data.categoryId ? "CAT" : "GEN"; // We'll improve this with actual category data

    // Extract first letters and numbers from product name
    const productCode = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substr(0, 4)
      .padEnd(4, "X");

    const timestamp = Date.now().toString().substr(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();

    const sku = `${categoryName}-${productCode}-${timestamp}-${random}`;
    onChange({ inventory: { ...data.inventory, sku } });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Pricing & Inventory
      </h2>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UnifiedInput
          label="Regular Price *"
          type="number"
          value={data.pricing.price || ""}
          onChange={(e) =>
            onChange({
              pricing: {
                ...data.pricing,
                price: parseFloat(e.target.value) || 0,
              },
            })
          }
          leftIcon={<span className="text-gray-500">₹</span>}
        />
        <UnifiedInput
          label="Compare At Price"
          type="number"
          value={data.pricing.compareAtPrice || ""}
          onChange={(e) =>
            onChange({
              pricing: {
                ...data.pricing,
                compareAtPrice: parseFloat(e.target.value) || undefined,
              },
            })
          }
          leftIcon={<span className="text-gray-500">₹</span>}
          helperText="Show savings"
        />
        <UnifiedInput
          label="Cost"
          type="number"
          value={data.pricing.cost || ""}
          onChange={(e) =>
            onChange({
              pricing: {
                ...data.pricing,
                cost: parseFloat(e.target.value) || undefined,
              },
            })
          }
          leftIcon={<span className="text-gray-500">₹</span>}
          helperText="For profit calculation"
        />
      </div>

      {/* Inventory */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
        Inventory
      </h3>

      <div className="flex gap-4">
        <UnifiedInput
          label="SKU *"
          className="flex-1"
          value={data.inventory.sku}
          onChange={(e) =>
            onChange({ inventory: { ...data.inventory, sku: e.target.value } })
          }
          helperText="Stock Keeping Unit"
        />
        <SecondaryButton
          onClick={generateSKU}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="mt-6"
        >
          Generate
        </SecondaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UnifiedInput
          label="Quantity *"
          type="number"
          value={data.inventory.quantity}
          onChange={(e) =>
            onChange({
              inventory: {
                ...data.inventory,
                quantity: parseInt(e.target.value) || 0,
              },
            })
          }
          helperText="Available stock"
        />
        <UnifiedInput
          label="Low Stock Threshold"
          type="number"
          value={data.inventory.lowStockThreshold}
          onChange={(e) =>
            onChange({
              inventory: {
                ...data.inventory,
                lowStockThreshold: parseInt(e.target.value) || 1,
              },
            })
          }
          min={1}
          helperText="Alert when stock is below this value"
        />
      </div>

      <UnifiedSwitch
        label="Track inventory"
        checked={data.inventory.trackInventory}
        onChange={(e) =>
          onChange({
            inventory: {
              ...data.inventory,
              trackInventory: e.target.checked,
            },
          })
        }
      />

      {addresses.length > 0 && (
        <UnifiedSelect
          label="Pickup Address"
          value={data.pickupAddressId || ""}
          onChange={(e) => onChange({ pickupAddressId: e.target.value })}
        >
          <option value="">Select an address</option>
          {addresses.map((addr: any) => (
            <option key={addr.id} value={addr.id}>
              {addr.label} - {addr.address}
            </option>
          ))}
        </UnifiedSelect>
      )}
    </div>
  );
}
