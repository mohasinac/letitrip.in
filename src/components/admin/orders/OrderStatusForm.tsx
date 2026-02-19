/**
 * OrderStatusForm
 * Path: src/components/admin/orders/OrderStatusForm.tsx
 *
 * Form for updating order status shown inside SideDrawer on admin orders page.
 */

"use client";

import { useState } from "react";
import { Select, Textarea, Input } from "@/components";
import { UI_LABELS } from "@/constants";
import type { OrderDocument, OrderStatus, PaymentStatus } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.ORDERS;

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export interface OrderStatusFormState {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber: string;
  notes: string;
  cancellationReason: string;
}

interface OrderStatusFormProps {
  order: OrderDocument;
  onChange: (state: OrderStatusFormState) => void;
}

export function OrderStatusForm({ order, onChange }: OrderStatusFormProps) {
  const [formState, setFormState] = useState<OrderStatusFormState>({
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber ?? "",
    notes: order.notes ?? "",
    cancellationReason: order.cancellationReason ?? "",
  });

  const handleChange = (field: keyof OrderStatusFormState, value: string) => {
    const updated = { ...formState, [field]: value };
    setFormState(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Read-only order info */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm">
        <p className="font-semibold text-gray-900 dark:text-white">
          Order: <span className="font-mono">{order.id}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {order.productTitle} × {order.quantity}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Customer: {order.userName} ({order.userEmail})
        </p>
        <p className="font-medium text-gray-900 dark:text-white">
          Total:{" "}
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: order.currency ?? "INR",
          }).format(order.totalPrice)}
        </p>
      </div>

      <Select
        label={UI_LABELS.ACTIONS.CONFIRM + " Status"}
        value={formState.status}
        onChange={(e) =>
          handleChange("status", (e.target as HTMLSelectElement).value)
        }
        options={ORDER_STATUS_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
      />

      <Select
        label="Payment Status"
        value={formState.paymentStatus}
        onChange={(e) =>
          handleChange("paymentStatus", (e.target as HTMLSelectElement).value)
        }
        options={PAYMENT_STATUS_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
      />

      <Input
        label={LABELS.TRACKING_NUMBER}
        value={formState.trackingNumber}
        onChange={(e) => handleChange("trackingNumber", e.target.value)}
        placeholder="Enter tracking number"
      />

      {formState.status === "cancelled" && (
        <Textarea
          label={LABELS.CANCELLATION_REASON}
          value={formState.cancellationReason}
          onChange={(e) => handleChange("cancellationReason", e.target.value)}
          placeholder="Reason for cancellation"
          rows={2}
        />
      )}

      <Textarea
        label={LABELS.NOTES}
        value={formState.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder="Internal notes (not visible to customer)"
        rows={3}
      />
    </div>
  );
}
