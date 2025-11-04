import React from "react";
import { UnifiedCard } from "@/components/ui/unified/Card";

interface SettingsTabProps {
  enableCOD: boolean;
  freeShippingThreshold: number;
  processingTime: number;
  returnPolicy: string;
  shippingPolicy: string;
  onChange: (field: string, value: any) => void;
  loading: boolean;
}

export default function SettingsTab({
  enableCOD,
  freeShippingThreshold,
  processingTime,
  returnPolicy,
  shippingPolicy,
  onChange,
  loading,
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <UnifiedCard className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Payment Settings
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text">
              Enable Cash on Delivery (COD)
            </p>
            <p className="text-sm text-textSecondary">
              Allow customers to pay when they receive the order
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableCOD}
              onChange={(e) => onChange("enableCOD", e.target.checked)}
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surfaceHover peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </UnifiedCard>

      <UnifiedCard className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Shipping Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) =>
                onChange("freeShippingThreshold", parseInt(e.target.value) || 0)
              }
              placeholder="500"
              min="0"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
            />
            <p className="text-xs text-textSecondary mt-1">
              Orders above this amount get free shipping
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Processing Time (days)
            </label>
            <input
              type="number"
              value={processingTime}
              onChange={(e) =>
                onChange("processingTime", parseInt(e.target.value) || 1)
              }
              placeholder="2"
              min="1"
              max="30"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
            />
            <p className="text-xs text-textSecondary mt-1">
              Time to prepare orders for shipping
            </p>
          </div>
        </div>
      </UnifiedCard>

      <UnifiedCard className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Policies</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Return Policy
            </label>
            <textarea
              value={returnPolicy}
              onChange={(e) => onChange("returnPolicy", e.target.value)}
              placeholder="Describe your return policy here..."
              rows={6}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-textSecondary mt-1">
              Explain your return conditions, timeframe, and process
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Shipping Policy
            </label>
            <textarea
              value={shippingPolicy}
              onChange={(e) => onChange("shippingPolicy", e.target.value)}
              placeholder="Describe your shipping policy here..."
              rows={6}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-textSecondary mt-1">
              Explain shipping methods, costs, and delivery timeframes
            </p>
          </div>
        </div>
      </UnifiedCard>

      <UnifiedCard className="p-6 bg-blue-500/5 border-blue-500/20">
        <h4 className="font-semibold text-text mb-2">💡 Pro Tips</h4>
        <ul className="space-y-2 text-sm text-textSecondary">
          <li>• Clear return policies reduce customer hesitation</li>
          <li>• Free shipping thresholds encourage larger orders</li>
          <li>• Realistic processing times build customer trust</li>
          <li>• Detailed shipping policies prevent disputes</li>
        </ul>
      </UnifiedCard>
    </div>
  );
}
