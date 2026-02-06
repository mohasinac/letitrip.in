"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Card, Heading, Text, Button, Badge } from "@/components";
import UserTabs from "@/components/user/UserTabs";
import { useRouter, useParams } from "next/navigation";
import { THEME_CONSTANTS } from "@/constants/theme";
import { ROUTES } from "@/constants/routes";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
}

export default function OrderViewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  useEffect(() => {
    // TODO: Fetch order from Firebase
    // For now, show empty state
    setOrder(null);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>Loading...</Text>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-500";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-500";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-500";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-500";
    }
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
        <UserTabs />

        <div className={THEME_CONSTANTS.spacing.stack}>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.USER.ORDERS)}
            className="w-fit"
          >
            ← Back to Orders
          </Button>

          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <Heading level={4} className="mb-2">
                Order not found
              </Heading>
              <Text className="mb-6">
                The order you're looking for doesn't exist or has been removed.
              </Text>
              <Button onClick={() => router.push(ROUTES.USER.ORDERS)}>
                View All Orders
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
      <UserTabs />

      <div className={THEME_CONSTANTS.spacing.stack}>
        <Button
          variant="secondary"
          onClick={() => router.push(ROUTES.USER.ORDERS)}
          className="w-fit"
        >
          ← Back to Orders
        </Button>

        {/* Order Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Heading level={4}>Order #{order.orderNumber}</Heading>
              <Text className="text-sm mt-1">Placed on {order.date}</Text>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              {order.trackingNumber && (
                <Button variant="secondary" size="sm">
                  Track Order
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-6">
          <Heading level={5} className="mb-4">
            Order Items
          </Heading>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <Heading level={6}>{item.name}</Heading>
                  <Text className="text-sm mt-1">
                    Quantity: {item.quantity}
                  </Text>
                </div>
                <div className="text-right">
                  <Text className="font-semibold">
                    ₹{item.price.toFixed(2)}
                  </Text>
                  <Text className="text-sm">
                    ₹{(item.price / item.quantity).toFixed(2)} each
                  </Text>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between">
              <Text>Subtotal</Text>
              <Text>₹{order.subtotal.toFixed(2)}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Shipping</Text>
              <Text>₹{order.shipping.toFixed(2)}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Tax</Text>
              <Text>₹{order.tax.toFixed(2)}</Text>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <Text className="font-semibold text-lg">Total</Text>
              <Text className="font-semibold text-lg">
                ₹{order.total.toFixed(2)}
              </Text>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <Card className="p-6">
            <Heading level={5} className="mb-4">
              Shipping Address
            </Heading>
            <div className="space-y-1">
              <Text className="font-semibold">
                {order.shippingAddress.fullName}
              </Text>
              <Text>{order.shippingAddress.phoneNumber}</Text>
              <Text>{order.shippingAddress.addressLine1}</Text>
              {order.shippingAddress.addressLine2 && (
                <Text>{order.shippingAddress.addressLine2}</Text>
              )}
              <Text>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </Text>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-6">
            <Heading level={5} className="mb-4">
              Payment Information
            </Heading>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Payment Method</Text>
                <Text className="font-semibold">{order.paymentMethod}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Payment Status</Text>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500">
                  Paid
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
