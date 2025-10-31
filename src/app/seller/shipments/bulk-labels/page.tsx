"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle,
  Truck,
  Loader2,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { useSearchParams } from "next/navigation";

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
  createdAt: string;
}

export default function BulkShippingLabelPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Shipments", href: "/seller/shipments" },
    { label: "Bulk Labels", href: "/seller/shipments/bulk-labels" },
  ]);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [manifestHtml, setManifestHtml] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
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
        setShipments(response.data || []);
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

  const toggleShipment = (shipmentId: string) => {
    setSelectedShipments((prev) =>
      prev.includes(shipmentId)
        ? prev.filter((id) => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const toggleAll = () => {
    if (selectedShipments.length === shipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(shipments.map((s) => s.id));
    }
  };

  const generateManifest = async () => {
    if (selectedShipments.length === 0) {
      setError("Please select at least one shipment");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response: any = await apiPost(
        "/api/seller/shipments/bulk-manifest",
        {
          shipmentIds: selectedShipments,
        }
      );

      if (response.success) {
        setManifestHtml(response.data.manifestHtml);
        setPreviewOpen(true);
      } else {
        setError(response.error || "Failed to generate manifest");
      }
    } catch (error: any) {
      console.error("Error generating manifest:", error);
      setError(error.message || "Failed to generate manifest");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(manifestHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([manifestHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipping-manifest-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([manifestHtml], { type: "text/html" });
        const file = new File([blob], `shipping-manifest-${Date.now()}.html`, {
          type: "text/html",
        });
        await navigator.share({
          title: "Shipping Manifest",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(manifestHtml);
      alert("Manifest HTML copied to clipboard!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "in_transit":
      case "out_for_delivery":
        return "info";
      case "pending":
      case "pickup_scheduled":
        return "warning";
      case "failed":
      case "returned":
        return "error";
      default:
        return "default";
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
            Bulk Shipping Labels & Manifest
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select multiple shipments to generate a combined manifest
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
            <button
              onClick={toggleAll}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {selectedShipments.length === shipments.length && (
                <CheckCircle className="h-5 w-5" />
              )}
              {selectedShipments.length === shipments.length
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
              {selectedShipments.length} / {shipments.length} selected
            </span>

            <button
              onClick={generateManifest}
              disabled={selectedShipments.length === 0 || generating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Truck className="h-5 w-5" />
              {generating ? "Generating..." : "Generate Manifest"}
            </button>
          </div>
        </div>

        {/* Shipments List */}
        {shipments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No shipments available
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Shipments will appear here once orders are ready to ship
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                onClick={() => toggleShipment(shipment.id)}
                className={`bg-white dark:bg-gray-900 rounded-lg border cursor-pointer transition-colors p-6 ${
                  selectedShipments.includes(shipment.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedShipments.includes(shipment.id)}
                    onChange={() => toggleShipment(shipment.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {shipment.trackingNumber || "No tracking"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order: {shipment.orderId} • {shipment.carrier}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      To: {shipment.toAddress?.name}, {shipment.toAddress?.city}
                      , {shipment.toAddress?.state}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
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
                    {shipment.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
                onClick={() => setPreviewOpen(false)}
              />

              <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                {/* Dialog Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Shipping Manifest Preview
                  </h2>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Dialog Content */}
                <div className="px-6 py-4 max-h-[700px] overflow-y-auto border-b border-gray-200 dark:border-gray-800">
                  <iframe
                    srcDoc={manifestHtml}
                    style={{
                      width: "100%",
                      height: "700px",
                      border: "none",
                    }}
                    title="Manifest Preview"
                  />
                </div>

                {/* Dialog Actions */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                    Share
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download HTML
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Printer className="h-5 w-5" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
