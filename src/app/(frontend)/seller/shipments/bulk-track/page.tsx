"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  Truck,
  Search,
  MapPin,
  Loader2,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiGet } from "@/lib/api/seller";
import { useSearchParams } from "next/navigation";

interface TrackingEvent {
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  toAddress: {
    name: string;
    city: string;
    state: string;
  };
  trackingHistory: TrackingEvent[];
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export default function BulkTrackingPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Shipments", href: "/seller/shipments" },
    { label: "Track Multiple", href: "/seller/shipments/bulk-track" },
  ]);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchShipments();
      // Pre-select shipments from URL params
      const ids = searchParams?.get("ids");
      if (ids) {
        setSelectedShipments(ids.split(","));
      }
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet("/api/seller/shipments?status=all");
      if (response.success) {
        // Filter shipments that are trackable (not pending or cancelled)
        const trackableShipments = (response.data || []).filter(
          (s: Shipment) =>
            !["pending", "cancelled"].includes(s.status) && s.trackingNumber
        );
        setShipments(trackableShipments);
      } else {
        setError(response.error || "Failed to fetch shipments");
      }
    } catch (error: any) {
      console.error("Error fetching shipments:", error);
      setError(error.message || "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    if (selectedShipments.length === 0) {
      setError("Please select at least one shipment to track");
      return;
    }

    try {
      setRefreshing(true);
      setError("");

      // Refresh tracking for selected shipments
      const refreshPromises = selectedShipments.map((shipmentId) =>
        apiGet(`/api/seller/shipments/${shipmentId}`)
      );

      const responses = await Promise.all(refreshPromises);

      // Update shipments with fresh data
      const updatedShipments = shipments.map((shipment) => {
        const response: any = responses.find(
          (r: any) => r.success && r.data?.id === shipment.id
        );
        return response ? response.data : shipment;
      });

      setShipments(updatedShipments);
    } catch (error: any) {
      console.error("Error refreshing tracking:", error);
      setError(error.message || "Failed to refresh tracking");
    } finally {
      setRefreshing(false);
    }
  };

  const toggleShipment = (shipmentId: string) => {
    setSelectedShipments((prev) =>
      prev.includes(shipmentId)
        ? prev.filter((id) => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const toggleAll = () => {
    if (selectedShipments.length === filteredShipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(filteredShipments.map((s) => s.id));
    }
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.trackingNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shipment.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.toAddress?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "in_transit":
      case "out_for_delivery":
        return "info";
      case "pickup_scheduled":
        return "warning";
      case "failed":
      case "returned":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "in_transit":
      case "out_for_delivery":
        return <Truck className="h-4 w-4" />;
      case "pickup_scheduled":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="container mx-auto px-4 max-w-7xl py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="seller">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Track Multiple Shipments
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor and refresh tracking status for multiple shipments at once
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracking number, order ID, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={toggleAll}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {selectedShipments.length === filteredShipments.length && (
                <CheckCircle className="h-5 w-5" />
              )}
              {selectedShipments.length === filteredShipments.length
                ? "Deselect All"
                : "Select All"}
            </button>

            <div className="flex-1" />

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedShipments.length > 0
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
            >
              {selectedShipments.length} / {filteredShipments.length} selected
            </span>

            <button
              onClick={refreshTracking}
              disabled={selectedShipments.length === 0 || refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              {refreshing ? "Refreshing..." : "Refresh Tracking"}
            </button>
          </div>
        </div>

        {/* Shipments List */}
        {filteredShipments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery
                ? "No matching shipments found"
                : "No trackable shipments"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try a different search term"
                : "Shipments with tracking numbers will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredShipments
              .filter(
                (s) =>
                  selectedShipments.includes(s.id) ||
                  selectedShipments.length === 0
              )
              .map((shipment) => (
                <div
                  key={shipment.id}
                  className={`bg-white dark:bg-gray-900 rounded-lg border p-6 ${
                    selectedShipments.includes(shipment.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <input
                      type="checkbox"
                      checked={selectedShipments.includes(shipment.id)}
                      onChange={() => toggleShipment(shipment.id)}
                      className="h-5 w-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {shipment.trackingNumber}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase ${
                            getStatusColor(shipment.status) === "success"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                              : getStatusColor(shipment.status) === "info"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                              : getStatusColor(shipment.status) === "warning"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                              : getStatusColor(shipment.status) === "error"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {getStatusIcon(shipment.status)}
                          {shipment.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Order: {shipment.orderId} • {shipment.carrier}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To: {shipment.toAddress?.name},{" "}
                        {shipment.toAddress?.city}, {shipment.toAddress?.state}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800 my-4" />

                  {/* Tracking Timeline */}
                  {shipment.trackingHistory &&
                  shipment.trackingHistory.length > 0 ? (
                    <div className="space-y-4">
                      {shipment.trackingHistory
                        .slice()
                        .reverse()
                        .map((event, index) => (
                          <div key={index} className="flex gap-4">
                            {/* Timeline Dot */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0
                                    ? "bg-blue-600"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              />
                              {index < shipment.trackingHistory.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-1" />
                              )}
                            </div>

                            {/* Timeline Content */}
                            <div className="flex-1 pb-4">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <p
                                  className={`text-sm ${
                                    index === 0
                                      ? "font-bold text-gray-900 dark:text-white"
                                      : "font-medium text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {event.status
                                    .replace(/_/g, " ")
                                    .toUpperCase()}
                                </p>
                                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                  <p>
                                    {new Date(
                                      event.timestamp
                                    ).toLocaleDateString()}
                                  </p>
                                  <p>
                                    {new Date(
                                      event.timestamp
                                    ).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              {event.location && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  📍 {event.location}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                      No tracking history available
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
