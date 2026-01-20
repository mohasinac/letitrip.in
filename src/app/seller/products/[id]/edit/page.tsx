/**
 * Edit Product Page
 *
 * Form for sellers to edit existing product listings.
 *
 * @page /seller/products/[id]/edit - Edit product page
 */

import { FALLBACK_PRODUCTS, fetchWithFallback } from "@/lib/fallback-data";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Edit Product | Seller Dashboard",
  description: "Update your product listing details",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Fetch product details
async function getProduct(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return fetchWithFallback(
    async () => {
      const res = await fetch(`${baseUrl}/api/products/${id}`, {
        next: { revalidate: 0 }, // No cache for edit page
      });

      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      return data.data;
    },
    FALLBACK_PRODUCTS[0],
    `Failed to fetch product ${id}, using fallback`,
  );
}

export default async function EditProductPage({ params }: PageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Product
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update your product listing details
            </p>
          </div>

          {/* Form */}
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue={product.name}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    defaultValue={product.description}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      defaultValue={product.category}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="fashion">Fashion</option>
                      <option value="home-garden">Home & Garden</option>
                      <option value="sports">Sports & Outdoors</option>
                      <option value="books">Books & Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Condition *
                    </label>
                    <select
                      required
                      defaultValue={product.condition}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="new">New</option>
                      <option value="like-new">Like New</option>
                      <option value="used">Used - Good</option>
                      <option value="used-fair">Used - Fair</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pricing & Inventory
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={product.price}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product.originalPrice}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    defaultValue={product.stock}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </section>

            {/* Current Images */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {product.images?.map((image: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add more images or replace existing ones
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="product-images"
                />
                <label
                  htmlFor="product-images"
                  className="inline-block px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  Upload Images
                </label>
              </div>
            </section>

            {/* Additional Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Additional Details
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  defaultChecked={product.featured}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mark as Featured Product
                </label>
              </div>
            </section>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ml-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Delete Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
