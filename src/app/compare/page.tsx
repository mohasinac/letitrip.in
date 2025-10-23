"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  rating: number;
  reviewCount: number;
  category: string;
  specifications: {
    [key: string]: string | number | boolean;
  };
  features: string[];
  availability: string;
  shipping: string;
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // Mock products data
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "iPhone 15 Pro",
        price: 999,
        originalPrice: 1099,
        image: "/api/placeholder/300/300",
        brand: "Apple",
        rating: 4.8,
        reviewCount: 2847,
        category: "Smartphones",
        specifications: {
          "Display Size": "6.1 inches",
          Storage: "128GB",
          RAM: "8GB",
          Camera: "48MP + 12MP + 12MP",
          Battery: "3274 mAh",
          OS: "iOS 17",
          Processor: "A17 Pro",
          "5G": true,
          "Wireless Charging": true,
          "Water Resistant": "IP68",
        },
        features: [
          "Action Button",
          "Titanium Design",
          "ProRAW Photography",
          "Cinematic Mode",
          "Face ID",
          "MagSafe Compatible",
        ],
        availability: "In Stock",
        shipping: "Free 2-day shipping",
      },
      {
        id: "2",
        name: "Samsung Galaxy S24 Ultra",
        price: 1199,
        image: "/api/placeholder/300/300",
        brand: "Samsung",
        rating: 4.6,
        reviewCount: 1923,
        category: "Smartphones",
        specifications: {
          "Display Size": "6.8 inches",
          Storage: "256GB",
          RAM: "12GB",
          Camera: "200MP + 50MP + 12MP + 10MP",
          Battery: "5000 mAh",
          OS: "Android 14",
          Processor: "Snapdragon 8 Gen 3",
          "5G": true,
          "Wireless Charging": true,
          "Water Resistant": "IP68",
        },
        features: [
          "S Pen Included",
          "AI Photo Enhancement",
          "8K Video Recording",
          "Ultra Wideband",
          "Samsung DeX",
          "Reverse Wireless Charging",
        ],
        availability: "In Stock",
        shipping: "Free shipping",
      },
      {
        id: "3",
        name: "Google Pixel 8 Pro",
        price: 899,
        originalPrice: 999,
        image: "/api/placeholder/300/300",
        brand: "Google",
        rating: 4.5,
        reviewCount: 1456,
        category: "Smartphones",
        specifications: {
          "Display Size": "6.7 inches",
          Storage: "128GB",
          RAM: "12GB",
          Camera: "50MP + 48MP + 48MP",
          Battery: "5050 mAh",
          OS: "Android 14",
          Processor: "Google Tensor G3",
          "5G": true,
          "Wireless Charging": true,
          "Water Resistant": "IP68",
        },
        features: [
          "Magic Eraser",
          "Real Tone",
          "Live Translate",
          "Call Screen",
          "Titan M Security",
          "Pure Android Experience",
        ],
        availability: "Limited Stock",
        shipping: "Free 3-day shipping",
      },
    ];

    // Get products from URL params
    const productIds = searchParams.get("products")?.split(",") || [];

    setTimeout(() => {
      setProducts(mockProducts);
      setSearchResults(mockProducts);

      // Set selected products based on URL params
      if (productIds.length > 0) {
        const preselected = mockProducts.filter((p) =>
          productIds.includes(p.id)
        );
        setSelectedProducts(preselected);
      }

      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleAddProduct = (product: Product) => {
    if (selectedProducts.length >= 4) {
      alert("You can compare up to 4 products at once");
      return;
    }

    if (!selectedProducts.find((p) => p.id === product.id)) {
      const newSelected = [...selectedProducts, product];
      setSelectedProducts(newSelected);

      // Update URL
      const productIds = newSelected.map((p) => p.id).join(",");
      router.push(`/compare?products=${productIds}`);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleRemoveProduct = (productId: string) => {
    const newSelected = selectedProducts.filter((p) => p.id !== productId);
    setSelectedProducts(newSelected);

    // Update URL
    if (newSelected.length > 0) {
      const productIds = newSelected.map((p) => p.id).join(",");
      router.push(`/compare?products=${productIds}`);
    } else {
      router.push("/compare");
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(products);
    }
  };

  // Get all specification keys for comparison table
  const allSpecKeys = Array.from(
    new Set(
      selectedProducts
        .map((product) => Object.keys(product.specifications))
        .flat()
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Comparison
          </h1>
          <p className="text-gray-600">
            Compare products side by side to make informed decisions
          </p>
        </div>

        {/* Add Products Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">
              Selected Products ({selectedProducts.length}/4)
            </h2>

            <div className="relative">
              {!showSearch ? (
                <button
                  onClick={() => setShowSearch(true)}
                  className="bg-primary text-white px-4 py-2 rounded-md transition-colors hover:bg-primary/90"
                  disabled={selectedProducts.length >= 4}
                >
                  Add Product to Compare
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Search Results Dropdown */}
              {showSearch && searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto z-10">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      disabled={selectedProducts.some(
                        (p) => p.id === product.id
                      )}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="px-4 py-3 text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Products Preview */}
          {selectedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative border border-gray-200 rounded-lg p-4"
                >
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-medium text-gray-900 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-primary font-semibold">${product.price}</p>
                </div>
              ))}
            </div>
          )}

          {selectedProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>Add products to start comparing</p>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedProducts.length >= 2 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10">
                      Compare
                    </th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} className="p-4 min-w-[250px]">
                        <div className="text-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-md mx-auto mb-3"
                          />
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {product.brand}
                          </p>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg font-bold text-primary">
                              ${product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Rating Row */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      Rating
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-sm text-gray-600">
                            ({product.reviewCount})
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Availability Row */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      Availability
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            product.availability === "In Stock"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.availability}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Shipping Row */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      Shipping
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center text-sm">
                        {product.shipping}
                      </td>
                    ))}
                  </tr>

                  {/* Specifications */}
                  {allSpecKeys.map((specKey) => (
                    <tr key={specKey} className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                        {specKey}
                      </td>
                      {selectedProducts.map((product) => (
                        <td
                          key={product.id}
                          className="p-4 text-center text-sm"
                        >
                          {product.specifications[specKey] !== undefined ? (
                            typeof product.specifications[specKey] ===
                            "boolean" ? (
                              product.specifications[specKey] ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )
                            ) : (
                              String(product.specifications[specKey])
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Features Row */}
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      Key Features
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">
                        <ul className="text-sm space-y-1">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <span className="text-green-500 mr-2">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr>
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      Actions
                    </td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">
                        <div className="space-y-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="block w-full bg-primary text-white text-center py-2 px-4 rounded-md transition-colors hover:bg-primary/90"
                          >
                            View Details
                          </Link>
                          <button className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md transition-colors hover:bg-gray-200">
                            Add to Cart
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Popular Comparisons */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular Comparisons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "iPhone vs Samsung",
                subtitle: "Flagship smartphones",
                products: "1,2",
              },
              {
                title: "Budget vs Premium",
                subtitle: "Value comparison",
                products: "1,3",
              },
              {
                title: "Android Flagships",
                subtitle: "Top Android phones",
                products: "2,3",
              },
            ].map((comparison, index) => (
              <Link
                key={index}
                href={`/compare?products=${comparison.products}`}
                className="block bg-white rounded-lg shadow-sm border p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {comparison.title}
                </h3>
                <p className="text-gray-600 text-sm">{comparison.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading comparison...</p>
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
