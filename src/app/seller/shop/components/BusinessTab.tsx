import React from "react";
import { UnifiedCard } from "@/components/ui/unified/Card";

interface BusinessTabProps {
  businessName: string;
  businessType: string;
  gstNumber: string;
  panNumber: string;
  onChange: (field: string, value: string) => void;
  loading: boolean;
}

export default function BusinessTab({
  businessName,
  businessType,
  gstNumber,
  panNumber,
  onChange,
  loading,
}: BusinessTabProps) {
  return (
    <div className="space-y-6">
      <UnifiedCard className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Business Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Business Name *
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => onChange("businessName", e.target.value)}
              placeholder="Enter your business name"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Business Type *
            </label>
            <select
              value={businessType}
              onChange={(e) => onChange("businessType", e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
            >
              <option value="">Select business type</option>
              <option value="individual">Individual</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="llp">LLP</option>
              <option value="private_limited">Private Limited</option>
              <option value="public_limited">Public Limited</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              GST Number
            </label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) =>
                onChange("gstNumber", e.target.value.toUpperCase())
              }
              placeholder="22AAAAA0000A1Z5"
              disabled={loading}
              maxLength={15}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 uppercase"
            />
            <p className="text-xs text-textSecondary mt-1">
              15-digit GST identification number
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              PAN Number
            </label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) =>
                onChange("panNumber", e.target.value.toUpperCase())
              }
              placeholder="ABCDE1234F"
              disabled={loading}
              maxLength={10}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 uppercase"
            />
            <p className="text-xs text-textSecondary mt-1">
              10-character PAN (Permanent Account Number)
            </p>
          </div>
        </div>
      </UnifiedCard>

      <UnifiedCard className="p-6 bg-primary/5 border-primary/20">
        <h4 className="font-semibold text-text mb-2">Why do we need this?</h4>
        <ul className="space-y-2 text-sm text-textSecondary">
          <li>• Business details help build trust with customers</li>
          <li>• GST number is required for generating invoices</li>
          <li>• PAN is needed for tax compliance and payments</li>
          <li>• Valid documentation may be required for verification</li>
        </ul>
      </UnifiedCard>
    </div>
  );
}
