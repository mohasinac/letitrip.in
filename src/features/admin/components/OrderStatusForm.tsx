/**
 * OrderStatusForm
 * Path: src/components/admin/orders/OrderStatusForm.tsx
 *
 * Form for updating order status shown inside SideDrawer on admin orders page.
 */
import { Input, Select } from "@mohasinac/appkit/ui";
import { Textarea } from "@mohasinac/appkit/ui";
import { useState } from "react";
import { Span, Text } from "@mohasinac/appkit/ui";
import { FormGroup } from "@mohasinac/appkit/ui";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { OrderDocument, OrderStatus, PaymentStatus } from "@/db/schema";
import { formatCurrency } from "@mohasinac/appkit/utils";


"use client";

const LABELS = UI_LABELS.ADMIN.ORDERS;

const { spacing, themed } = THEME_CONSTANTS;

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
    <div className={spacing.stack}>
      {/* Read-only order info */}
      <div
        className={`rounded-lg border ${THEME_CONSTANTS.themed.border} p-4 space-y-2 text-sm`}
      >
        <Text weight="semibold">
          Order: <Span className="font-mono">{order.id}</Span>
        </Text>
        <Text variant="secondary">
          {order.productTitle} � {order.quantity}
        </Text>
        <Text variant="secondary">
          Customer: {order.userName} ({order.userEmail})
        </Text>
        <Text weight="medium">
          Total:{" "}
          {formatCurrency(order.totalPrice, order.currency ?? "INR")}
        </Text>
      </div>

      <FormGroup columns={2}>
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
      </FormGroup>

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

