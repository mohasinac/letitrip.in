"use client";

import { useState, useEffect } from "react";
import { useRealTimeData } from "@/hooks/data/useRealTimeData";

interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  growth: number;
}

export default function TopProducts() {
  const fetchTopProducts = async () => {
    const response = await fetch("/api/admin/analytics/top-products");
    if (!response.ok) {
      throw new Error("Failed to fetch top products");
    }
    const data = await response.json();
    return data;
  };

  const {
    data: products,
    loading: isLoading,
    error,
  } = useRealTimeData(fetchTopProducts, {
    enabled: true,
    interval: 60000, // Refresh every minute
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="admin-card">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="admin-card-title">Top Products</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 className="admin-card-title">Top Products</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {!products || products.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {error ? "Failed to load top products" : "No top products found."}
            </div>
          ) : (
            (products as TopProduct[]).map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-x-4 rounded-lg p-4 admin-card shadow-sm"
              >
                <div className="flex items-center gap-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-border"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      {product.sales} sales
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-semibold text-foreground">
                    ${product.revenue.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      product.growth >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.growth >= 0 ? "+" : "-"}
                    {Math.abs(product.growth)}% growth
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
