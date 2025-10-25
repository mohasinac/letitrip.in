"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { ProductsService } from "@/lib/services/products.service";
import { SellerService } from "@/lib/services/seller.service";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { toast } from "react-hot-toast";
import Link from "next/link";
import RealTimeIndicator from "@/components/ui/RealTimeIndicator";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export default function SellerInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "draft" | "archived" | "low-stock"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    if (user) {
      const debounceTimer = setTimeout(() => {
        loadProducts();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [user, filter, searchTerm, refreshKey]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters: any = {
        sellerId: user?.id,
        limit: 100,
        search: searchTerm,
      };

      if (filter !== "all" && filter !== "low-stock") {
        filters.status = filter;
      }

      // Use SellerService for consistency with other seller pages
      const { products: fetchedProducts } = await SellerService.getProducts(
        filters
      );
      let filteredProducts = fetchedProducts;

      if (filter === "low-stock") {
        filteredProducts = filteredProducts.filter(
          (product) => product.stock <= (product.lowStockThreshold || 10)
        );
      }

      // Transform to match existing Product interface
      const transformedProducts = filteredProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, "-"),
        sku: p.sku,
        status: p.status,
        quantity: p.stock,
        lowStockThreshold: p.lowStockThreshold || 10,
        price: p.price,
        images: p.images ? p.images.map((img: any) => ({ url: img })) : [],
        category: p.category,
        tags: p.tags || [],
        description: p.description || "",
        weight: p.weight || 0,
        weightUnit: p.weightUnit || "g",
        isFeatured: p.isFeatured || false,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await SellerService.deleteProduct(productId);
        loadProducts();
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleStatusUpdate = async (productId: string, newStatus: string) => {
    try {
      await SellerService.updateProduct(productId, {
        status: newStatus as any,
      });
      loadProducts();
      toast.success("Product status updated");
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products first");
      return;
    }

    if (
      confirm(
        `Are you sure you want to ${action} ${selectedProducts.length} product(s)?`
      )
    ) {
      try {
        for (const productId of selectedProducts) {
          switch (action) {
            case "activate":
              await SellerService.updateProduct(productId, {
                status: "active" as any,
              });
              break;
            case "deactivate":
              await SellerService.updateProduct(productId, {
                status: "inactive" as any,
              });
              break;
            case "archive":
              await SellerService.updateProduct(productId, {
                status: "archived" as any,
              });
              break;
            case "delete":
              await SellerService.deleteProduct(productId);
              break;
          }
        }
        setSelectedProducts([]);
        loadProducts();
        toast.success(
          `Successfully ${action}d ${selectedProducts.length} product(s)`
        );
      } catch (error) {
        console.error(`Failed to ${action} products:`, error);
        toast.error(`Failed to ${action} products`);
      }
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
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
    <div>
      {/* Enhanced Header */}
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-primary flex items-center">
                  Inventory Management
                  <RealTimeIndicator
                    isConnected={!loading}
                    className="ml-3"
                    showText={false}
                  />
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Manage your existing products and inventory levels
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-border">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Grid
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                disabled={loading}
                className="px-3 py-2 text-secondary hover: text-primary border border-border rounded-lg hover: bg-surface disabled:opacity-50"
                title="Refresh Products"
              >
                <ArrowPathIcon
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              <Link
                href="/seller/products/new"
                className="btn btn-primary transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add New Product</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-8">
              {[
                { key: "all", label: "All Products", count: products.length },
                {
                  key: "active",
                  label: "Active",
                  count: products.filter((p) => p.status === "active").length,
                },
                {
                  key: "draft",
                  label: "Draft",
                  count: products.filter((p) => p.status === "draft").length,
                },
                {
                  key: "archived",
                  label: "Archived",
                  count: products.filter((p) => p.status === "archived").length,
                },
                {
                  key: "low-stock",
                  label: "Low Stock",
                  count: products.filter(
                    (p) => p.quantity <= p.lowStockThreshold
                  ).length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    filter === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                        filter === tab.key
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
                <span className="text-sm font-medium text-blue-800">
                  {selectedProducts.length} selected
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction("archive")}
                    className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="text-xs text-secondary px-2 py-1 border border-border rounded hover: bg-surface"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">No products found.</p>
            <Link
              href="/seller/products/new"
              className="text-blue-600 hover:text-blue-500"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="bg-background shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-border">
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
                          <h3 className="text-lg font-medium text-primary">
                            {product.name}
                          </h3>
                          {product.quantity <= product.lowStockThreshold && (
                            <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted">SKU: {product.sku}</p>
                        <div className="flex items-center mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                          <span className="ml-4 text-sm text-muted">
                            Stock: {product.quantity} units
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-primary">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-muted hover: text-muted"
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
    </div>
  );
}
