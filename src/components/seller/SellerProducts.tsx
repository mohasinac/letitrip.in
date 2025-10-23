"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";

interface SellerProduct extends Product {
  views: number;
  orders: number;
  revenue: number;
}

export default function SellerProducts() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const response = await fetch('/api/seller/products?limit=6&sort=performance');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          // Mock data for development
          const mockProducts: SellerProduct[] = [
            {
              id: "1",
              name: "Beyblade Burst Turbo Achilles",
              slug: "beyblade-burst-turbo-achilles",
              description: "High-performance attack type Beyblade with burst resistance",
              price: 1999,
              compareAtPrice: 2499,
              cost: 1200,
              sku: "BEY001",
              quantity: 45,
              lowStockThreshold: 10,
              images: [
                {
                  url: "/images/beyblade1.jpg",
                  alt: "Beyblade Burst Turbo Achilles",
                  order: 0,
                }
              ],
              category: "Attack Type",
              tags: ["burst", "turbo", "attack"],
              status: "active",
              isFeatured: true,
              rating: 4.8,
              reviewCount: 124,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
              updatedAt: new Date().toISOString(),
              views: 2850,
              orders: 89,
              revenue: 177911,
            },
            {
              id: "2",
              name: "Stadium Pro Arena",
              slug: "stadium-pro-arena",
              description: "Professional grade Beyblade stadium with enhanced grip",
              price: 4999,
              compareAtPrice: 5999,
              cost: 3000,
              sku: "STA001",
              quantity: 12,
              lowStockThreshold: 5,
              images: [
                {
                  url: "/images/stadium1.jpg",
                  alt: "Stadium Pro Arena",
                  order: 0,
                }
              ],
              category: "Stadiums",
              tags: ["stadium", "pro", "arena"],
              status: "active",
              isFeatured: true,
              rating: 4.6,
              reviewCount: 67,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
              updatedAt: new Date().toISOString(),
              views: 1650,
              orders: 34,
              revenue: 169966,
            },
            {
              id: "3",
              name: "Launcher Grip Master",
              slug: "launcher-grip-master",
              description: "Ergonomic launcher grip for enhanced control",
              price: 899,
              compareAtPrice: 1199,
              cost: 450,
              sku: "LAU001",
              quantity: 78,
              lowStockThreshold: 15,
              images: [
                {
                  url: "/images/launcher1.jpg",
                  alt: "Launcher Grip Master",
                  order: 0,
                }
              ],
              category: "Launchers",
              tags: ["launcher", "grip", "control"],
              status: "active",
              isFeatured: false,
              rating: 4.4,
              reviewCount: 89,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
              updatedAt: new Date().toISOString(),
              views: 1200,
              orders: 67,
              revenue: 60233,
            },
          ];
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Failed to fetch seller products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerProducts();
  }, []);

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (quantity <= threshold) {
      return { text: 'Low Stock', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else {
      return { text: 'In Stock', color: 'text-green-600 bg-green-50 border-green-200' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Products</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Your Products</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Manage Products
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="mb-4">
                <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p>No products found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first product to start selling</p>
            </div>
          ) : (
            products.map((product) => {
              const stockStatus = getStockStatus(product.quantity, product.lowStockThreshold);
              const conversionRate = ((product.orders / product.views) * 100).toFixed(1);
              
              return (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium text-gray-900 ml-1">{formatCurrency(product.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <span className="font-medium text-gray-900 ml-1">{product.quantity} units</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Views:</span>
                          <span className="font-medium text-gray-900 ml-1">{product.views.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Orders:</span>
                          <span className="font-medium text-gray-900 ml-1">{product.orders}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="text-gray-500">Revenue:</span>
                            <span className="font-semibold text-green-600 ml-1">{formatCurrency(product.revenue)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Conversion:</span>
                            <span className="font-medium text-blue-600 ml-1">{conversionRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md transition-colors">
                      Edit Product
                    </button>
                    <button className="flex-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm px-3 py-2 rounded-md transition-colors">
                      View Analytics
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
