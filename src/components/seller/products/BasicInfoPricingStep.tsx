"use client";

import React from "react";
import {
  UnifiedInput,
  UnifiedTextarea,
  UnifiedSelect,
  UnifiedCheckbox,
  UnifiedBadge,
  UnifiedAlert,
} from "@/components/ui/unified";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BasicInfoPricingStepProps {
  data: any;
  categories: any[];
  addresses: any[];
  onChange: (updates: any) => void;
}

export default function BasicInfoPricingStep({
  data,
  categories,
  addresses,
  onChange,
}: BasicInfoPricingStepProps) {
  // Auto-generate SKU when name or category changes
  const generateSKU = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);

    // Extract category name
    const category = categories.find((c) => c.id === data.categoryId);
    const categoryName =
      category?.name?.toUpperCase().substring(0, 8) || "PROD";

    // Extract product code from name (4 chars)
    const productName = data.name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const productCode = productName.substring(0, 4) || "ITEM";

    return `${categoryName}-${productCode}-${timestamp}-${random}`;
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && event.currentTarget) {
      const input = event.currentTarget as HTMLInputElement;
      const value = input.value.trim();
      if (value && !data.tags.includes(value)) {
        onChange({ tags: [...data.tags, value] });
        input.value = "";
      }
      event.preventDefault();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ tags: data.tags.filter((tag: string) => tag !== tagToRemove) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-text">
          Basic Information & Pricing
        </h2>
      </div>

      <UnifiedAlert variant="info">
        Fill in the essential product details and pricing. SKU is optional and
        will be auto-generated if left empty.
      </UnifiedAlert>

      {/* Product Details */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-4">
          Product Details
        </h3>

        <div className="flex flex-col gap-4">
          <UnifiedInput
            label="Product Name"
            required
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., Beyblade Burst Evolution Dragoon"
            helperText="Clear, descriptive name for your product"
          />

          <div className="relative">
            <UnifiedSelect
              label="Category (Leaf Categories Only)"
              required
              value={data.categoryId}
              onChange={(e) => onChange({ categoryId: e.target.value })}
              helperText="Only leaf categories (without sub-categories) can be selected for products"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.pathString || cat.name}
                </option>
              ))}
            </UnifiedSelect>
            <FolderOpen className="w-4 h-4 text-textSecondary absolute left-3 top-10 pointer-events-none" />
          </div>

          <UnifiedInput
            label="Short Description"
            required
            value={data.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            placeholder="Brief one-line description"
            helperText="50-100 characters"
            maxLength={100}
          />

          <UnifiedTextarea
            label="Full Description"
            value={data.fullDescription}
            onChange={(e) => onChange({ fullDescription: e.target.value })}
            placeholder="Detailed product description, features, specifications..."
            helperText="Detailed information about your product"
            rows={4}
          />

          <div>
            <UnifiedInput
              label="Tags (Press Enter to add)"
              onKeyDown={handleAddTag}
              placeholder="e.g., beyblade, evolution, attack-type"
              helperText="Add relevant tags for better discoverability"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {data.tags.map((tag: string) => (
                <UnifiedBadge
                  key={tag}
                  variant="primary"
                  onRemove={() => handleRemoveTag(tag)}
                >
                  {tag}
                </UnifiedBadge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border"></div>

      {/* Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-4">Pricing</h3>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <UnifiedInput
              label="Selling Price"
              required
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
              leftIcon={<span className="text-textSecondary">₹</span>}
              helperText="Your selling price"
              min={0}
              step={0.01}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <UnifiedInput
              label="Compare at Price (Optional)"
              type="number"
              value={data.pricing.compareAtPrice || ""}
              onChange={(e) =>
                onChange({
                  pricing: {
                    ...data.pricing,
                    compareAtPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  },
                })
              }
              leftIcon={<span className="text-textSecondary">₹</span>}
              helperText="Original/MRP price"
              min={0}
              step={0.01}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <UnifiedInput
              label="Cost per Item (Optional)"
              type="number"
              value={data.pricing.cost || ""}
              onChange={(e) =>
                onChange({
                  pricing: {
                    ...data.pricing,
                    cost: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  },
                })
              }
              leftIcon={<span className="text-textSecondary">₹</span>}
              helperText="Your cost (private)"
              min={0}
              step={0.01}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border"></div>

      {/* Inventory */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-4">Inventory</h3>

        {/* Unique Item Checkbox */}
        <div className="mb-4">
          <UnifiedCheckbox
            label="Unique Item (One-of-a-Kind)"
            checked={data.inventory.isUnique || false}
            onChange={(e) => {
              const isUnique = e.target.checked;
              onChange({
                inventory: {
                  ...data.inventory,
                  isUnique,
                  quantity: isUnique ? 1 : data.inventory.quantity,
                  lowStockThreshold: isUnique
                    ? 0
                    : data.inventory.lowStockThreshold,
                  trackInventory: !isUnique,
                },
              });
            }}
            helperText="This is a single unique item - no inventory tracking needed"
          />
        </div>

        {data.inventory.isUnique && (
          <UnifiedAlert variant="info" className="mb-4">
            <strong>Unique Item Mode:</strong> Quantity is set to 1. No low
            stock alerts. Perfect for one-of-a-kind products, vintage items, or
            collectibles.
          </UnifiedAlert>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <label className="text-sm font-medium text-text mb-1.5 block">
                  SKU (Optional)
                </label>
                <UnifiedInput
                  value={data.inventory.sku}
                  onChange={(e) =>
                    onChange({
                      inventory: { ...data.inventory, sku: e.target.value },
                    })
                  }
                  placeholder="Auto-generated if empty"
                />
                <p className="text-xs text-textSecondary mt-1.5">
                  Stock Keeping Unit.{" "}
                  <span
                    className="text-primary cursor-pointer hover:underline"
                    onClick={() => {
                      const sku = generateSKU();
                      onChange({ inventory: { ...data.inventory, sku } });
                    }}
                  >
                    Generate SKU
                  </span>
                </p>
              </div>
            </div>

            <div className="flex-1 min-w-[150px]">
              <UnifiedInput
                label="Quantity"
                required
                type="number"
                value={data.inventory.quantity || ""}
                onChange={(e) =>
                  onChange({
                    inventory: {
                      ...data.inventory,
                      quantity: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={data.inventory.isUnique}
                helperText={
                  data.inventory.isUnique
                    ? "Fixed at 1 for unique items"
                    : "Available stock"
                }
                min={0}
                step={1}
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <UnifiedInput
                label="Low Stock Alert"
                type="number"
                value={data.inventory.lowStockThreshold || ""}
                onChange={(e) =>
                  onChange({
                    inventory: {
                      ...data.inventory,
                      lowStockThreshold: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={data.inventory.isUnique}
                helperText={
                  data.inventory.isUnique
                    ? "Not applicable for unique items"
                    : "Alert threshold"
                }
                min={0}
                step={1}
              />
            </div>
          </div>

          <UnifiedSelect
            label="Pickup Location (Optional)"
            value={data.pickupAddressId || ""}
            onChange={(e) => onChange({ pickupAddressId: e.target.value })}
          >
            <option value="">None</option>
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.addressLine1}, {addr.city}
              </option>
            ))}
          </UnifiedSelect>
        </div>
      </div>
    </div>
  );
}
