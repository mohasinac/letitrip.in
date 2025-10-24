"use client";

import { useState, useEffect } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { Product } from "@/types";
import { ProductsService } from "@/lib/services/products.service";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function SellerInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "draft" | "archived" | "low-stock"
  >("all");

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user, filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters: any = {
        sellerId: user?.id,
        pageSize: 100,
      };

      if (filter !== "all" && filter !== "low-stock") {
        filters.status = filter;
      }

      const response = await ProductsService.getProducts(filters);
      let filteredProducts = response.items;

      if (filter === "low-stock") {
        filteredProducts = filteredProducts.filter(
          (product) => product.quantity <= product.lowStockThreshold
        );
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await ProductsService.delete(productId);
        loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inventory Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your existing products and inventory levels
              </p>
            </div>
            <Link
              href="/seller/products/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add New Product
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: "all", label: "All Products" },
              { key: "active", label: "Active" },
              { key: "draft", label: "Draft" },
              { key: "archived", label: "Archived" },
              { key: "low-stock", label: "Low Stock" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products found.</p>
            <Link
              href="/seller/products/new"
              className="text-blue-600 hover:text-blue-500"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={
                            product.images[0]?.url || "/placeholder-product.jpg"
                          }
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {product.name}
                          </h3>
                          {product.quantity <= product.lowStockThreshold && (
                            <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </p>
                        <div className="flex items-center mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                          <span className="ml-4 text-sm text-gray-500">
                            Stock: {product.quantity} units
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/seller/products/edit/${product.id}`}
                          className="text-blue-400 hover:text-blue-500"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
