"use client";

interface EnhancedRecentReviewsProps {
  refreshKey: number;
  period: string;
}

export default function EnhancedRecentReviews({
  refreshKey,
  period,
}: EnhancedRecentReviewsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
      </div>
      <div className="p-6">
        <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Recent reviews would go here (Key: {refreshKey})
          </p>
        </div>
      </div>
    </div>
  );
}
