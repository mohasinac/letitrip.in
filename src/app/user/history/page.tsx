"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Trash2, X, ShoppingBag } from "lucide-react";
import { useViewingHistory } from "@/contexts/ViewingHistoryContext";
import OptimizedImage from "@/components/common/OptimizedImage";
import { formatCurrency } from "@/lib/formatters";

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useViewingHistory();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  if (history.length === 0) {
    return (
      <main id="user-history-page" className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Viewing History
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Clock className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No viewing history yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Products you view will appear here for easy access
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Start Browsing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="user-history-page" className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Viewing History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {history.length} item{history.length !== 1 ? "s" : ""} viewed
          </p>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Clear viewing history?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This will remove all items from your viewing history. This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow"
          >
            {/* Remove button */}
            <button
              onClick={() => removeFromHistory(item.id)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 dark:hover:text-red-400 transition-all"
              aria-label={`Remove ${item.title} from history`}
            >
              <X className="w-4 h-4" />
            </button>

            <Link href={`/products/${item.slug}`}>
              {/* Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                <OptimizedImage
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.shop_name}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(item.viewed_at)}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
