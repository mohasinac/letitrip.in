"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Printer,
  Truck,
  ShoppingBag,
  CreditCard,
  Package,
  CheckCircle2,
  X,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  UnifiedCard,
  CardContent,
  UnifiedButton,
  UnifiedBadge,
  UnifiedModal,
  UnifiedAlert,
  UnifiedTextarea,
} from "@/components/ui/unified";
import { Timeline, TimelineEvent } from "@/components/ui/unified/Timeline";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

interface CouponSnapshot {
  code: string;
  name: string;
  type: string;
  value: number;
  discountAmount: number;
}

interface SaleSnapshot {
  name: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

interface Order {
  id: string;
  orderNumber: string;
  sellerId: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  couponDiscount: number;
  saleDiscount: number;
  shippingCharges: number;
  tax: number;
  total: number;
  couponSnapshot?: CouponSnapshot;
  saleSnapshot?: SaleSnapshot;
  notes?: string;
  internalNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  paidAt?: string;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const orderId = unwrappedParams.id;

  useBreadcrumbTracker([
    { label: "Orders", href: SELLER_ROUTES.ORDERS },
    { label: `Order #${orderId.slice(0, 8)}`, href: "", active: true },
  ]);
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    show: false,
    message: "",
    variant: "success",
  });

  // Get user role
  const userRole = user?.role || "seller";

  // Action dialogs
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Calculate if cancellation is allowed based on role and time
  const canCancelOrder = () => {
    if (!order) return false;
    
    // Admin can always cancel (no time limit)
    if (userRole === "admin") return true;
    
    // Cannot cancel if already delivered, cancelled, or rejected
    if (["delivered", "cancelled", "rejected"].includes(order.status)) {
      return false;
    }
    
    // For sellers, check 3-day limit from payment date
    if (userRole === "seller" && order.paymentStatus === "paid" && order.paidAt) {
      const paidAt = new Date(order.paidAt);
      const now = new Date();
      const daysSincePayment = (now.getTime() - paidAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSincePayment <= 3;
    }
    
    return true; // For unpaid orders, allow cancellation
  };

  const getCancellationTimeInfo = () => {
    if (!order || userRole === "admin") return null;
    
    if (order.paymentStatus === "paid" && order.paidAt) {
      const paidAt = new Date(order.paidAt);
      const now = new Date();
      const hoursRemaining = 72 - ((now.getTime() - paidAt.getTime()) / (1000 * 60 * 60));
      
      if (hoursRemaining <= 0) return "expired";
      if (hoursRemaining < 24) return `${Math.floor(hoursRemaining)} hours`;
      return `${Math.floor(hoursRemaining / 24)} days`;
    }
    
    return null;
  };

  // Fetch order details
  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = (await apiGet(`/api/seller/orders/${orderId}`)) as any;
      if (response.success) {
        setOrder(response.data);
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to fetch order details",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setAlert({
        show: true,
        message: "Failed to load order details",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate invoice
  const handleGenerateInvoice = async () => {
    try {
      setLoading(true);
      const response = (await apiPost(
        `/api/seller/orders/${orderId}/invoice`,
        {}
      )) as any;

      if (response.success) {
        const invoiceWindow = window.open("", "_blank");
        if (invoiceWindow) {
          invoiceWindow.document.write(response.data.invoiceHtml);
          invoiceWindow.document.close();
        }

        setAlert({
          show: true,
          message: `Invoice ${response.data.invoiceNumber} generated successfully!`,
          variant: "success",
        });
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to generate invoice",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      setAlert({
        show: true,
        message: "Failed to generate invoice",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve order
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = (await apiPost(
        `/api/seller/orders/${orderId}/approve`,
        {}
      )) as any;
      if (response.success) {
        setOrder(response.data);
        setApproveDialog(false);
        setAlert({
          show: true,
          message: "Order approved successfully!",
          variant: "success",
        });
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to approve order",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error approving order:", error);
      setAlert({
        show: true,
        message: "Failed to approve order",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject order
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setAlert({
        show: true,
        message: "Please provide a reason for rejection",
        variant: "error",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = (await apiPost(`/api/seller/orders/${orderId}/reject`, {
        reason: rejectionReason,
      })) as any;
      if (response.success) {
        setOrder(response.data);
        setRejectDialog(false);
        setRejectionReason("");
        setAlert({
          show: true,
          message: "Order rejected",
          variant: "info",
        });
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to reject order",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      setAlert({
        show: true,
        message: "Failed to reject order",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel order
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setAlert({
        show: true,
        message: "Please provide a reason for cancellation",
        variant: "error",
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = (await apiPost(`/api/seller/orders/${orderId}/cancel`, {
        reason: cancelReason,
      })) as any;
      if (response.success) {
        setOrder(response.data);
        setCancelDialog(false);
        setCancelReason("");
        setAlert({
          show: true,
          message: "Order cancelled",
          variant: "info",
        });
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to cancel order",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setAlert({
        show: true,
        message: "Failed to cancel order",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge variant
  const getStatusVariant = (
    status: string
  ): "success" | "error" | "warning" | "info" => {
    const variants: Record<string, "success" | "error" | "warning" | "info"> = {
      pending: "warning",
      processing: "info",
      approved: "success",
      rejected: "error",
      shipped: "info",
      delivered: "success",
      cancelled: "error",
      refunded: "warning",
    };
    return variants[status] || "info";
  };

  const getPaymentStatusVariant = (status: string) => {
    const variants: Record<string, "success" | "error" | "warning"> = {
      paid: "success",
      pending: "warning",
      failed: "error",
      refunded: "warning",
    };
    return variants[status] || "warning";
  };

  // Build timeline
  const buildTimeline = (): TimelineEvent[] => {
    if (!order) return [];

    const events: TimelineEvent[] = [];

    // Order placed
    events.push({
      title: "Order Placed",
      description: `Order #${order.orderNumber} was created`,
      timestamp: order.createdAt,
      icon: <ShoppingBag className="w-3 h-3" />,
      color: "primary",
    });

    // Payment
    if (order.paymentStatus === "paid") {
      events.push({
        title: "Payment Received",
        description: `Payment via ${order.paymentMethod}`,
        timestamp: order.createdAt,
        icon: <CreditCard className="w-3 h-3" />,
        color: "success",
      });
    } else {
      events.push({
        title: "Payment Pending",
        description: `Awaiting ${order.paymentMethod} payment`,
        timestamp: order.createdAt,
        icon: <CreditCard className="w-3 h-3" />,
        color: "warning",
      });
    }

    // Approved
    if (order.approvedAt) {
      events.push({
        title: "Order Approved",
        description: "Order approved and ready for processing",
        timestamp: order.approvedAt,
        icon: <CheckCircle className="w-3 h-3" />,
        color: "success",
      });
    }

    // Rejected
    if (order.rejectedAt) {
      events.push({
        title: "Order Rejected",
        description: order.rejectionReason || "Order was rejected",
        timestamp: order.rejectedAt,
        icon: <XCircle className="w-3 h-3" />,
        color: "error",
      });
    }

    // Shipped
    if (order.shippedAt) {
      events.push({
        title: "Order Shipped",
        description: "Order has been shipped",
        timestamp: order.shippedAt,
        icon: <Truck className="w-3 h-3" />,
        color: "info",
      });
    }

    // Delivered
    if (order.deliveredAt) {
      events.push({
        title: "Order Delivered",
        description: "Order successfully delivered",
        timestamp: order.deliveredAt,
        icon: <CheckCircle2 className="w-3 h-3" />,
        color: "success",
      });
    }

    // Cancelled
    if (order.cancelledAt) {
      events.push({
        title: "Order Cancelled",
        description: order.rejectionReason || "Order was cancelled",
        timestamp: order.cancelledAt,
        icon: <X className="w-3 h-3" />,
        color: "error",
      });
    }

    return events;
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!order) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-textSecondary mb-4">
              Order not found
            </h2>
            <Link href={SELLER_ROUTES.ORDERS}>
              <UnifiedButton variant="outline" icon={<ArrowLeft />}>
                Back to Orders
              </UnifiedButton>
            </Link>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const timeline = buildTimeline();

  return (
    <RoleGuard requiredRole="seller">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Alert */}
        {alert.show && (
          <div className="mb-6">
            <UnifiedAlert
              variant={alert.variant}
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </UnifiedAlert>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={SELLER_ROUTES.ORDERS}>
              <UnifiedButton variant="outline" size="sm" icon={<ArrowLeft />}>
                Back
              </UnifiedButton>
            </Link>
            <h1 className="text-3xl font-bold text-text">
              Order #{order.orderNumber}
            </h1>
            <UnifiedBadge variant={getStatusVariant(order.status)}>
              {order.status.toUpperCase()}
            </UnifiedBadge>
            <UnifiedBadge
              variant={getPaymentStatusVariant(order.paymentStatus)}
            >
              Payment: {order.paymentStatus.toUpperCase()}
            </UnifiedBadge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {order.status === "pending_approval" && (
              <>
                <UnifiedButton
                  variant="success"
                  icon={<CheckCircle />}
                  onClick={() => setApproveDialog(true)}
                  disabled={actionLoading}
                >
                  Approve Order
                </UnifiedButton>
                <UnifiedButton
                  variant="destructive"
                  icon={<XCircle />}
                  onClick={() => setRejectDialog(true)}
                  disabled={actionLoading}
                >
                  Reject Order
                </UnifiedButton>
              </>
            )}

            {order.status === "processing" && (
              <>
                <UnifiedButton
                  variant="primary"
                  icon={<Truck />}
                  onClick={() => {
                    setAlert({
                      show: true,
                      message: "Shipment feature coming soon!",
                      variant: "info",
                    });
                  }}
                >
                  Mark as Shipped
                </UnifiedButton>
                <UnifiedButton
                  variant="outline"
                  icon={<Package />}
                  onClick={() => {
                    window.open(
                      `/seller/shipments/create?orderId=${order.id}`,
                      "_blank"
                    );
                  }}
                >
                  Create Shipment
                </UnifiedButton>
              </>
            )}

            {order.status === "shipped" && (
              <UnifiedButton
                variant="success"
                icon={<CheckCircle2 />}
                onClick={() => {
                  setAlert({
                    show: true,
                    message: "Mark as delivered feature coming soon!",
                    variant: "info",
                  });
                }}
              >
                Mark as Delivered
              </UnifiedButton>
            )}

            {!["delivered", "cancelled", "rejected"].includes(order.status) && (
              <UnifiedButton
                variant="destructive"
                icon={<X />}
                onClick={() => setCancelDialog(true)}
                disabled={actionLoading}
              >
                Cancel Order
              </UnifiedButton>
            )}

            <UnifiedButton
              variant="outline"
              icon={<Printer />}
              onClick={handleGenerateInvoice}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </UnifiedButton>

            <UnifiedButton
              variant="outline"
              icon={<ShoppingBag />}
              onClick={() => {
                const packingSlipUrl = `/seller/orders/${order.id}/packing-slip`;
                window.open(packingSlipUrl, "_blank");
              }}
            >
              Packing Slip
            </UnifiedButton>

            {order.shippingAddress && (
              <UnifiedButton
                variant="outline"
                icon={<Truck />}
                onClick={() => {
                  const address = order.shippingAddress;
                  const addressString = `${address.addressLine1}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`;
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    addressString
                  )}`;
                  window.open(mapsUrl, "_blank");
                }}
              >
                View on Map
              </UnifiedButton>
            )}

            <UnifiedButton
              variant="outline"
              icon={<CreditCard />}
              onClick={() => {
                navigator.clipboard.writeText(order.orderNumber);
                setAlert({
                  show: true,
                  message: "Order number copied to clipboard!",
                  variant: "success",
                });
              }}
            >
              Copy Order #
            </UnifiedButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-xl font-semibold text-text mb-4">
                  Order Items
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-text">
                          Product
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-text">
                          SKU
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-text">
                          Price
                        </th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-text">
                          Qty
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-text">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b border-border">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-text">
                                  {item.name}
                                </p>
                                <p className="text-xs text-textSecondary">
                                  {item.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <p className="text-sm text-textSecondary">
                              {item.sku}
                            </p>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <p className="text-sm text-text">
                              ₹{item.price.toLocaleString()}
                            </p>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <p className="text-sm text-text">{item.quantity}</p>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <p className="text-sm font-semibold text-text">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </UnifiedCard>

            {/* Pricing Breakdown */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-xl font-semibold text-text mb-4">
                  Pricing Breakdown
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-text">Subtotal</span>
                    <span className="text-text">
                      ₹{order.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {order.couponDiscount > 0 && order.couponSnapshot && (
                    <div className="flex justify-between py-2 text-success">
                      <div>
                        <p className="text-success">Coupon Discount</p>
                        <p className="text-xs text-textSecondary">
                          {order.couponSnapshot.code} -{" "}
                          {order.couponSnapshot.name}
                        </p>
                      </div>
                      <span className="text-success">
                        -₹{order.couponDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {order.saleDiscount > 0 && order.saleSnapshot && (
                    <div className="flex justify-between py-2 text-success">
                      <div>
                        <p className="text-success">Sale Discount</p>
                        <p className="text-xs text-textSecondary">
                          {order.saleSnapshot.name}
                        </p>
                      </div>
                      <span className="text-success">
                        -₹{order.saleDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2">
                    <span className="text-text">Shipping Charges</span>
                    <span className="text-text">
                      {order.shippingCharges > 0
                        ? `₹${order.shippingCharges.toLocaleString()}`
                        : "FREE"}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-text">Tax</span>
                    <span className="text-text">
                      ₹{order.tax.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-border my-4"></div>

                  <div className="flex justify-between py-2">
                    <span className="text-xl font-bold text-text">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </UnifiedCard>

            {/* Timeline */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-xl font-semibold text-text mb-6">
                  Order Timeline
                </h2>
                <Timeline
                  events={timeline}
                  variant="default"
                  showTimestamps={true}
                  timestampPosition="alternate"
                />
              </CardContent>
            </UnifiedCard>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Customer Info */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-lg font-semibold text-text mb-3">
                  Customer Information
                </h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {order.customerEmail}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {order.customerPhone}
                  </p>
                </div>
              </CardContent>
            </UnifiedCard>

            {/* Shipping Address */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-lg font-semibold text-text mb-3">
                  Shipping Address
                </h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {order.shippingAddress.phone}
                  </p>
                  <p className="text-sm text-textSecondary mt-2">
                    {order.shippingAddress.addressLine1}
                  </p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-sm text-textSecondary">
                      {order.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-sm text-textSecondary">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {order.shippingAddress.country}
                  </p>
                </div>
              </CardContent>
            </UnifiedCard>

            {/* Billing Address */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-lg font-semibold text-text mb-3">
                  Billing Address
                </h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text">
                    {order.billingAddress.fullName}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {order.billingAddress.phone}
                  </p>
                  <p className="text-sm text-textSecondary mt-2">
                    {order.billingAddress.addressLine1}
                  </p>
                  {order.billingAddress.addressLine2 && (
                    <p className="text-sm text-textSecondary">
                      {order.billingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-sm text-textSecondary">
                    {order.billingAddress.city}, {order.billingAddress.state}{" "}
                    {order.billingAddress.pincode}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {order.billingAddress.country}
                  </p>
                </div>
              </CardContent>
            </UnifiedCard>

            {/* Notes */}
            {order.notes && (
              <UnifiedCard>
                <CardContent>
                  <h2 className="text-lg font-semibold text-text mb-3">
                    Order Notes
                  </h2>
                  <p className="text-sm text-textSecondary">{order.notes}</p>
                </CardContent>
              </UnifiedCard>
            )}

            {order.internalNotes && (
              <UnifiedCard>
                <CardContent>
                  <h2 className="text-lg font-semibold text-text mb-3">
                    Internal Notes
                  </h2>
                  <p className="text-sm text-textSecondary">
                    {order.internalNotes}
                  </p>
                </CardContent>
              </UnifiedCard>
            )}
          </div>
        </div>

        {/* Approve Dialog */}
        <UnifiedModal
          open={approveDialog}
          onClose={() => setApproveDialog(false)}
          title="Approve Order"
        >
          <div className="space-y-4">
            <p className="text-textSecondary">
              Are you sure you want to approve order #{order.orderNumber}? This
              will move the order to processing status.
            </p>
            <div className="flex justify-end gap-3">
              <UnifiedButton
                variant="outline"
                onClick={() => setApproveDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </UnifiedButton>
              <UnifiedButton
                variant="success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Approving..." : "Approve"}
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>

        {/* Reject Dialog */}
        <UnifiedModal
          open={rejectDialog}
          onClose={() => setRejectDialog(false)}
          title="Reject Order"
        >
          <div className="space-y-4">
            <p className="text-textSecondary">
              Please provide a reason for rejecting order #{order.orderNumber}
            </p>
            <UnifiedTextarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why you're rejecting this order..."
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <UnifiedButton
                variant="outline"
                onClick={() => setRejectDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </UnifiedButton>
              <UnifiedButton
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Reject Order"}
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>

        {/* Cancel Dialog */}
        <UnifiedModal
          open={cancelDialog}
          onClose={() => setCancelDialog(false)}
          title="Cancel Order"
        >
          <div className="space-y-4">
            <p className="text-textSecondary">
              Please provide a reason for cancelling order #{order.orderNumber}
            </p>
            <UnifiedTextarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Explain why you're cancelling this order..."
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <UnifiedButton
                variant="outline"
                onClick={() => setCancelDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </UnifiedButton>
              <UnifiedButton
                variant="destructive"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Cancel Order"}
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>
      </div>
    </RoleGuard>
  );
}
