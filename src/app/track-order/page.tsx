"use client";

import { useState } from "react";
import Link from "next/link";

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
}

interface OrderTracking {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string;
  currentLocation: string;
  events: TrackingEvent[];
  orderDetails: {
    orderDate: string;
    totalAmount: number;
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
    items: {
      id: string;
      name: string;
      image: string;
      price: number;
      quantity: number;
    }[];
  };
}

export default function TrackOrderPage() {
  const [trackingInput, setTrackingInput] = useState("");
  const [orderTracking, setOrderTracking] = useState<OrderTracking | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingInput.trim()) {
      setError("Please enter an order number or tracking number");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      // Mock tracking data
      const mockTracking: OrderTracking = {
        orderId: "ORD-2024-10001",
        trackingNumber: "TRK1234567890",
        carrier: "FastShip Express",
        status: "In Transit",
        estimatedDelivery: "2024-10-25",
        currentLocation: "Distribution Center - Chicago, IL",
        events: [
          {
            id: "1",
            status: "Order Placed",
            description: "Your order has been received and is being processed",
            location: "Online Store",
            timestamp: "2024-10-20T10:00:00Z",
            isCompleted: true,
          },
          {
            id: "2",
            status: "Order Confirmed",
            description: "Payment confirmed and order details validated",
            location: "Order Processing Center",
            timestamp: "2024-10-20T11:30:00Z",
            isCompleted: true,
          },
          {
            id: "3",
            status: "Preparing for Shipment",
            description: "Items are being picked and packed for shipment",
            location: "Fulfillment Center - Los Angeles, CA",
            timestamp: "2024-10-21T08:15:00Z",
            isCompleted: true,
          },
          {
            id: "4",
            status: "Shipped",
            description: "Package has been dispatched and is on its way",
            location: "Fulfillment Center - Los Angeles, CA",
            timestamp: "2024-10-21T16:45:00Z",
            isCompleted: true,
          },
          {
            id: "5",
            status: "In Transit",
            description: "Package is currently in transit to destination",
            location: "Distribution Center - Chicago, IL",
            timestamp: "2024-10-23T14:20:00Z",
            isCompleted: true,
          },
          {
            id: "6",
            status: "Out for Delivery",
            description: "Package is out for delivery and will arrive today",
            location: "Local Delivery Hub",
            timestamp: "",
            isCompleted: false,
          },
          {
            id: "7",
            status: "Delivered",
            description: "Package has been successfully delivered",
            location: "Customer Address",
            timestamp: "",
            isCompleted: false,
          },
        ],
        orderDetails: {
          orderDate: "2024-10-20",
          totalAmount: 1248.97,
          shippingAddress: {
            name: "John Doe",
            address: "123 Main Street, Apt 4B",
            city: "New York",
            state: "NY",
            zipCode: "10001",
          },
          items: [
            {
              id: "1",
              name: "iPhone 15 Pro",
              image: "/api/placeholder/80/80",
              price: 999.0,
              quantity: 1,
            },
            {
              id: "2",
              name: "AirPods Pro (2nd Gen)",
              image: "/api/placeholder/80/80",
              price: 249.0,
              quantity: 1,
            },
          ],
        },
      };

      // Check if input matches expected format
      if (
        trackingInput.toLowerCase().includes("ord") ||
        trackingInput.toLowerCase().includes("trk")
      ) {
        setOrderTracking(mockTracking);
      } else {
        setError(
          "Order not found. Please check your order number or tracking number."
        );
      }

      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "Order Placed": "bg-blue-500",
      "Order Confirmed": "bg-green-500",
      "Preparing for Shipment": "bg-yellow-500",
      Shipped: "bg-purple-500",
      "In Transit": "bg-orange-500",
      "Out for Delivery": "bg-red-500",
      Delivered: "bg-green-600",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your order number or tracking number to get real-time updates
          </p>
        </div>

        {/* Tracking Form */}
        <div className="max-w-md mx-auto mb-12">
          <form
            onSubmit={handleTrackOrder}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="mb-4">
              <label
                htmlFor="tracking"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Order Number or Tracking Number
              </label>
              <input
                type="text"
                id="tracking"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g., ORD-2024-10001 or TRK1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Tracking...
                </>
              ) : (
                "Track Order"
              )}
            </button>
          </form>

          {/* Quick Demo */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Try these demo numbers:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setTrackingInput("ORD-2024-10001")}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                ORD-2024-10001
              </button>
              <button
                onClick={() => setTrackingInput("TRK1234567890")}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                TRK1234567890
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Results */}
        {orderTracking && (
          <div className="max-w-4xl mx-auto">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order #{orderTracking.orderId}
                  </h2>
                  <p className="text-gray-600">
                    Placed on{" "}
                    {new Date(
                      orderTracking.orderDetails.orderDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 lg:text-right">
                  <div className="text-sm text-gray-600 mb-1">
                    Current Status
                  </div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-white font-medium ${getStatusColor(
                      orderTracking.status
                    )}`}
                  >
                    {orderTracking.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Tracking Number
                  </h3>
                  <p className="text-primary font-mono">
                    {orderTracking.trackingNumber}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Carrier</h3>
                  <p className="text-gray-700">{orderTracking.carrier}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Estimated Delivery
                  </h3>
                  <p className="text-gray-700">
                    {new Date(
                      orderTracking.estimatedDelivery
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Tracking Timeline
              </h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                  {orderTracking.events.map((event, index) => (
                    <div key={event.id} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          event.isCompleted
                            ? "bg-green-500 border-green-500"
                            : index ===
                              orderTracking.events.findIndex(
                                (e) => !e.isCompleted
                              )
                            ? "bg-primary border-primary animate-pulse"
                            : "bg-gray-200 border-gray-300"
                        }`}
                      >
                        {event.isCompleted ? (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index ===
                              orderTracking.events.findIndex(
                                (e) => !e.isCompleted
                              )
                                ? "bg-white"
                                : "bg-gray-400"
                            }`}
                          ></div>
                        )}
                      </div>

                      {/* Event content */}
                      <div className="ml-6 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h4
                              className={`font-semibold ${
                                event.isCompleted
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }`}
                            >
                              {event.status}
                            </h4>
                            <p
                              className={`text-sm ${
                                event.isCompleted
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {event.description}
                            </p>
                            <p
                              className={`text-sm ${
                                event.isCompleted
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {event.location}
                            </p>
                          </div>

                          {event.timestamp && (
                            <div
                              className={`mt-2 md:mt-0 text-sm ${
                                event.isCompleted
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {formatDate(event.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Items Ordered */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Items Ordered
                </h3>
                <div className="space-y-4">
                  {orderTracking.orderDetails.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Total Amount
                    </span>
                    <span className="font-bold text-xl text-primary">
                      ${orderTracking.orderDetails.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Shipping Address
                </h3>
                <div className="text-gray-700">
                  <p className="font-medium">
                    {orderTracking.orderDetails.shippingAddress.name}
                  </p>
                  <p>{orderTracking.orderDetails.shippingAddress.address}</p>
                  <p>
                    {orderTracking.orderDetails.shippingAddress.city},{" "}
                    {orderTracking.orderDetails.shippingAddress.state}{" "}
                    {orderTracking.orderDetails.shippingAddress.zipCode}
                  </p>
                </div>

                {/* Current Location */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Current Location
                  </h4>
                  <p className="text-blue-800">
                    {orderTracking.currentLocation}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <Link
                    href={`/orders/${orderTracking.orderId}`}
                    className="block w-full bg-primary text-white text-center py-2 px-4 rounded-md transition-colors hover:bg-primary/90"
                  >
                    View Full Order Details
                  </Link>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md transition-colors hover:bg-gray-200">
                    Contact Customer Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📞</div>
              <h3 className="font-semibold text-blue-900 mb-1">Call Us</h3>
              <p className="text-blue-800 text-sm">1-800-SUPPORT</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-blue-900 mb-1">Live Chat</h3>
              <p className="text-blue-800 text-sm">Available 24/7</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-semibold text-blue-900 mb-1">Email</h3>
              <p className="text-blue-800 text-sm">support@store.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
