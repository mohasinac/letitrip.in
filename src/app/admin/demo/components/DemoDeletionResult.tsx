"use client";

import { CheckCircle, Package } from "lucide-react";
import { DeletionBreakdown } from "./types";
import { COLLECTION_CONFIG } from "./config";

interface DemoDeletionResultProps {
  total: number;
  breakdown: DeletionBreakdown[];
}

export function DemoDeletionResult({
  total,
  breakdown,
}: DemoDeletionResultProps) {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
          Deletion Complete - {total} Documents Deleted
        </h2>
      </div>

      {breakdown.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {breakdown.map((item) => {
            const config = COLLECTION_CONFIG[item.collection] || {
              icon: Package,
              color: "text-gray-600",
              label: item.collection,
            };
            const CollIcon = config.icon;
            return (
              <div
                key={item.collection}
                className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center gap-2"
              >
                <CollIcon className={`w-4 h-4 ${config.color}`} />
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {config.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
