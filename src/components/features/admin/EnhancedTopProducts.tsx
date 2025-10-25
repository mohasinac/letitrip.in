"use client";

interface EnhancedTopProductsProps {
  products: any[];
  loading: boolean;
}

export default function EnhancedTopProducts({
  products,
  loading,
}: EnhancedTopProductsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
        <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
      </div>
      <div className="p-6">
        {products?.length > 0 ? (
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.sales} sales
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ₹{product.revenue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No product data</p>
        )}
      </div>
    </div>
  );
}
