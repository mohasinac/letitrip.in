"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, Truck, MapPin } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api/seller";
import Link from "next/link";
import {
  UnifiedCard,
  CardContent,
  UnifiedButton,
  UnifiedBadge,
  UnifiedAlert,
} from "@/components/ui/unified";
import { Timeline, TimelineEvent } from "@/components/ui/unified/Timeline";

interface TrackingUpdate {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingUpdates: TrackingUpdate[];
  shippedAt: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const shipmentId = unwrappedParams.id;

  useBreadcrumbTracker([
    { label: "Shipments", href: SELLER_ROUTES.SHIPMENTS },
    {
      label: `Shipment #${shipmentId.slice(0, 8)}`,
      href: "",
      active: true,
    },
  ]);

  const { user } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    show: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    if (user) {
      fetchShipmentDetails();
    }
  }, [user, shipmentId]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const response = (await apiGet(
        `/api/seller/shipments/${shipmentId}`
      )) as any;
      if (response.success) {
        setShipment(response.data);
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to fetch shipment details",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching shipment:", error);
      setAlert({
        show: true,
        message: "Failed to load shipment details",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (
    status: string
  ): "success" | "error" | "warning" | "info" => {
    const variants: Record<string, "success" | "error" | "warning" | "info"> = {
      pending: "warning",
      in_transit: "info",
      out_for_delivery: "info",
      delivered: "success",
      failed: "error",
      returned: "warning",
    };
    return variants[status] || "info";
  };

  const getStatusColor = (
    status: string
  ): "primary" | "grey" | "success" | "error" | "warning" | "info" => {
    const colors: Record<
      string,
      "primary" | "grey" | "success" | "error" | "warning" | "info"
    > = {
      pending: "warning",
      picked_up: "info",
      in_transit: "primary",
      out_for_delivery: "info",
      delivered: "success",
      failed: "error",
      returned: "warning",
    };
    return colors[status] || "info";
  };

  const buildTimeline = (): TimelineEvent[] => {
    if (!shipment) return [];

    const events: TimelineEvent[] = shipment.trackingUpdates.map((update) => ({
      title: update.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      description: update.description,
      timestamp: update.timestamp,
      location: update.location,
      color: getStatusColor(update.status),
      icon: <Package className="w-3 h-3" />,
    }));

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

  if (!shipment) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-textSecondary mb-4">
              Shipment not found
            </h2>
            <Link href={SELLER_ROUTES.SHIPMENTS}>
              <UnifiedButton variant="outline" icon={<ArrowLeft />}>
                Back to Shipments
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
            <Link href={SELLER_ROUTES.SHIPMENTS}>
              <UnifiedButton variant="outline" size="sm" icon={<ArrowLeft />}>
                Back
              </UnifiedButton>
            </Link>
            <h1 className="text-3xl font-bold text-text">Shipment Tracking</h1>
            <UnifiedBadge variant={getStatusVariant(shipment.status)}>
              {shipment.status.replace(/_/g, " ").toUpperCase()}
            </UnifiedBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="lg:col-span-2">
            <UnifiedCard>
              <CardContent>
                <h2 className="text-xl font-semibold text-text mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking Timeline
                </h2>
                <Timeline
                  events={timeline}
                  variant="compact"
                  showTimestamps={true}
                />
              </CardContent>
            </UnifiedCard>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Tracking Information */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Tracking Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-textSecondary mb-1">
                      Tracking Number
                    </p>
                    <p className="text-sm font-mono font-semibold text-text">
                      {shipment.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Carrier</p>
                    <p className="text-sm font-medium text-text">
                      {shipment.carrier}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary mb-1">
                      Order Number
                    </p>
                    <Link
                      href={`${SELLER_ROUTES.ORDERS}/${shipment.orderId}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      #{shipment.orderNumber}
                    </Link>
                  </div>
                  {shipment.estimatedDelivery && (
                    <div>
                      <p className="text-xs text-textSecondary mb-1">
                        Estimated Delivery
                      </p>
                      <p className="text-sm font-medium text-text">
                        {new Date(
                          shipment.estimatedDelivery
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {shipment.actualDelivery && (
                    <div>
                      <p className="text-xs text-textSecondary mb-1">
                        Delivered On
                      </p>
                      <p className="text-sm font-medium text-success">
                        {new Date(shipment.actualDelivery).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </UnifiedCard>

            {/* Customer Information */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-lg font-semibold text-text mb-4">
                  Customer Information
                </h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text">
                    {shipment.customerName}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {shipment.customerPhone}
                  </p>
                </div>
              </CardContent>
            </UnifiedCard>

            {/* Shipping Address */}
            <UnifiedCard>
              <CardContent>
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text">
                    {shipment.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {shipment.shippingAddress.phone}
                  </p>
                  <p className="text-sm text-textSecondary mt-2">
                    {shipment.shippingAddress.addressLine1}
                  </p>
                  {shipment.shippingAddress.addressLine2 && (
                    <p className="text-sm text-textSecondary">
                      {shipment.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-sm text-textSecondary">
                    {shipment.shippingAddress.city},{" "}
                    {shipment.shippingAddress.state}{" "}
                    {shipment.shippingAddress.pincode}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {shipment.shippingAddress.country}
                  </p>
                </div>
              </CardContent>
            </UnifiedCard>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
