"use client";

import { useState } from "react";

interface ProductDescriptionProps {
  description: string;
  specifications?: Record<string, string>;
  shipping?: string;
}

export function ProductDescription({
  description,
  specifications,
  shipping,
}: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "shipping"
  >("description");

  const tabs = [
    { id: "description" as const, label: "Description", show: true },
    {
      id: "specifications" as const,
      label: "Specifications",
      show: specifications && Object.keys(specifications).length > 0,
    },
    { id: "shipping" as const, label: "Shipping & Returns", show: true },
  ].filter((tab) => tab.show);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "description" && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {activeTab === "specifications" && specifications && (
          <div className="space-y-3">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="flex py-3 border-b last:border-b-0">
                <span className="w-1/3 text-gray-600 font-medium">{key}</span>
                <span className="w-2/3 text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-4">
            {shipping ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: shipping }}
              />
            ) : (
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Shipping Information
                  </h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Free shipping on orders above ₹5,000</li>
                    <li>Standard shipping: ₹100 (3-7 business days)</li>
                    <li>Express shipping available at checkout</li>
                    <li>Orders are processed within 1-2 business days</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Return Policy
                  </h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>7-day return policy on most items</li>
                    <li>Product must be unused and in original packaging</li>
                    <li>Free return shipping on defective items</li>
                    <li>Refunds processed within 5-7 business days</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Customer Support
                  </h3>
                  <p>
                    Need help? Contact us at{" "}
                    <a
                      href="mailto:support@letitrip.in"
                      className="text-primary hover:underline"
                    >
                      support@letitrip.in
                    </a>{" "}
                    or call 1800-XXX-XXXX
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
