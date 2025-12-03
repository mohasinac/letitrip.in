"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { FormSelect, FormInput, FormTextarea } from "@/components/forms";
import { ordersService } from "@/services/orders.service";
import type { OrderFE } from "@/types/frontend/order.types";
import { OrderStatus } from "@/types/shared/common.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { notFound } from "@/lib/error-redirects";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = (params.id as string) || "";
  const [order, setOrder] = useState<OrderFE | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Status update
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [internalNotes, setInternalNotes] = useState("");

  // Shipment
  const [showShipmentDialog, setShowShipmentDialog] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingProvider, setShippingProvider] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  // Cancel
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to load order:", err);
      router.push(notFound.order(orderId, err));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order) return;

    try {
      setSaving(true);
      const updated = await ordersService.updateStatus(
        order.id,
        newStatus,
        internalNotes || undefined,
      );
      setOrder(updated);
      setShowStatusDialog(false);
      setNewStatus(OrderStatus.PENDING);
      setInternalNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!order) return;

    if (!trackingNumber.trim() || !shippingProvider.trim()) {
      toast.error("Please provide tracking number and shipping provider");
      return;
    }

    try {
      setSaving(true);
      const updated = await ordersService.createShipment(
        order.id,
        trackingNumber.trim(),
        shippingProvider.trim(),
        estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      );
      setOrder(updated);
      setShowShipmentDialog(false);
      setTrackingNumber("");
      setShippingProvider("");
      setEstimatedDelivery("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create shipment");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (!cancelReason.trim()) {
      toast.error("Please provide cancellation reason");
      return;
    }

    try {
      setSaving(true);
      const updated = await ordersService.cancel(order.id, cancelReason.trim());
      setOrder(updated);
      setShowCancelDialog(false);
      setCancelReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      const blob = await ordersService.downloadInvoice(order.id);
      const url = globalThis.URL?.createObjectURL(blob) || "";
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      globalThis.URL?.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      toast.error(err.message || "Failed to download invoice");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Order not found</p>
          <button
            onClick={() => router.push("/admin/orders")}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const canUpdateStatus = !["cancelled", "delivered", "refunded"].includes(
    order.status,
  );
  const canShip = order.status === "confirmed" || order.status === "processing";
  const canCancel = !["shipped", "delivered", "cancelled", "refunded"].includes(
    order.status,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/orders")}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Download Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Status
              </h2>
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={order.status}
                  className={getStatusColor(order.status)}
                />
                <StatusBadge
                  status={order.paymentStatus}
                  className={getPaymentStatusColor(order.paymentStatus)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {canUpdateStatus && (
                <button
                  onClick={() => {
                    setNewStatus(order.status);
                    setShowStatusDialog(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update Status
                </button>
              )}
              {canShip && !order.trackingNumber && (
                <button
                  onClick={() => setShowShipmentDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Shipment
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Tracking Information
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Provider</p>
                    <p className="font-medium text-gray-900">
                      {order.shippingProvider || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tracking Number</p>
                    <p className="font-medium text-gray-900">
                      {order.trackingNumber}
                    </p>
                  </div>
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-gray-600">Estimated Delivery</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div>
                      <p className="text-gray-600">Delivered At</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(order.deliveredAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="relative w-20 h-20">
                    <OptimizedImage
                      src={item.productImage || "/placeholder.png"}
                      alt={item.productName}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/admin/products/${item.productId}/edit`}
                      className="font-medium text-gray-900 hover:text-purple-600"
                    >
                      {item.productName}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-600 mt-1">
                        Variant: {item.variant}
                      </p>
                    )}
                    {item.sku && (
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {item.sku}
                      </p>
                    )}
                    <Link
                      href={`/admin/shops/${item.shopId}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                      {item.shopName}
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {formatCurrency(order.shipping || order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">
                  {formatCurrency(order.tax)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(order.customerNotes || order.internalNotes) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Notes
              </h2>
              {order.customerNotes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Customer Notes
                  </p>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    {order.customerNotes}
                  </p>
                </div>
              )}
              {order.internalNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                  </p>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                    {order.internalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Customer ID</p>
                <p className="font-medium text-gray-900">{order.customerId}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.name}
              </p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-gray-600">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-gray-600">{order.shippingAddress.line2}</p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Billing Address
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-medium text-gray-900">
                  {order.billingAddress.name}
                </p>
                <p className="text-gray-600">{order.billingAddress.phone}</p>
                <p className="text-gray-600">{order.billingAddress.line1}</p>
                {order.billingAddress.line2 && (
                  <p className="text-gray-600">{order.billingAddress.line2}</p>
                )}
                <p className="text-gray-600">
                  {order.billingAddress.city}, {order.billingAddress.state}{" "}
                  {order.billingAddress.pincode}
                </p>
                <p className="text-gray-600">{order.billingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="font-medium text-gray-900 uppercase">
                  {order.paymentMethod}
                </p>
              </div>
              {order.paymentId && (
                <div>
                  <p className="text-gray-600">Payment ID</p>
                  <p className="font-mono text-xs text-gray-900">
                    {order.paymentId}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Payment Status</p>
                <StatusBadge
                  status={order.paymentStatus}
                  className={getPaymentStatusColor(order.paymentStatus)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Dialog */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={handleStatusUpdate}
        title="Update Order Status"
        confirmLabel="Update Status"
        cancelLabel="Cancel"
        isLoading={saving}
      >
        <div className="space-y-4">
          <FormSelect
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            options={[
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
              { value: "refunded", label: "Refunded" },
            ]}
          />
          <FormTextarea
            label="Internal Notes (Optional)"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder="Add any internal notes about this status change..."
          />
        </div>
      </ConfirmDialog>

      {/* Create Shipment Dialog */}
      <ConfirmDialog
        isOpen={showShipmentDialog}
        onClose={() => setShowShipmentDialog(false)}
        onConfirm={handleCreateShipment}
        title="Create Shipment"
        confirmLabel="Create Shipment"
        cancelLabel="Cancel"
        isLoading={saving}
      >
        <div className="space-y-4">
          <FormInput
            label="Tracking Number"
            required
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
          />
          <FormInput
            label="Shipping Provider"
            required
            value={shippingProvider}
            onChange={(e) => setShippingProvider(e.target.value)}
            placeholder="e.g., India Post, Delhivery, Blue Dart"
          />
          <FormInput
            label="Estimated Delivery (Optional)"
            type="date"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
          />
        </div>
      </ConfirmDialog>

      {/* Cancel Order Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        confirmLabel="Cancel Order"
        cancelLabel="Back"
        isLoading={saving}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </p>
          <FormTextarea
            label="Cancellation Reason"
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Explain why this order is being cancelled..."
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
