"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  images: Array<{ url: string; alt: string }>;
  stock: number;
  sku: string;
  status: "active" | "inactive" | "out_of_stock" | "archived";
  featured: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: string;
  views?: number;
  totalSales?: number;
}

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "inactive" | "out_of_stock" | "archived"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      if (!user) {
        console.error("No user found");
        return;
      }

      // Get Firebase ID token for authentication
      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No authenticated user found");
        return;
      }

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/seller/products?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error(data.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, filter, searchTerm, selectedCategory]);

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      if (!user) return;

      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const toggleProductStatus = async (
    productId: string,
    newStatus: Product["status"]
  ) => {
    try {
      if (!user) return;

      const auth = (await import("firebase/auth")).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setProducts(
          products.map((p) =>
            p.id === productId ? { ...p, status: newStatus } : p
          )
        );
      }
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      out_of_stock: "bg-red-100 text-red-800",
      archived: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const categories = [
    "all",
    "Metal Fight",
    "Beyblade Burst",
    "Beyblade X",
    "Stadiums",
    "Launchers",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesFilter = filter === "all" || product.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesFilter && matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">My Products</h1>
              <p className="mt-1 text-sm text-muted">
                Manage your product catalog and inventory
              </p>
            </div>
            <Link
              href="/seller/products/new"
              className="btn btn-primary transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArchiveBoxIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArchiveBoxIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => p.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArchiveBoxIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => p.status === "out_of_stock").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ArchiveBoxIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setFilter("all");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ArchiveBoxIcon className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">
              {searchTerm || filter !== "all" || selectedCategory !== "all"
                ? "No products match your filters."
                : products.length === 0
                ? "You haven't added any products yet."
                : "No products found."}
            </p>
            {products.length === 0 ? (
              <Link
                href="/seller/products/new"
                className="text-blue-600 hover:text-blue-500"
              >
                Add your first product
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setFilter("all");
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.images[0].alt}
                                  width={40}
                                  height={40}
                                  className="rounded-lg object-cover"
                                />
                              ) : (
                                <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  Featured
                                </span>
                              )}
                              {product.views} views • {product.totalSales} sales
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            ₹{product.price.toLocaleString()}
                          </div>
                          {product.comparePrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{product.comparePrice.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={
                            product.stock <= 5 ? "text-red-600 font-medium" : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View product"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/seller/products/${product.id}/edit`}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              toggleProductStatus(
                                product.id,
                                product.status === "active"
                                  ? "inactive"
                                  : "active"
                              )
                            }
                            className={`p-1 ${
                              product.status === "active"
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={
                              product.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete product"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
