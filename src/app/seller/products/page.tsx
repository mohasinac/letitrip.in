"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import ProductTable from "@/components/seller/ProductTable";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types";

export default function ProductsPage() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.list({ limit: 50 });
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your product listings
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ViewToggle view={view} onViewChange={setView} />
            <Link
              href="/seller/products/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading products...</div>
          </div>
        )}

        {/* Grid View */}
        {!loading && view === "grid" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.images?.[0] || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {product.categoryId}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <StatusBadge status={product.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <span>Stock: {product.stockCount}</span>
                    <span>Sales: {product.salesCount || 0}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/seller/products/${product.slug}/edit`}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {!loading && view === "table" && (
          <ProductTable
            products={filteredProducts}
            isLoading={loading}
            onRefresh={loadProducts}
          />
        )}
      </div>
    </>
  );
}
