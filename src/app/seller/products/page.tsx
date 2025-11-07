"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  ChevronRight,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InlineFormModal } from "@/components/common/InlineFormModal";
import { ProductInlineForm } from "@/components/seller/ProductInlineForm";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types";

export default function ProductsPage() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsService.delete(slug);
      loadProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormSuccess = () => {
    setEditingProduct(null);
    setShowCreateModal(false);
    loadProducts();
  };

  return (
    <>
      <InlineFormModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="lg"
      >
        <ProductInlineForm
          product={editingProduct || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingProduct(null)}
        />
      </InlineFormModal>

      <InlineFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Product"
        size="lg"
      >
        <ProductInlineForm
          shopId="default-shop-id"
          onSuccess={handleFormSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </InlineFormModal>

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
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100">
                            <img
                              src={
                                product.images?.[0] ||
                                "/placeholder-product.jpg"
                              }
                              alt={product.name}
                              className="h-full w-full rounded object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.shopId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.categoryId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.stockCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.salesCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                            title="Quick Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/seller/products/${product.slug}/edit`}
                            className="rounded p-1.5 text-green-600 hover:bg-green-50"
                            title="Edit Page (Wizard)"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.slug)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inline Create Row */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Quick Add Product
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
