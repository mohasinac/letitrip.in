"use client";

import { useState, useEffect } from "react";

interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  growth: number;
}

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch("/api/admin/analytics/top-products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          // Mock data for development
          const mockProducts: TopProduct[] = [
            {
              id: "1",
              name: "Beyblade Burst Evolution",
              image: "/images/beyblade1.jpg",
              sales: 245,
              revenue: 367500,
              growth: 15.2,
            },
            {
              id: "2",
              name: "Stadium Arena Pro",
              image: "/images/stadium1.jpg",
              sales: 156,
              revenue: 234000,
              growth: 8.7,
            },
            {
              id: "3",
              name: "Launcher Grip Set",
              image: "/images/launcher1.jpg",
              sales: 189,
              revenue: 189000,
              growth: -2.1,
            },
            {
              id: "4",
              name: "Metal Fight Series",
              image: "/images/beyblade2.jpg",
              sales: 134,
              revenue: 201000,
              growth: 12.5,
            },
            {
              id: "5",
              name: "Accessories Pack",
              image: "/images/accessories1.jpg",
              sales: 98,
              revenue: 98000,
              growth: 5.3,
            },
          ];
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error("Failed to fetch top products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
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
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No product data available
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">
                      {product.sales} sold
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`flex items-center ${
                      product.growth >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 mr-1 ${
                        product.growth >= 0 ? "rotate-0" : "rotate-180"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      {Math.abs(product.growth)}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
