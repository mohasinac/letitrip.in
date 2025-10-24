"use client";

interface SellerPerformanceMetricsProps {
  stats: any;
  analytics: any;
  loading: boolean;
  period: string;
}

export default function SellerPerformanceMetrics({
  stats,
  analytics,
  loading,
  period,
}: SellerPerformanceMetricsProps) {
  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Performance Overview ({period})
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.conversionRate || 0}%
            </div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.averageRating || 0}★
            </div>
            <div className="text-sm text-gray-500">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.completedOrders || 0}
            </div>
            <div className="text-sm text-gray-500">Completed Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}
