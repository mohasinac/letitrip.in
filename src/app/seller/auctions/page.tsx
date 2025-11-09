"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Gavel,
  Plus,
  Loader2,
  Clock,
  Zap,
  Archive,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  InlineEditRow,
  QuickCreateRow,
  BulkActionBar,
  TableCheckbox,
  InlineField,
  BulkAction,
} from "@/components/common/inline-edit";
import { auctionsService } from "@/services/auctions.service";
import { apiService } from "@/services/api.service";
import type { Auction, AuctionStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function SellerAuctionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [view, setView] = useState<"grid" | "table">("table");

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const status = searchParams.get("status") as AuctionStatus | null;

  useEffect(() => {
    loadAuctions();
  }, [status, selectedShop]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (status) filters.status = status;
      if (selectedShop) filters.shopId = selectedShop;

      const response = await auctionsService.list(filters);
      setAuctions(response.data || []);
    } catch (error) {
      console.error("Failed to load auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fields configuration for inline edit
  const fields: InlineField[] = [
    { key: "images", label: "Image", type: "image", required: false },
    { key: "name", label: "Auction Name", type: "text", required: true },
    {
      key: "startingBid",
      label: "Starting Bid (₹)",
      type: "number",
      required: true,
      min: 0,
      step: 1,
    },
    {
      key: "startTime",
      label: "Start Time",
      type: "date",
      required: true,
    },
    {
      key: "endTime",
      label: "End Time",
      type: "date",
      required: true,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "draft", label: "Draft" },
        { value: "scheduled", label: "Scheduled" },
        { value: "live", label: "Live" },
        { value: "ended", label: "Ended" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ];

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: "schedule",
      label: "Schedule",
      variant: "success",
      confirm: false,
    },
    {
      id: "cancel",
      label: "Cancel",
      variant: "warning",
      confirm: true,
      confirmTitle: "Cancel Auctions",
      confirmMessage: `Are you sure you want to cancel ${
        selectedIds.length
      } auction${selectedIds.length === 1 ? "" : "s"}?`,
    },
    {
      id: "end",
      label: "End Now",
      variant: "warning",
      confirm: true,
      confirmTitle: "End Auctions",
      confirmMessage: `Are you sure you want to end ${
        selectedIds.length
      } auction${
        selectedIds.length === 1 ? "" : "s"
      }? This will end them immediately.`,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Auctions",
      confirmMessage: `Are you sure you want to delete ${
        selectedIds.length
      } auction${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`,
    },
  ];

  // Bulk action handler
  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);
      const response = await apiService.post<{ success: boolean }>(
        "/api/seller/auctions/bulk",
        {
          action: actionId,
          ids: selectedIds,
        },
      );

      if (response.success) {
        await loadAuctions();
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) return;

    try {
      await auctionsService.delete(id);
      loadAuctions();
    } catch (error) {
      console.error("Failed to delete auction:", error);
      alert("Failed to delete auction");
    }
  };

  const getStatusBadge = (status: AuctionStatus) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-green-100 text-green-800",
      ended: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          styles[status] || styles.draft
        }`}
      >
        {status}
      </span>
    );
  };

  const stats = {
    total: auctions.length,
    live: auctions.filter((a) => a.status === "live").length,
    scheduled: auctions.filter((a) => a.status === "scheduled").length,
    ended: auctions.filter((a) => a.status === "ended").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your auction listings
          </p>
        </div>
        <Link
          href="/seller/auctions/create"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Auction
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Auctions</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
            <Gavel className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Live Auctions</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {stats.live}
              </p>
            </div>
            <Zap className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {stats.scheduled}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ended</p>
              <p className="mt-1 text-2xl font-bold text-gray-600">
                {stats.ended}
              </p>
            </div>
            <Archive className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={status || ""}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) {
                params.set("status", e.target.value);
              } else {
                params.delete("status");
              }
              router.push(`/seller/auctions?${params.toString()}`);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
          <button
            onClick={() => setView("table")}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              view === "table"
                ? "bg-primary text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("grid")}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              view === "grid"
                ? "bg-primary text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Empty State */}
      {auctions.length === 0 ? (
        <EmptyState
          title="No auctions yet"
          description="Create your first auction to start bidding"
          action={{
            label: "Create Auction",
            onClick: () => router.push("/seller/auctions/create"),
          }}
        />
      ) : (
        <>
          {/* Table View */}
          {view === "table" && (
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="w-12 px-6 py-3">
                        <TableCheckbox
                          checked={
                            selectedIds.length === auctions.length &&
                            auctions.length > 0
                          }
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < auctions.length
                          }
                          onChange={(checked) => {
                            setSelectedIds(
                              checked ? auctions.map((a) => a.id) : [],
                            );
                          }}
                          aria-label="Select all auctions"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bids
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {/* Quick Create Row */}
                    <QuickCreateRow
                      fields={fields}
                      onSave={async (values) => {
                        try {
                          await apiService.post("/api/seller/auctions", {
                            name: values.name,
                            startingBid: values.startingBid,
                            startTime: values.startTime,
                            endTime: values.endTime,
                            status: values.status,
                            images: values.images ? [values.images] : [],
                            description: "",
                            slug: values.name
                              .toLowerCase()
                              .replace(/\s+/g, "-"),
                          });
                          await loadAuctions();
                        } catch (error) {
                          console.error("Failed to create auction:", error);
                          throw error;
                        }
                      }}
                      resourceName="auction"
                      defaultValues={{
                        status: "draft",
                        startingBid: 0,
                      }}
                    />

                    {/* Auction Rows */}
                    {auctions.map((auction) => {
                      const isEditing = editingId === auction.id;

                      if (isEditing) {
                        return (
                          <InlineEditRow
                            key={auction.id}
                            fields={fields}
                            initialValues={{
                              images: auction.images?.[0] || "",
                              name: auction.name,
                              startingBid: auction.startingBid,
                              startTime: auction.startTime,
                              endTime: auction.endTime,
                              status: auction.status,
                            }}
                            onSave={async (values) => {
                              try {
                                await apiService.patch(
                                  `/api/auctions/${auction.id}`,
                                  {
                                    ...values,
                                    images: values.images
                                      ? [values.images]
                                      : auction.images,
                                  },
                                );
                                await loadAuctions();
                                setEditingId(null);
                              } catch (error) {
                                console.error(
                                  "Failed to update auction:",
                                  error,
                                );
                                throw error;
                              }
                            }}
                            onCancel={() => setEditingId(null)}
                            resourceName="auction"
                          />
                        );
                      }

                      return (
                        <tr
                          key={auction.id}
                          className="hover:bg-gray-50"
                          onDoubleClick={() => setEditingId(auction.id)}
                        >
                          {/* Checkbox */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TableCheckbox
                              checked={selectedIds.includes(auction.id)}
                              onChange={(checked) => {
                                setSelectedIds((prev) =>
                                  checked
                                    ? [...prev, auction.id]
                                    : prev.filter((id) => id !== auction.id),
                                );
                              }}
                              aria-label={`Select ${auction.name}`}
                            />
                          </td>

                          {/* Auction */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {auction.images?.[0] && (
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                                  <img
                                    src={auction.images[0]}
                                    alt={auction.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {auction.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {auction.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Current Bid */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              ₹{auction.currentBid.toLocaleString("en-IN")}
                            </div>
                          </td>

                          {/* Bids */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {auction.bidCount}
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {auction.status === "live"
                              ? formatDistanceToNow(new Date(auction.endTime), {
                                  addSuffix: true,
                                })
                              : new Date(auction.endTime).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={auction.status} />
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/auctions/${auction.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/seller/auctions/${auction.id}/edit`}
                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                title="Full Edit"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteId(auction.id)}
                                className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grid View */}
          {view === "grid" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {auctions.map((auction) => (
                <div
                  key={auction.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow"
                >
                  {auction.images && auction.images[0] && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={auction.images[0]}
                        alt={auction.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {auction.name}
                      </h3>
                      {getStatusBadge(auction.status)}
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Bid:</span>
                        <span className="font-semibold text-gray-900">
                          ₹{auction.currentBid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Bids:</span>
                        <span className="text-gray-900">
                          {auction.bidCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ends:</span>
                        <span className="text-gray-900">
                          {auction.status === "live"
                            ? formatDistanceToNow(new Date(auction.endTime), {
                                addSuffix: true,
                              })
                            : new Date(auction.endTime).toLocaleDateString()}
                        </span>
                      </div>
                      {auction.isFeatured && (
                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                          <span>★</span>
                          <span>Featured</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/auctions/${auction.slug}`}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      <Link
                        href={`/seller/auctions/${auction.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(auction.id)}
                        className="rounded-lg border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onAction={handleBulkAction}
          onClearSelection={() => setSelectedIds([])}
          loading={actionLoading}
          resourceName="auction"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Auction"
        description="Are you sure you want to delete this auction? This action cannot be undone."
        onConfirm={async () => {
          if (deleteId) {
            await handleDelete(deleteId);
            setDeleteId(null);
          }
        }}
        onClose={() => setDeleteId(null)}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
