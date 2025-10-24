"use client";

interface EnhancedSellerSalesChartProps {
  data: any;
  loading: boolean;
  period: string;
}

export default function EnhancedSellerSalesChart({
  data,
  loading,
  period,
}: EnhancedSellerSalesChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Sales Chart ({period})
        </h3>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Sales chart visualization would go here
          </p>
        </div>
        {data && (
          <div className="mt-4 text-sm text-gray-500">
            Data points: {data.labels?.length || 0}
          </div>
        )}
      </div>
    </div>
  );
}
