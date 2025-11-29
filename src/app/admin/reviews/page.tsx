"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  UnifiedFilterSidebar,
  BulkActionBar,
  TableCheckbox,
} from "@/components/common/inline-edit";
import { REVIEW_FILTERS } from "@/constants/filters";
import { getReviewBulkActions } from "@/constants/bulk-actions";
import { reviewsService } from "@/services/reviews.service";
import { toast } from "@/components/admin/Toast";
import { Star, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [filterValues, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsService.list({
        ...filterValues,
        page: currentPage,
        limit: 20,
      });
      setReviews(response.data || []);
      // Calculate total pages from count
      setTotalPages(Math.ceil((response.count || 0) / 20));
      setTotalReviews(response.count || 0);
    } catch (error: any) {
      // toast.error(error.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (actionId: string) => {
    if (selectedReviews.size === 0) {
      toast.error("Please select reviews first");
      return;
    }

    try {
      const reviewIds = Array.from(selectedReviews);

      switch (actionId) {
        case "approve":
          await Promise.all(
            reviewIds.map((id) =>
              reviewsService.moderate(id, { isApproved: true }),
            ),
          );
          toast.success(`${reviewIds.length} reviews approved`);
          break;
        case "reject":
          await Promise.all(
            reviewIds.map((id) =>
              reviewsService.moderate(id, {
                isApproved: false,
                moderationNotes: "Rejected by admin",
              }),
            ),
          );
          toast.success(`${reviewIds.length} reviews rejected`);
          break;
        case "flag":
          await Promise.all(
            reviewIds.map((id) =>
              reviewsService.moderate(id, {
                isApproved: false,
                moderationNotes: "Flagged for review",
              }),
            ),
          );
          toast.success(`${reviewIds.length} reviews flagged`);
          break;
        case "delete":
          await Promise.all(reviewIds.map((id) => reviewsService.delete(id)));
          toast.success(`${reviewIds.length} reviews deleted`);
          break;
      }

      setSelectedReviews(new Set());
      loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Bulk action failed");
    }
  };

  const handleModerate = async (id: string, status: string) => {
    try {
      await reviewsService.moderate(id, { isApproved: status === "approved" });
      toast.success(`Review ${status}`);
      loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Failed to moderate review");
    }
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map((r) => r.id)));
    }
  };

  const bulkActions = getReviewBulkActions(selectedReviews.size);

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <UnifiedFilterSidebar
            sections={REVIEW_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
            onApply={() => setCurrentPage(1)}
            onReset={() => {
              setFilterValues({});
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            resultCount={totalReviews}
            isLoading={loading}
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Reviews Management
              </h1>
              <p className="text-gray-600 mt-2">
                Moderate product and shop reviews
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Reviews</div>
                <div className="text-2xl font-bold">{totalReviews}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {reviews.filter((r) => r.status === "pending").length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Approved</div>
                <div className="text-2xl font-bold text-green-600">
                  {reviews.filter((r) => r.status === "approved").length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Flagged</div>
                <div className="text-2xl font-bold text-red-600">
                  {reviews.filter((r) => r.status === "flagged").length}
                </div>
              </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedReviews.size > 0 && (
              <div className="sticky top-16 z-10 mb-4">
                <BulkActionBar
                  selectedCount={selectedReviews.size}
                  actions={bulkActions}
                  onAction={handleBulkAction}
                  onClearSelection={() => setSelectedReviews(new Set())}
                  loading={false}
                  resourceName="review"
                />
              </div>
            )}

            {/* Reviews Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No reviews found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <TableCheckbox
                          checked={selectedReviews.size === reviews.length}
                          indeterminate={
                            selectedReviews.size > 0 &&
                            selectedReviews.size < reviews.length
                          }
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product/Shop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reviewer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <TableCheckbox
                            checked={selectedReviews.has(review.id)}
                            onChange={(checked) => {
                              const newSelected = new Set(selectedReviews);
                              if (checked) {
                                newSelected.add(review.id);
                              } else {
                                newSelected.delete(review.id);
                              }
                              setSelectedReviews(newSelected);
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium">
                            {review.productName || review.shopName}
                          </div>
                          <div className="text-gray-500">
                            {review.reviewType}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>{review.reviewerName}</div>
                          <div className="text-gray-500">
                            {review.reviewerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm">
                              {review.rating}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">
                          {review.comment}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              review.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : review.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : review.status === "flagged"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {review.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {review.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleModerate(review.id, "approved")
                                }
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleModerate(review.id, "rejected")
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleModerate(review.id, "flagged")
                                }
                                className="text-orange-600 hover:text-orange-900"
                                title="Flag"
                              >
                                <AlertTriangle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              router.push(`/admin/reviews/${review.id}`)
                            }
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
