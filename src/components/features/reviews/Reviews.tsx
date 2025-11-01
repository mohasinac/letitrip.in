"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  ThumbsUp,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
import { UnifiedAlert } from "@/components/ui/unified";
import { UnifiedModal } from "@/components/ui/unified/Modal";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { SimpleTabs } from "@/components/ui/unified/Tabs";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

interface ReviewsProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function Reviews({
  title = "Reviews Management",
  description = "Moderate and manage product reviews",
  breadcrumbs,
}: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "info" });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"approve" | "reject" | "delete" | "view" | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter, searchQuery]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (ratingFilter !== "all") params.append("rating", ratingFilter);

      const response = await apiClient.get(
        `/admin/reviews${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (response) {
        setReviews(response);
        calculateStats(response);
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load reviews",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsList: Review[]) => {
    const calculatedStats = {
      total: reviewsList.length,
      pending: reviewsList.filter((r) => r.status === "pending").length,
      approved: reviewsList.filter((r) => r.status === "approved").length,
      rejected: reviewsList.filter((r) => r.status === "rejected").length,
      averageRating:
        reviewsList.length > 0
          ? Math.round(
              (reviewsList.reduce((sum, r) => sum + r.rating, 0) /
                reviewsList.length) *
                10
            ) / 10
          : 0,
    };
    setStats(calculatedStats);
  };

  const openModal = (
    review: Review,
    type: "approve" | "reject" | "delete" | "view"
  ) => {
    setSelectedReview(review);
    setModalType(type);
    setAdminNote(review.adminNote || "");
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedReview) return;

    try {
      setActionLoading(true);

      if (modalType === "delete") {
        await apiClient.delete(`/admin/reviews?id=${selectedReview.id}`);
        setAlert({
          show: true,
          message: "Review deleted successfully",
          type: "success",
        });
      } else if (modalType === "approve" || modalType === "reject") {
        const newStatus = modalType === "approve" ? "approved" : "rejected";
        await apiClient.patch(`/admin/reviews?id=${selectedReview.id}`, {
          status: newStatus,
          adminNote: adminNote || undefined,
        });
        setAlert({
          show: true,
          message: `Review ${newStatus} successfully`,
          type: "success",
        });
      }

      fetchReviews();
      setShowModal(false);
      setSelectedReview(null);
      setAdminNote("");
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Action failed",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "yellow",
      approved: "green",
      rejected: "red",
    };
    return colors[status] || "gray";
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      key: "userName",
      label: "User",
      sortable: true,
      render: (review: Review) => (
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {review.userName}
          </div>
          {review.verified && (
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          )}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (review: Review) => (
        <div className="flex items-center gap-2">
          {getRatingStars(review.rating)}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {review.rating}/5
          </span>
        </div>
      ),
    },
    {
      key: "title",
      label: "Review",
      render: (review: Review) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {review.title}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {review.comment}
          </div>
        </div>
      ),
    },
    {
      key: "productId",
      label: "Product ID",
      render: (review: Review) => (
        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          {review.productId.substring(0, 12)}...
        </div>
      ),
    },
    {
      key: "helpful",
      label: "Helpful",
      sortable: true,
      render: (review: Review) => (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <ThumbsUp className="w-4 h-4" />
          {review.helpful || 0}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (review: Review) => <span>{review.status}</span>,
      badge: (review: Review) => ({
        text: review.status,
        color: getStatusBadgeColor(review.status) as any,
      }),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (review: Review) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Row actions
  const rowActions: any = [
    {
      label: "View Details",
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: (row: Review) => openModal(row, "view"),
    },
    {
      label: "Approve",
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (row: Review) => openModal(row, "approve"),
      hidden: (row: Review) => row.status === "approved",
    },
    {
      label: "Reject",
      icon: <XCircle className="w-4 h-4" />,
      onClick: (row: Review) => openModal(row, "reject"),
      hidden: (row: Review) => row.status === "rejected",
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row: Review) => openModal(row, "delete"),
      variant: "danger" as const,
    },
  ];

  // Stats cards
  const statsCards = [
    {
      label: "Total Reviews",
      value: stats.total,
      color: "gray",
      icon: MessageSquare,
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "yellow",
      icon: Clock,
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "green",
      icon: CheckCircle,
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "red",
      icon: XCircle,
    },
    {
      label: "Avg Rating",
      value: stats.averageRating.toFixed(1),
      color: "blue",
      icon: Star,
    },
  ];

  // Status tabs
  const statusTabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  // Rating tabs
  const ratingTabs = [
    { id: "all", label: "All Ratings" },
    { id: "5", label: "5 Stars" },
    { id: "4", label: "4 Stars" },
    { id: "3", label: "3 Stars" },
    { id: "2", label: "2 Stars" },
    { id: "1", label: "1 Star" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <UnifiedButton
            onClick={fetchReviews}
            icon={<RefreshCw className="w-5 h-5" />}
            variant="outline"
          >
            Refresh
          </UnifiedButton>
        }
      />

      {/* Alert */}
      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          className="mb-6"
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <Icon
                  className={`w-5 h-5 ${
                    stat.color === "yellow"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : stat.color === "green"
                      ? "text-green-600 dark:text-green-400"
                      : stat.color === "red"
                      ? "text-red-600 dark:text-red-400"
                      : stat.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <p
                className={`text-3xl font-bold ${
                  stat.color === "yellow"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : stat.color === "green"
                    ? "text-green-600 dark:text-green-400"
                    : stat.color === "red"
                    ? "text-red-600 dark:text-red-400"
                    : stat.color === "blue"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <SimpleTabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
        <SimpleTabs
          tabs={ratingTabs}
          activeTab={ratingFilter}
          onChange={setRatingFilter}
        />
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, product, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <ModernDataTable
        data={reviews}
        columns={columns}
        loading={loading}
        emptyMessage="No reviews found"
        rowActions={rowActions}
      />

      {/* Action Modal */}
      {showModal && selectedReview && (
        <UnifiedModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedReview(null);
            setAdminNote("");
          }}
          title={
            modalType === "view"
              ? "Review Details"
              : modalType === "approve"
              ? "Approve Review"
              : modalType === "reject"
              ? "Reject Review"
              : "Delete Review"
          }
        >
          <div className="space-y-4">
            {/* Review Details */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedReview.userName}
                    </span>
                    {selectedReview.verified && (
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRatingStars(selectedReview.rating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedReview.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : selectedReview.status === "rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {selectedReview.status}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {selectedReview.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedReview.comment}
                </p>
              </div>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedReview.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {selectedReview.helpful || 0} helpful
                </div>
                <div>
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action-specific content */}
            {modalType === "approve" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Note (Optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add internal note about this review..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {modalType === "reject" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g., Spam, inappropriate content, fake review..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This note is for internal use only and won't be shown to the user.
                </p>
              </div>
            )}

            {modalType === "delete" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Warning: This action cannot be undone
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Deleting this review will permanently remove it from the
                      system and update the product's rating.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {modalType !== "view" && (
              <div className="flex gap-2 mt-6">
                <UnifiedButton
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReview(null);
                    setAdminNote("");
                  }}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </UnifiedButton>
                <UnifiedButton
                  onClick={handleAction}
                  loading={actionLoading}
                  className="flex-1"
                  variant={modalType === "delete" ? "destructive" : "primary"}
                >
                  {actionLoading
                    ? "Processing..."
                    : modalType === "delete"
                    ? "Delete"
                    : modalType === "approve"
                    ? "Approve"
                    : "Reject"}
                </UnifiedButton>
              </div>
            )}
          </div>
        </UnifiedModal>
      )}
    </div>
  );
}
