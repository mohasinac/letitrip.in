"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AdminService } from "@/lib/services/admin.service";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import RealTimeIndicator from "@/components/ui/RealTimeIndicator";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bulkActions, setBulkActions] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        sort: "newest",
      };

      // Use the AdminService for consistent data fetching
      const {
        products: fetchedProducts,
        total,
        pages,
      } = await AdminService.getProducts(filters);

      setProducts(
        fetchedProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || `SKU-${p.id}`,
          category: p.category,
          price: p.price,
          stock: p.stock,
          status: p.status,
          image: p.images?.[0] || "/images/placeholder.jpg",
          createdAt:
            p.createdAt?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          updatedAt:
            p.updatedAt?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
        }))
      );

      // Update pagination info if available
      if (total && pages) {
        // You could set total pages state here if needed
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced action handlers
  const handleProductStatusUpdate = async (
    productId: string,
    newStatus: "active" | "inactive"
  ) => {
    try {
      await AdminService.updateProductStatus(productId, newStatus);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Failed to update product status:", error);
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await AdminService.deleteProduct(productId);
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
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
              await AdminService.updateProductStatus(productId, "active");
              break;
            case "deactivate":
              await AdminService.updateProductStatus(productId, "inactive");
              break;
            case "delete":
              await AdminService.deleteProduct(productId);
              break;
          }
        }
        setSelectedProducts([]);
        fetchProducts();
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
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedStatus, currentPage, refreshKey]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      out_of_stock: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const categories = [
    "all",
    "Beyblade Burst",
    "Metal Fight",
    "Beyblade X",
    "Stadiums",
    "Launchers",
  ];
  const statuses = ["all", "active", "inactive", "out_of_stock"];

  if (loading) {
    return (
      <div className="admin-layout flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-primary flex items-center">
                  Product Management
                  <RealTimeIndicator
                    isConnected={!loading}
                    className="ml-3"
                    showText={false}
                  />
                </h1>
                <p className="text-secondary mt-1">
                  Manage your inventory and product catalog
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                disabled={loading}
                className="btn btn-outline"
                title="Refresh Products"
              >
                <svg
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              <Link
                href="/admin/products/add"
                className="btn btn-primary flex items-center space-x-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Filters with Bulk Actions */}
        <div className="admin-card p-6 mb-6">
          {/* Bulk Actions Bar */}
          {selectedProducts.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedProducts.length} product
                  {selectedProducts.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="btn btn-success text-sm"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    className="btn btn-warning text-sm"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="btn btn-danger text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="btn btn-outline text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full"
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
              <label className="block text-sm font-medium text-primary mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input w-full"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all"
                      ? "All Statuses"
                      : status.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setCurrentPage(1);
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="admin-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-primary">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">
                  Active Products
                </p>
                <p className="text-2xl font-bold text-primary">
                  {products.filter((p) => p.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-primary">
                  {products.filter((p) => p.status === "out_of_stock").length}
                </p>
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">
                  Total Stock
                </p>
                <p className="text-2xl font-bold text-primary">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-surface ${
                      selectedProducts.includes(product.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center">
                            <svg
                              className="h-6 w-6 text-muted"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      <span
                        className={
                          product.stock <= 10 ? "text-danger font-medium" : ""
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
                        {/* Status Toggle */}
                        <button
                          onClick={() =>
                            handleProductStatusUpdate(
                              product.id,
                              product.status === "active"
                                ? "inactive"
                                : "active"
                            )
                          }
                          className={`text-xs px-2 py-1 rounded ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          title={`${
                            product.status === "active"
                              ? "Deactivate"
                              : "Activate"
                          } product`}
                        >
                          {product.status === "active" ? "Active" : "Inactive"}
                        </button>

                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-primary hover:text-primary-dark"
                          title="Edit product"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/products/${product.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "")}`}
                          className="text-success hover:text-success-dark"
                          title="View product details"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleProductDelete(product.id)}
                          className="text-danger hover:text-danger-dark"
                          title="Delete product"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-background px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredProducts.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredProducts.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-primary border-primary text-white"
                              : "bg-background border-border text-secondary hover:bg-surface"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
