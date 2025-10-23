"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  productCount: number;
  category: string;
  featured: boolean;
  established?: string;
  website?: string;
  popularProducts: {
    id: string;
    name: string;
    image: string;
    price: number;
  }[];
}

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    // Mock brands data
    const mockBrands: Brand[] = [
      {
        id: "apple",
        name: "Apple",
        logo: "/api/placeholder/100/100",
        description:
          "Innovative technology products that enhance everyday life",
        productCount: 124,
        category: "Electronics",
        featured: true,
        established: "1976",
        website: "apple.com",
        popularProducts: [
          {
            id: "1",
            name: "iPhone 15 Pro",
            image: "/api/placeholder/150/150",
            price: 999,
          },
          {
            id: "2",
            name: "MacBook Air M3",
            image: "/api/placeholder/150/150",
            price: 1199,
          },
          {
            id: "3",
            name: "AirPods Pro",
            image: "/api/placeholder/150/150",
            price: 249,
          },
        ],
      },
      {
        id: "samsung",
        name: "Samsung",
        logo: "/api/placeholder/100/100",
        description:
          "Leading technology company creating connected experiences",
        productCount: 287,
        category: "Electronics",
        featured: true,
        established: "1938",
        website: "samsung.com",
        popularProducts: [
          {
            id: "4",
            name: "Galaxy S24 Ultra",
            image: "/api/placeholder/150/150",
            price: 1199,
          },
          {
            id: "5",
            name: 'QLED 65" TV',
            image: "/api/placeholder/150/150",
            price: 1499,
          },
          {
            id: "6",
            name: "Galaxy Buds Pro",
            image: "/api/placeholder/150/150",
            price: 199,
          },
        ],
      },
      {
        id: "nike",
        name: "Nike",
        logo: "/api/placeholder/100/100",
        description: "Just Do It - Athletic footwear, apparel and equipment",
        productCount: 456,
        category: "Sports & Outdoors",
        featured: true,
        established: "1964",
        website: "nike.com",
        popularProducts: [
          {
            id: "7",
            name: "Air Max 270",
            image: "/api/placeholder/150/150",
            price: 149,
          },
          {
            id: "8",
            name: "Dri-FIT Shirt",
            image: "/api/placeholder/150/150",
            price: 45,
          },
          {
            id: "9",
            name: "Air Jordan 1",
            image: "/api/placeholder/150/150",
            price: 179,
          },
        ],
      },
      {
        id: "sony",
        name: "Sony",
        logo: "/api/placeholder/100/100",
        description: "Entertainment and technology innovation for everyone",
        productCount: 198,
        category: "Electronics",
        featured: false,
        established: "1946",
        website: "sony.com",
        popularProducts: [
          {
            id: "10",
            name: "WH-1000XM5",
            image: "/api/placeholder/150/150",
            price: 399,
          },
          {
            id: "11",
            name: "PlayStation 5",
            image: "/api/placeholder/150/150",
            price: 499,
          },
          {
            id: "12",
            name: "Alpha A7R V",
            image: "/api/placeholder/150/150",
            price: 3899,
          },
        ],
      },
      {
        id: "adidas",
        name: "Adidas",
        logo: "/api/placeholder/100/100",
        description: "Impossible is Nothing - Sports and lifestyle brand",
        productCount: 342,
        category: "Sports & Outdoors",
        featured: false,
        established: "1949",
        website: "adidas.com",
        popularProducts: [
          {
            id: "13",
            name: "Ultra Boost 22",
            image: "/api/placeholder/150/150",
            price: 189,
          },
          {
            id: "14",
            name: "Essentials Hoodie",
            image: "/api/placeholder/150/150",
            price: 65,
          },
          {
            id: "15",
            name: "Stan Smith",
            image: "/api/placeholder/150/150",
            price: 89,
          },
        ],
      },
      {
        id: "levi",
        name: "Levi's",
        logo: "/api/placeholder/100/100",
        description: "Original. Authentic. American. Quality denim since 1853",
        productCount: 234,
        category: "Fashion & Apparel",
        featured: false,
        established: "1853",
        website: "levi.com",
        popularProducts: [
          {
            id: "16",
            name: "501 Original Jeans",
            image: "/api/placeholder/150/150",
            price: 89,
          },
          {
            id: "17",
            name: "Trucker Jacket",
            image: "/api/placeholder/150/150",
            price: 98,
          },
          {
            id: "18",
            name: "Vintage T-Shirt",
            image: "/api/placeholder/150/150",
            price: 29,
          },
        ],
      },
      {
        id: "microsoft",
        name: "Microsoft",
        logo: "/api/placeholder/100/100",
        description: "Empowering every person and organization on the planet",
        productCount: 89,
        category: "Electronics",
        featured: false,
        established: "1975",
        website: "microsoft.com",
        popularProducts: [
          {
            id: "19",
            name: "Surface Pro 9",
            image: "/api/placeholder/150/150",
            price: 999,
          },
          {
            id: "20",
            name: "Xbox Series X",
            image: "/api/placeholder/150/150",
            price: 499,
          },
          {
            id: "21",
            name: "Surface Headphones",
            image: "/api/placeholder/150/150",
            price: 249,
          },
        ],
      },
      {
        id: "canon",
        name: "Canon",
        logo: "/api/placeholder/100/100",
        description: "Imaging excellence for professional and personal use",
        productCount: 156,
        category: "Electronics",
        featured: false,
        established: "1937",
        website: "canon.com",
        popularProducts: [
          {
            id: "22",
            name: "EOS R6 Mark II",
            image: "/api/placeholder/150/150",
            price: 2499,
          },
          {
            id: "23",
            name: "RF 24-70mm",
            image: "/api/placeholder/150/150",
            price: 1299,
          },
          {
            id: "24",
            name: "PIXMA Printer",
            image: "/api/placeholder/150/150",
            price: 129,
          },
        ],
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setBrands(mockBrands);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = Array.from(new Set(brands.map((brand) => brand.category)));

  const filteredAndSortedBrands = brands
    .filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || brand.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "products":
          return b.productCount - a.productCount;
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

  const featuredBrands = brands.filter((brand) => brand.featured);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Brand
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your favorite brands and explore their latest products
          </p>
        </div>

        {/* Featured Brands */}
        {featuredBrands.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Brands
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.id}`}
                  className="group bg-white rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-lg hover:scale-105"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="w-16 h-16 object-contain rounded-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {brand.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {brand.productCount} products
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {brand.description}
                    </p>

                    {/* Popular Products Preview */}
                    <div className="grid grid-cols-3 gap-2">
                      {brand.popularProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="text-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-16 object-cover rounded-md mb-1"
                          />
                          <p className="text-xs text-gray-600 truncate">
                            {product.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">Sort by Name</option>
                <option value="products">Sort by Product Count</option>
                <option value="featured">Sort by Featured</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedBrands.length} of {brands.length} brands
          </div>
        </div>

        {/* Brands Grid */}
        {filteredAndSortedBrands.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No brands found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Brand Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      {brand.featured && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-white rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {brand.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{brand.productCount} products</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {brand.category}
                    </span>
                  </div>
                </div>

                {/* Popular Products */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Popular Products
                  </h4>
                  <div className="space-y-2">
                    {brand.popularProducts.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-primary font-medium">
                            ${product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Link
                    href={`/brands/${brand.id}`}
                    className="block w-full bg-primary text-white text-center py-2 px-4 rounded-md transition-colors hover:bg-primary/90"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Browse by Category */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryBrandCount = brands.filter(
                (brand) => brand.category === category
              ).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-6 rounded-lg border text-center transition-all hover:shadow-md ${
                    selectedCategory === category
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-900 border-gray-200 hover:border-primary"
                  }`}
                >
                  <h3 className="font-semibold mb-1">{category}</h3>
                  <p
                    className={`text-sm ${
                      selectedCategory === category
                        ? "text-white/80"
                        : "text-gray-600"
                    }`}
                  >
                    {categoryBrandCount} brands
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Statistics */}
        <div className="mt-16 bg-gradient-to-r from-primary to-primary/80 rounded-lg text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Discover Amazing Brands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">{brands.length}+</div>
              <div className="text-white/80">Trusted Brands</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {brands
                  .reduce((sum, brand) => sum + brand.productCount, 0)
                  .toLocaleString()}
                +
              </div>
              <div className="text-white/80">Products Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{categories.length}</div>
              <div className="text-white/80">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
