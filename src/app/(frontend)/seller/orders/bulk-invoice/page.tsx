"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiGet, apiPost } from "@/lib/api/seller";
import { useSearchParams } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function BulkInvoicePage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Orders", href: "/seller/orders" },
    { label: "Bulk Invoice", href: "/seller/orders/bulk-invoice" },
  ]);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchOrders();
      // Pre-select orders from URL params
      const ids = searchParams?.get("ids");
      if (ids) {
        setSelectedOrders(ids.split(","));
      }
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet("/api/seller/orders?status=all");
      if (response.success) {
        // Filter orders that can have invoices (approved, processing, shipped, delivered, completed)
        const eligibleOrders = (response.data || []).filter((order: Order) =>
          [
            "approved",
            "processing",
            "shipped",
            "delivered",
            "completed",
          ].includes(order.status)
        );
        setOrders(eligibleOrders);
      } else {
        setError(response.error || "Failed to fetch orders");
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const generateBulkInvoices = async () => {
    if (selectedOrders.length === 0) {
      setError("Please select at least one order");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      // Generate invoices for each selected order
      const invoicePromises = selectedOrders.map((orderId) =>
        apiPost(`/api/seller/orders/${orderId}/invoice`, {})
      );

      const responses = await Promise.all(invoicePromises);

      // Combine all invoice HTML
      const combinedHtml = responses
        .filter((res: any) => res.success)
        .map((res: any) => res.data.invoiceHtml)
        .join('<div style="page-break-after: always;"></div>');

      if (combinedHtml) {
        setInvoiceHtml(combinedHtml);
        setPreviewOpen(true);
      } else {
        setError("Failed to generate invoices");
      }
    } catch (error: any) {
      console.error("Error generating invoices:", error);
      setError(error.message || "Failed to generate invoices");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([invoiceHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([invoiceHtml], { type: "text/html" });
        const file = new File([blob], `invoices-${Date.now()}.html`, {
          type: "text/html",
        });
        await navigator.share({
          title: "Invoices",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(invoiceHtml);
      alert("Invoice HTML copied to clipboard!");
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
            Bulk Invoice Generator
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select multiple orders to generate invoices together
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
              {selectedOrders.length === orders.length && (
                <CheckCircle className="h-5 w-5" />
              )}
              {selectedOrders.length === orders.length
                ? "Deselect All"
                : "Select All"}
            </button>

            <div className="flex-1" />

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedOrders.length > 0
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
            >
              {selectedOrders.length} / {orders.length} selected
            </span>

            <button
              onClick={generateBulkInvoices}
              disabled={selectedOrders.length === 0 || generating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Printer className="h-5 w-5" />
              {generating ? "Generating..." : "Generate Invoices"}
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No orders available
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Orders that are approved or completed will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => toggleOrder(order.id)}
                className={`bg-white dark:bg-gray-900 rounded-lg border cursor-pointer transition-colors p-6 ${
                  selectedOrders.includes(order.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleOrder(order.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customerName} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                      order.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : order.status === "delivered"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {order.status}
                  </span>

                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{order.total.toFixed(2)}
                  </p>
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

              <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                {/* Dialog Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Invoice Preview
                  </h2>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Dialog Content */}
                <div className="px-6 py-4 max-h-[600px] overflow-y-auto border-b border-gray-200 dark:border-gray-800">
                  <iframe
                    srcDoc={invoiceHtml}
                    style={{
                      width: "100%",
                      height: "600px",
                      border: "none",
                    }}
                    title="Invoice Preview"
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
