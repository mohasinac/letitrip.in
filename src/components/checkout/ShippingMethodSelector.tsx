"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Price } from "@letitrip/react-library";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@letitrip/react-library";

// Shipping Method Interface
export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  description: string;
  cost: number;
  estimatedDays: number;
  features: string[];
  cutoffTime?: string;
  available: boolean;
}

export interface ShippingMethodSelectorProps {
  value?: string | null;
  onChange: (methodId: string, method: ShippingMethod) => void;
  cartTotal: number;
  deliveryPincode: string;
  required?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export function ShippingMethodSelector({
  value,
  onChange,
  cartTotal,
  deliveryPincode,
  required = false,
  error,
  label = "Select Shipping Method",
  className = "",
}: ShippingMethodSelectorProps) {
  const {
    isLoading: loading,
    data: methods,
    setData: setMethods,
    execute,
  } = useLoadingState<ShippingMethod[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error as Error, {
        component: "ShippingMethodSelector.loadShippingMethods",
      });
      toast.error("Failed to load shipping methods");
    },
  });
  const [selectedId, setSelectedId] = useState<string | null>(value || null);

  useEffect(() => {
    loadShippingMethods();
  }, [deliveryPincode, cartTotal]);

  const loadShippingMethods = () =>
    execute(async () => {
      // TODO: Implement actual API call
      // const data = await shippingService.getAvailableMethods({
      //   pincode: deliveryPincode,
      //   cartTotal,
      // });

      // Mock data for now
      const mockMethods: ShippingMethod[] = [
        {
          id: "standard",
          name: "Standard Delivery",
          carrier: "India Post",
          description: "Regular shipping via postal service",
          cost: cartTotal >= 500 ? 0 : 40,
          estimatedDays: 7,
          features: ["Tracking available", "Signature on delivery"],
          available: true,
        },
        {
          id: "express",
          name: "Express Delivery",
          carrier: "Blue Dart",
          description: "Fast delivery within 2-3 days",
          cost: 120,
          estimatedDays: 3,
          features: [
            "Real-time tracking",
            "Signature on delivery",
            "Insurance included",
          ],
          cutoffTime: "3:00 PM",
          available: true,
        },
        {
          id: "same-day",
          name: "Same Day Delivery",
          carrier: "Dunzo",
          description: "Get it today if ordered before cutoff",
          cost: 200,
          estimatedDays: 0,
          features: [
            "Live tracking",
            "Contactless delivery",
            "Photo proof of delivery",
          ],
          cutoffTime: "12:00 PM",
          available: deliveryPincode.startsWith("560"), // Only in Bangalore
        },
        {
          id: "pickup",
          name: "Store Pickup",
          carrier: "Self",
          description: "Pick up from our store location",
          cost: 0,
          estimatedDays: 1,
          features: [
            "Free",
            "Flexible pickup hours",
            "ID verification required",
          ],
          available: true,
        },
      ];

      return mockMethods;
    }).then((loadedMethods) => {
      // Auto-select cheapest available method if none selected
      if (!selectedId && loadedMethods) {
        const available = loadedMethods.filter((m) => m.available);
        if (available.length > 0) {
          const cheapest = available.reduce((prev, current) =>
            current.cost < prev.cost ? current : prev,
          );
          setSelectedId(cheapest.id);
          onChange(cheapest.id, cheapest);
        }
      }
    });

  const handleMethodSelect = (method: ShippingMethod) => {
    if (!method.available) {
      toast.error("This shipping method is not available for your location");
      return;
    }

    setSelectedId(method.id);
    onChange(method.id, method);
  };

  const getDeliveryDateRange = (days: number): string => {
    if (days === 0) return "Today";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + days);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${startDate.toLocaleDateString(
      "en-IN",
      options,
    )} - ${endDate.toLocaleDateString("en-IN", options)}`;
  };

  const getCutoffWarning = (cutoffTime?: string): string | null => {
    if (!cutoffTime) return null;

    const now = new Date();
    const [hours, minutes] = cutoffTime.split(":").map(Number);
    const cutoff = new Date();
    cutoff.setHours(hours, minutes, 0);

    if (now > cutoff) {
      return "Order before tomorrow's cutoff for this delivery option";
    }

    const hoursLeft = Math.floor(
      (cutoff.getTime() - now.getTime()) / (1000 * 60 * 60),
    );
    if (hoursLeft <= 2) {
      return `Order within ${hoursLeft}h to get this delivery option`;
    }

    return null;
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading shipping methods...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Shipping Method Cards */}
      <div className="space-y-3">
        {(methods || []).map((method) => {
          const isSelected = selectedId === method.id;
          const cutoffWarning = getCutoffWarning(method.cutoffTime);

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleMethodSelect(method)}
              disabled={!method.available}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${!method.available ? "opacity-50 cursor-not-allowed" : ""}
                ${
                  isSelected
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }
                  `}
                  >
                    <Truck className="w-6 h-6" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {method.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.carrier}
                      </p>
                    </div>
                    <div className="text-right">
                      {method.cost === 0 ? (
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          FREE
                        </span>
                      ) : (
                        <Price
                          amount={method.cost}
                          className="text-lg font-bold"
                        />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {method.description}
                  </p>

                  {/* Delivery Estimate */}
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {method.estimatedDays === 0
                        ? "Delivery today"
                        : `Delivery by ${getDeliveryDateRange(
                            method.estimatedDays,
                          )}`}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {method.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Cutoff Warning */}
                  {cutoffWarning && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{cutoffWarning}</span>
                    </div>
                  )}

                  {/* Not Available Message */}
                  {!method.available && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Not available for your location</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Free Shipping Threshold */}
      {cartTotal < 500 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <Shield className="w-4 h-4 inline mr-1" />
            Add <Price amount={500 - cartTotal} /> more to cart for FREE
            Standard Delivery
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default ShippingMethodSelector;
