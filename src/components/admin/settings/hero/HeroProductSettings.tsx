"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  AlertCircle,
} from "lucide-react";

type BadgeType = "Popular" | "New" | "Sale";
type BadgeColorType = "warning" | "success" | "error";

interface HeroProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: BadgeType;
  badgeColor?: BadgeColorType;
}

export default function HeroProductSettings() {
  const [products, setProducts] = useState<HeroProduct[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    badge: "" as "Popular" | "New" | "Sale" | "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("hero-products");
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      // Initialize with default products
      const defaults: HeroProduct[] = [
        {
          id: "dragoon-gt",
          name: "Dragoon GT",
          price: 2499,
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
          badge: "Popular",
          badgeColor: "warning",
        },
        {
          id: "valkyrie-x",
          name: "Valkyrie X",
          price: 1899,
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
          badge: "New",
          badgeColor: "success",
        },
        {
          id: "spriggan-burst",
          name: "Spriggan Burst",
          price: 1699,
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
          badge: "Sale",
          badgeColor: "error",
        },
      ];
      setProducts(defaults);
      localStorage.setItem("hero-products", JSON.stringify(defaults));
    }
  }, []);

  const handleOpenDialog = (product?: HeroProduct) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        badge: product.badge || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        image: "",
        badge: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.image) {
      alert("Please fill in all required fields");
      return;
    }

    let updatedProducts;

    if (editingId) {
      updatedProducts = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formData.name,
              price: parseInt(formData.price),
              image: formData.image,
              badge: formData.badge ? (formData.badge as BadgeType) : undefined,
              badgeColor:
                formData.badge === "Sale"
                  ? ("error" as BadgeColorType)
                  : formData.badge === "New"
                    ? ("success" as BadgeColorType)
                    : formData.badge === "Popular"
                      ? ("warning" as BadgeColorType)
                      : undefined,
            }
          : p,
      );
    } else {
      updatedProducts = [
        ...products,
        {
          id: Date.now().toString(),
          name: formData.name,
          price: parseInt(formData.price),
          image: formData.image,
          badge: formData.badge ? (formData.badge as BadgeType) : undefined,
          badgeColor:
            formData.badge === "Sale"
              ? ("error" as BadgeColorType)
              : formData.badge === "New"
                ? ("success" as BadgeColorType)
                : formData.badge === "Popular"
                  ? ("warning" as BadgeColorType)
                  : undefined,
        },
      ];
    }

    setProducts(updatedProducts);
    localStorage.setItem("hero-products", JSON.stringify(updatedProducts));
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem("hero-products", JSON.stringify(updatedProducts));
    }
  };

  const getBadgeStyle = (badge: string | undefined) => {
    switch (badge) {
      case "Sale":
        return "bg-red-100 text-red-700 border-red-300";
      case "New":
        return "bg-green-100 text-green-700 border-green-300";
      case "Popular":
        return "bg-amber-100 text-amber-700 border-amber-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Featured Products
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage the products displayed in the hero carousel
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Select up to 6 featured products to display on your homepage hero
            carousel. These products will be shown dynamically.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No products configured. Add featured products to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full bg-white"
              >
                <div className="relative pt-[100%] bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {product.badge && (
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded border ${getBadgeStyle(product.badge)}`}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 p-4 pb-2">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-blue-600 mb-2">
                    ₹{product.price}
                  </p>
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => handleOpenDialog(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog for Add/Edit */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dragoon GT"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2499"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Price in rupees</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/product.jpg"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Full URL to the product image
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge (Optional)
                </label>
                <select
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      badge: (e.target.value as BadgeType | "") || "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="Popular">Popular</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
              {formData.image && (
                <div
                  className="w-full h-52 bg-cover bg-center rounded-lg border border-gray-200"
                  style={{
                    backgroundImage: `url(${formData.image})`,
                  }}
                />
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
