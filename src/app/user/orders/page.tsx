"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/services/orders.service";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import type { Order } from "@/types";

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.list(filters);
      setOrders(data.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      sortable: true,
      render: (order: any) => (
        <button
          onClick={() => router.push(`/user/orders/${order.id}`)}
          className="font-medium text-primary hover:underline"
        >
          #{order.orderId}
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (order: any) =>
        new Date(order.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "shopName",
      label: "Shop",
      render: (order: any) => order.shopName || "N/A",
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (order: any) => `₹${order.total.toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (order: any) => <StatusBadge status={order.status} />,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (order: any) => <StatusBadge status={order.paymentStatus} />,
    },
  ];

  if (!user) {
    router.push("/login?redirect=/user/orders");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders found"
              description="You haven't placed any orders yet"
              action={{
                label: "Start Shopping",
                onClick: () => router.push("/"),
              }}
            />
          ) : (
            <DataTable
              data={orders}
              columns={columns}
              keyExtractor={(order) => order.id}
              isLoading={loading}
              onRowClick={(order: any) =>
                router.push(`/user/orders/${order.id}`)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
