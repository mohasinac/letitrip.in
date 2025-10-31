"use client";

import React from "react";
import {
  UnifiedInput,
  UnifiedSelect,
  UnifiedCheckbox,
  UnifiedRadio,
  UnifiedSwitch,
  SecondaryButton,
} from "@/components/ui/unified";
import { Plus, X } from "lucide-react";

interface ConditionFeaturesStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export default function ConditionFeaturesStep({
  data,
  onChange,
}: ConditionFeaturesStepProps) {
  const addFeature = () => {
    onChange({ features: [...data.features, ""] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...data.features];
    newFeatures[index] = value;
    onChange({ features: newFeatures });
  };

  const removeFeature = (index: number) => {
    onChange({
      features: data.features.filter((_: any, i: number) => i !== index),
    });
  };

  const addSpecification = () => {
    onChange({
      specifications: [...data.specifications, { key: "", value: "" }],
    });
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newSpecs = [...data.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onChange({ specifications: newSpecs });
  };

  const removeSpecification = (index: number) => {
    onChange({
      specifications: data.specifications.filter(
        (_: any, i: number) => i !== index
      ),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Condition & Features</h2>
        <p className="text-sm text-muted-foreground">
          Add product condition, shipping details, and features
        </p>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Condition <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <UnifiedRadio
            name="condition"
            value="new"
            label="New"
            checked={data.condition === "new"}
            onChange={(e) => onChange({ condition: e.target.value })}
          />
          <UnifiedRadio
            name="condition"
            value="used_mint"
            label="Used - Mint Condition"
            checked={data.condition === "used_mint"}
            onChange={(e) => onChange({ condition: e.target.value })}
          />
          <UnifiedRadio
            name="condition"
            value="used_good"
            label="Used - Good Condition"
            checked={data.condition === "used_good"}
            onChange={(e) => onChange({ condition: e.target.value })}
          />
          <UnifiedRadio
            name="condition"
            value="used_fair"
            label="Used - Fair Condition"
            checked={data.condition === "used_fair"}
            onChange={(e) => onChange({ condition: e.target.value })}
          />
          <UnifiedRadio
            name="condition"
            value="damaged"
            label="Damaged"
            checked={data.condition === "damaged"}
            onChange={(e) => onChange({ condition: e.target.value })}
          />
        </div>
      </div>

      {/* Returns */}
      <div className="space-y-3">
        <UnifiedSwitch
          label="Returnable"
          checked={data.returnable}
          onChange={(e) => onChange({ returnable: e.target.checked })}
        />
        {data.returnable && (
          <div className="ml-8">
            <UnifiedInput
              label="Return Period (days)"
              type="number"
              value={data.returnPeriod || 7}
              onChange={(e) =>
                onChange({ returnPeriod: parseInt(e.target.value) || 7 })
              }
              className="max-w-xs"
            />
          </div>
        )}
      </div>

      {/* Shipping */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Shipping</h3>
        <UnifiedSwitch
          label="Free Shipping"
          checked={data.shipping.isFree}
          onChange={(e) =>
            onChange({
              shipping: { ...data.shipping, isFree: e.target.checked },
            })
          }
        />

        <UnifiedSelect
          label="Shipping Method"
          value={data.shipping.method}
          onChange={(e) =>
            onChange({ shipping: { ...data.shipping, method: e.target.value } })
          }
        >
          <option value="seller">Seller Shipped</option>
          <option value="shiprocket">Shiprocket</option>
          <option value="pickup">Pickup Only</option>
        </UnifiedSelect>
      </div>

      {/* Weight & Dimensions */}
      <div>
        <h3 className="text-sm font-medium mb-1">
          Weight & Dimensions (Optional)
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Required for accurate shipping calculations
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <UnifiedInput
            label="Weight (grams)"
            type="number"
            value={data.shipping.weight || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  weight: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                },
              })
            }
            placeholder="e.g., 50"
            min={0}
          />
          <UnifiedInput
            label="Length (cm)"
            type="number"
            value={data.shipping.dimensions?.length || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  dimensions: {
                    ...data.shipping.dimensions,
                    length: e.target.value ? parseFloat(e.target.value) : 0,
                    width: data.shipping.dimensions?.width || 0,
                    height: data.shipping.dimensions?.height || 0,
                  },
                },
              })
            }
            placeholder="e.g., 10"
            min={0}
            step="0.1"
          />
          <UnifiedInput
            label="Width (cm)"
            type="number"
            value={data.shipping.dimensions?.width || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  dimensions: {
                    ...data.shipping.dimensions,
                    length: data.shipping.dimensions?.length || 0,
                    width: e.target.value ? parseFloat(e.target.value) : 0,
                    height: data.shipping.dimensions?.height || 0,
                  },
                },
              })
            }
            placeholder="e.g., 5"
            min={0}
            step="0.1"
          />
          <UnifiedInput
            label="Height (cm)"
            type="number"
            value={data.shipping.dimensions?.height || ""}
            onChange={(e) =>
              onChange({
                shipping: {
                  ...data.shipping,
                  dimensions: {
                    ...data.shipping.dimensions,
                    length: data.shipping.dimensions?.length || 0,
                    width: data.shipping.dimensions?.width || 0,
                    height: e.target.value ? parseFloat(e.target.value) : 0,
                  },
                },
              })
            }
            placeholder="e.g., 3"
            min={0}
            step="0.1"
          />
        </div>
      </div>

      {/* Product Features */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Product Features</h3>
          <SecondaryButton size="sm" leftIcon={<Plus />} onClick={addFeature}>
            Add Feature
          </SecondaryButton>
        </div>
        <div className="space-y-2">
          {data.features.map((feature: string, index: number) => (
            <div key={index} className="flex gap-2">
              <UnifiedInput
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="e.g., High-speed rotation"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Specifications</h3>
          <SecondaryButton
            size="sm"
            leftIcon={<Plus />}
            onClick={addSpecification}
          >
            Add Specification
          </SecondaryButton>
        </div>
        <div className="space-y-2">
          {data.specifications.map((spec: any, index: number) => (
            <div key={index} className="flex gap-2">
              <UnifiedInput
                value={spec.key}
                onChange={(e) =>
                  updateSpecification(index, "key", e.target.value)
                }
                placeholder="Key (e.g., Weight)"
                className="w-1/3"
              />
              <UnifiedInput
                value={spec.value}
                onChange={(e) =>
                  updateSpecification(index, "value", e.target.value)
                }
                placeholder="Value (e.g., 50g)"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
