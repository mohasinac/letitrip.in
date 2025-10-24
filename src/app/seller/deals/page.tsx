"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import DashboardNavigation from "@/components/layout/DashboardNavigation";
import SellerSidebar from "@/components/seller/SellerSidebar";

interface Deal {
  id: string;
  title: string;
  description: string;
  productId: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired" | "scheduled";
  maxQuantity?: number;
  currentSales: number;
  image: string;
  isFlashDeal: boolean;
  isFeatured: boolean;
}

export default function SellerDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch("/api/seller/deals");
        if (response.ok) {
          const data = await response.json();
          setDeals(data);
        } else {
          setDeals([]);
        }
      } catch (error) {
        console.error("Failed to fetch deals:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="min-h-screen bg-gray-50">
          <DashboardNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="seller">
      <div className="min-h-screen bg-gray-50">
        <DashboardNavigation />

        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Deals & Offers
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create and manage special offers for your products
                </p>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg transition-colors hover:bg-primary/90">
                Create New Deal
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border p-6">
                <SellerSidebar />
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Your Deals
                </h3>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No deals created yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first deal to boost sales and attract customers
                  </p>
                  <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                    Create Your First Deal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
