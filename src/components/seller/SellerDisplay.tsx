"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface SellerInfo {
  id: string;
  name: string;
  storeName?: string;
  storeStatus: "live" | "maintenance" | "offline";
  businessName?: string;
  isVerified?: boolean;
}

interface SellerDisplayProps {
  className?: string;
}

export default function SellerDisplay({ className = "" }: SellerDisplayProps) {
  const { user } = useAuth();
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellerInfo();
  }, [user?.id]);

  const loadSellerInfo = async () => {
    if (!user?.id || !user.getIdToken) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/seller/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSellerInfo(data);
      }
    } catch (error) {
      console.error("Failed to load seller info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "text-green-600";
      case "maintenance":
        return "text-yellow-600";
      case "offline":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "maintenance":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case "offline":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <BuildingStorefrontIcon className="w-4 h-4" />;
    }
  };

  const getDisplayName = (seller: SellerInfo) => {
    return seller.storeName || seller.businessName || seller.name;
  };

  if (loading) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}
      >
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div
        className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center space-x-2 text-yellow-800">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm">
            Please set up your store information in Settings before creating
            products.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {getDisplayName(sellerInfo).charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-900">
              {getDisplayName(sellerInfo)}
            </h4>
            {sellerInfo.isVerified && (
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`flex items-center space-x-1 text-xs ${getStatusColor(
                sellerInfo.storeStatus
              )}`}
            >
              {getStatusIcon(sellerInfo.storeStatus)}
              <span className="capitalize">{sellerInfo.storeStatus}</span>
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">
              Products will be listed under this store
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
