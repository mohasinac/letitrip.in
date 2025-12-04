"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import OptimizedImage from "@/components/common/OptimizedImage";
import { DateDisplay, Price } from "@/components/common/values";
import { FormInput, FormSelect } from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";
import { notFound } from "@/lib/error-redirects";
import { logError } from "@/lib/firebase-error-logger";
import { ordersService } from "@/services/orders.service";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const {
    data: order,
    isLoading,
    execute,
  } = useLoadingState<any>({
    initialData: null,
  });
  const [updating, setUpdating] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingData, setShippingData] = useState({
    trackingNumber: "",
    shippingProvider: "",
    estimatedDelivery: "",
  });

  const loadOrder = useCallback(async () => {
    try {
      const data: any = await ordersService.getById(orderId);
      return data;
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerOrderDetail.loadOrder",
        metadata: { orderId },
      });
      router.push(notFound.order(orderId, error));
      return null;
    }
  }, [orderId, router]);

  useEffect(() => {
    execute(loadOrder);
  }, [execute, loadOrder]);

  const handleUpdateStatus = async (status: string) => {
    try {
      setUpdating(true);
      await ordersService.updateStatus(orderId, status);
      await execute(loadOrder);
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerOrderDetail.handleUpdateStatus",
        metadata: { orderId, status },
      });
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
      await execute(loadOrder);
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerOrderDetail.handleAddShipping",
        metadata: { orderId, shippingData },
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const blob = await ordersService.downloadInvoice(orderId);
      const url = globalThis.URL?.createObjectURL(blob) || "";
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order?.orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      globalThis.URL?.revokeObjectURL(url);
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerOrderDetail.handleDownloadInvoice",
        metadata: { orderId },
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth allowedRoles={["seller"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard requireAuth allowedRoles={["seller"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The order you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <button
              onClick={() => router.push("/seller/orders")}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/seller/orders")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Order #{order.orderNumber || order.id}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Placed on <DateDisplay date={order.createdAt} includeTime />
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      {item.productImage && (
                        <div className="relative w-20 h-20">
                          <OptimizedImage
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Variant: {item.variant}
                          </p>
                        )}
                        {item.sku && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <Price amount={item.price} /> × {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total: <Price amount={item.total} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>
                      <Price amount={order.subtotal} />
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>
                        -<Price amount={order.discount} />
                      </span>
                    </div>
                  )}
                  {order.couponCode && (
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-500">
                      <span>Coupon: {order.couponCode}</span>
                      <span>
                        -<Price amount={order.couponDiscount || 0} />
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>
                      <Price amount={order.shipping} />
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>
                      <Price amount={order.tax} />
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>
                      <Price amount={order.total} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {order.trackingNumber && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tracking Number
                      </p>
                      <p className="font-semibold font-mono text-gray-900 dark:text-white">
                        {order.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Shipping Provider
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.shippingProvider}
                      </p>
                    </div>
                    {order.estimatedDelivery && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Estimated Delivery
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <DateDisplay
                            date={order.estimatedDelivery}
                            format="medium"
                          />
                        </p>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Delivered On
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <DateDisplay
                            date={order.deliveredAt}
                            format="medium"
                          />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              {order.customerNotes && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Customer Notes
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {order.customerNotes}
                  </p>
                </div>
              )}

              {/* Internal Notes */}
              {order.internalNotes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-800 dark:text-yellow-200">
                    <FileText className="w-5 h-5 mr-2" />
                    Internal Notes
                  </h2>
                  <p className="text-yellow-900 dark:text-yellow-100">
                    {order.internalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Customer
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Mail className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm break-all">
                      {order.customerEmail || "N/A"}
                    </span>
                  </div>
                  {order.shippingAddress?.phone && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Phone className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm">
                        {order.shippingAddress.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                <div className="text-gray-700 dark:text-gray-300 space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.shippingAddress.name}
                  </p>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Method
                    </span>
                    <span className="font-medium uppercase text-gray-900 dark:text-white">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600 dark:text-green-400"
                          : order.paymentStatus === "failed"
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.paymentId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Payment ID
                      </span>
                      <span className="font-mono text-xs text-gray-900 dark:text-white">
                        {order.paymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Actions
                </h2>
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Add Shipping Information
                  </h2>
                  <form onSubmit={handleAddShipping} className="space-y-4">
                    <FormInput
                      id="order-tracking-number"
                      label="Tracking Number"
                      required
                      value={shippingData.trackingNumber}
                      onChange={(e) =>
                        setShippingData((prev) => ({
                          ...prev,
                          trackingNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter tracking number"
                    />

                    <FormSelect
                      id="order-shipping-provider"
                      label="Shipping Provider"
                      required
                      value={shippingData.shippingProvider}
                      onChange={(e) =>
                        setShippingData((prev) => ({
                          ...prev,
                          shippingProvider: e.target.value,
                        }))
                      }
                      placeholder="Select provider"
                      options={[
                        { value: "BlueDart", label: "BlueDart" },
                        { value: "Delhivery", label: "Delhivery" },
                        { value: "DTDC", label: "DTDC" },
                        { value: "FedEx", label: "FedEx" },
                        { value: "India Post", label: "India Post" },
                        {
                          value: "Professional Courier",
                          label: "Professional Courier",
                        },
                        { value: "Trackon", label: "Trackon" },
                        { value: "Xpressbees", label: "Xpressbees" },
                      ]}
                    />

                    <FormInput
                      id="order-estimated-delivery"
                      label="Estimated Delivery"
                      type="date"
                      value={shippingData.estimatedDelivery}
                      onChange={(e) =>
                        setShippingData((prev) => ({
                          ...prev,
                          estimatedDelivery: e.target.value,
                        }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />

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
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
