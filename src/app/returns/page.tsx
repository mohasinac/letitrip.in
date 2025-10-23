"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface ReturnRequest {
  id: string;
  orderId: string;
  orderDate: string;
  products: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    reason: string;
  }[];
  reason: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  requestDate: string;
  expectedRefund: number;
  trackingNumber?: string;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null
  );
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // Mock returns data
    const mockReturns: ReturnRequest[] = [
      {
        id: "RET001",
        orderId: "ORD001",
        orderDate: "2024-10-15",
        products: [
          {
            id: "1",
            name: "Wireless Bluetooth Headphones",
            image: "/api/placeholder/200/200",
            price: 79.99,
            quantity: 1,
            reason: "Defective item",
          },
        ],
        reason: "Defective item",
        description: "The left speaker stopped working after 2 days of use.",
        status: "approved",
        requestDate: "2024-10-18",
        expectedRefund: 79.99,
        trackingNumber: "RET12345678",
      },
      {
        id: "RET002",
        orderId: "ORD002",
        orderDate: "2024-10-10",
        products: [
          {
            id: "2",
            name: "Smart Fitness Watch",
            image: "/api/placeholder/200/200",
            price: 199.99,
            quantity: 1,
            reason: "Not as described",
          },
        ],
        reason: "Not as described",
        description:
          "The watch doesn't have the features mentioned in the description.",
        status: "processing",
        requestDate: "2024-10-20",
        expectedRefund: 199.99,
      },
      {
        id: "RET003",
        orderId: "ORD003",
        orderDate: "2024-10-05",
        products: [
          {
            id: "3",
            name: "Portable Phone Charger",
            image: "/api/placeholder/200/200",
            price: 29.99,
            quantity: 2,
            reason: "Changed mind",
          },
        ],
        reason: "Changed mind",
        description: "I found a better alternative and no longer need these.",
        status: "pending",
        requestDate: "2024-10-22",
        expectedRefund: 59.98,
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setReturns(mockReturns);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredReturns = returns.filter((returnItem) => {
    if (filter === "all") return true;
    return returnItem.status === filter;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (showRequestForm) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex items-center mb-8">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Request Return
                </h1>
              </div>

              {/* Return Request Form */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your order number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Return
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="defective">Defective item</option>
                      <option value="wrong-item">Wrong item received</option>
                      <option value="not-as-described">Not as described</option>
                      <option value="changed-mind">Changed mind</option>
                      <option value="damaged">Arrived damaged</option>
                      <option value="quality">Quality issues</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please provide more details about the issue..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="photos"
                      />
                      <label
                        htmlFor="photos"
                        className="cursor-pointer text-primary hover:text-primary/80"
                      >
                        Click to upload photos or drag and drop
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG up to 10MB each
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-md transition-colors hover:bg-primary/90"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Returns & Refunds
              </h1>
              <p className="text-gray-600 mt-1">Manage your return requests</p>
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="mt-4 sm:mt-0 bg-primary text-white px-4 py-2 rounded-md transition-colors hover:bg-primary/90"
            >
              Request Return
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Returns" },
                { key: "pending", label: "Pending" },
                { key: "approved", label: "Approved" },
                { key: "processing", label: "Processing" },
                { key: "completed", label: "Completed" },
                { key: "rejected", label: "Rejected" },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Returns List */}
          {filteredReturns.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Returns Found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't made any return requests yet.
                </p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-primary text-white px-6 py-2 rounded-md transition-colors hover:bg-primary/90"
                >
                  Request Return
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns.map((returnItem) => (
                <div
                  key={returnItem.id}
                  className="bg-white rounded-lg shadow-sm border"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Return #{returnItem.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order #{returnItem.orderId} • Requested on{" "}
                              {new Date(
                                returnItem.requestDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              returnItem.status
                            )}`}
                          >
                            {returnItem.status.charAt(0).toUpperCase() +
                              returnItem.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Reason
                            </p>
                            <p className="text-sm text-gray-600">
                              {returnItem.reason}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Expected Refund
                            </p>
                            <p className="text-sm text-gray-600">
                              ${returnItem.expectedRefund.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {returnItem.description && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                              Description
                            </p>
                            <p className="text-sm text-gray-600">
                              {returnItem.description}
                            </p>
                          </div>
                        )}

                        {returnItem.trackingNumber && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                              Return Tracking
                            </p>
                            <p className="text-sm text-primary font-medium">
                              {returnItem.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <button
                          onClick={() => setSelectedReturn(returnItem)}
                          className="w-full lg:w-auto bg-gray-100 text-gray-700 px-4 py-2 rounded-md transition-colors hover:bg-gray-200"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Returned Items
                      </h4>
                      <div className="space-y-3">
                        {returnItem.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center space-x-4"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {product.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Quantity: {product.quantity} • $
                                {product.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Return Policy Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Return Policy</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Returns are accepted within 30 days of delivery</p>
              <p>• Items must be in original condition with tags attached</p>
              <p>
                • Refunds are processed within 5-7 business days after we
                receive your return
              </p>
              <p>• Return shipping is free for defective or incorrect items</p>
              <p>• Customer pays return shipping for other reasons</p>
            </div>
            <Link
              href="/help"
              className="inline-block mt-3 text-blue-600 hover:text-blue-800 font-medium"
            >
              View Full Return Policy →
            </Link>
          </div>
        </div>

        {/* Return Details Modal */}
        {selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Return Details #{selectedReturn.id}
                  </h2>
                  <button
                    onClick={() => setSelectedReturn(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Order Number
                      </p>
                      <p className="text-lg">{selectedReturn.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Status
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedReturn.status
                        )}`}
                      >
                        {selectedReturn.status.charAt(0).toUpperCase() +
                          selectedReturn.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Request Date
                      </p>
                      <p className="text-lg">
                        {new Date(
                          selectedReturn.requestDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Expected Refund
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        ${selectedReturn.expectedRefund.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Reason for Return
                    </p>
                    <p className="text-gray-900">{selectedReturn.reason}</p>
                  </div>

                  {selectedReturn.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Description
                      </p>
                      <p className="text-gray-900">
                        {selectedReturn.description}
                      </p>
                    </div>
                  )}

                  {selectedReturn.trackingNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Return Tracking Number
                      </p>
                      <p className="text-primary font-medium">
                        {selectedReturn.trackingNumber}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Items to Return
                    </p>
                    <div className="space-y-3">
                      {selectedReturn.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {product.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Quantity: {product.quantity} • $
                              {product.price.toFixed(2)} each
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: $
                              {(product.quantity * product.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedReturn(null)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
