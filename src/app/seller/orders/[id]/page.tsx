"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { ordersService } from "@/services/orders.service";
import { notFound } from "@/lib/error-redirects";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingData, setShippingData] = useState({
    trackingNumber: "",
    shippingProvider: "",
    estimatedDelivery: "",
  });

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data: any = await ordersService.getById(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error("Failed to load order:", error);
      router.push(notFound.order(orderId, error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      setUpdating(true);
      await ordersService.updateStatus(orderId, status);
      await loadOrder();
    } catch (error: any) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await ordersService.createShipment(
        orderId,
        shippingData.trackingNumber,
        shippingData.shippingProvider,
        shippingData.estimatedDelivery
          ? new Date(shippingData.estimatedDelivery)
          : undefined
      );
      setShowShippingForm(false);
      setShippingData({
        trackingNumber: "",
        shippingProvider: "",
        estimatedDelivery: "",
      });
      await loadOrder();
    } catch (error: any) {
      console.error("Failed to add shipping:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const blob = await ordersService.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order?.orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to download invoice:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <AuthGuard requireAuth allowedRoles={["seller"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard requireAuth allowedRoles={["seller"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <button
              onClick={() => router.push("/seller/orders")}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/seller/orders")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.orderNumber || order.id}
                </h1>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                    >
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.productName}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600">
                            Variant: {item.variant}
                          </p>
                        )}
                        {item.sku && (
                          <p className="text-sm text-gray-500">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  {order.couponCode && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Coupon: {order.couponCode}</span>
                      <span>-{formatCurrency(order.couponDiscount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {order.trackingNumber && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold font-mono">
                        {order.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shipping Provider</p>
                      <p className="font-semibold">{order.shippingProvider}</p>
                    </div>
                    {order.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Estimated Delivery
                        </p>
                        <p className="font-semibold">
                          {new Date(
                            order.estimatedDelivery
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div>
                        <p className="text-sm text-gray-600">Delivered On</p>
                        <p className="font-semibold">
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              {order.customerNotes && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Customer Notes
                  </h2>
                  <p className="text-gray-700">{order.customerNotes}</p>
                </div>
              )}

              {/* Internal Notes */}
              {order.internalNotes && (
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-800">
                    <FileText className="w-5 h-5 mr-2" />
                    Internal Notes
                  </h2>
                  <p className="text-yellow-900">{order.internalNotes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Customer</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-sm break-all">
                      {order.customerEmail || "N/A"}
                    </span>
                  </div>
                  {order.shippingAddress?.phone && (
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-sm">
                        {order.shippingAddress.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                <div className="text-gray-700 space-y-1">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p className="text-sm">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && (
                    <p className="text-sm">{order.shippingAddress.line2}</p>
                  )}
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="text-sm">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-sm mt-2">
                      Phone: {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium uppercase">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.paymentId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment ID</span>
                      <span className="font-mono text-xs">
                        {order.paymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <div className="space-y-3">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus("processing")}
                      disabled={updating}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      Start Processing
                    </button>
                  )}

                  {order.status === "processing" && !order.trackingNumber && (
                    <button
                      onClick={() => setShowShippingForm(!showShippingForm)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Truck className="w-5 h-5 mr-2" />
                      Add Shipping Info
                    </button>
                  )}

                  {order.status === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus("delivered")}
                      disabled={updating}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Mark as Delivered
                    </button>
                  )}

                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Invoice
                  </button>

                  {order.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus("cancelled")}
                      disabled={updating}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Shipping Form */}
              {showShippingForm && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Add Shipping Information
                  </h2>
                  <form onSubmit={handleAddShipping} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number *
                      </label>
                      <input
                        type="text"
                        value={shippingData.trackingNumber}
                        onChange={(e) =>
                          setShippingData((prev) => ({
                            ...prev,
                            trackingNumber: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter tracking number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Provider *
                      </label>
                      <select
                        value={shippingData.shippingProvider}
                        onChange={(e) =>
                          setShippingData((prev) => ({
                            ...prev,
                            shippingProvider: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select provider</option>
                        <option value="BlueDart">BlueDart</option>
                        <option value="Delhivery">Delhivery</option>
                        <option value="DTDC">DTDC</option>
                        <option value="FedEx">FedEx</option>
                        <option value="India Post">India Post</option>
                        <option value="Professional Courier">
                          Professional Courier
                        </option>
                        <option value="Trackon">Trackon</option>
                        <option value="Xpressbees">Xpressbees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Delivery
                      </label>
                      <input
                        type="date"
                        value={shippingData.estimatedDelivery}
                        onChange={(e) =>
                          setShippingData((prev) => ({
                            ...prev,
                            estimatedDelivery: e.target.value,
                          }))
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? "Adding..." : "Add Shipping"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowShippingForm(false)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
