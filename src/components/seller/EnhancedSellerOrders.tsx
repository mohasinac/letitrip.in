"use client";

interface EnhancedSellerOrdersProps {
  orders: any[];
  loading: boolean;
  onRefresh: () => void;
}

export default function EnhancedSellerOrders({
  orders,
  loading,
  onRefresh,
}: EnhancedSellerOrdersProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="p-6">
        {orders?.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{order.id}</div>
                  <div className="text-sm text-gray-500">
                    {order.customerName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ₹{order.amount}
                  </div>
                  <div className="text-sm text-gray-500">{order.status}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
        )}
      </div>
    </div>
  );
}
