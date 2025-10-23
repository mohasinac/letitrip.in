"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";

interface RecentOrdersData {
  orders: Order[];
  loading: boolean;
}

export default function RecentOrders() {
  const [data, setData] = useState<RecentOrdersData>({
    orders: [],
    loading: true,
  });

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders?limit=5&sort=newest');
        if (response.ok) {
          const orders = await response.json();
          setData({ orders, loading: false });
        } else {
          // Mock data for development
          const mockOrders: Order[] = [
            {
              id: "1",
              orderNumber: "ORD-2024-001",
              userId: "user1",
              items: [
                {
                  id: "item1",
                  productId: "prod1",
                  productName: "Premium Beyblade",
                  productImage: "/images/beyblade1.jpg",
                  sku: "BEY001",
                  price: 2999,
                  quantity: 1,
                  total: 2999,
                }
              ],
              subtotal: 2999,
              shipping: 99,
              tax: 0,
              discount: 0,
              total: 3098,
              status: "processing",
              paymentStatus: "paid",
              paymentMethod: "razorpay",
              shippingAddress: {
                id: "addr1",
                name: "John Doe",
                phone: "9876543210",
                addressLine1: "123 Main St",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001",
                country: "India",
                isDefault: true,
              },
              billingAddress: {
                id: "addr1",
                name: "John Doe",
                phone: "9876543210",
                addressLine1: "123 Main St",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001",
                country: "India",
                isDefault: true,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            // Add more mock orders...
          ];
          setData({ orders: mockOrders, loading: false });
        }
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
        setData({ orders: [], loading: false });
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (data.loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No recent orders found
                </td>
              </tr>
            ) : (
              data.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} item(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.shippingAddress.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.shippingAddress.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
