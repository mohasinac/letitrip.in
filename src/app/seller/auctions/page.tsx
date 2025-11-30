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
  Filter,
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
  UnifiedFilterSidebar,
} from "@/components/common/inline-edit";
import { AUCTION_FILTERS } from "@/constants/filters";
import { getAuctionBulkActions } from "@/constants/bulk-actions";
import {
  AUCTION_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";
import { useIsMobile } from "@/hooks/useMobile";
import { auctionsService } from "@/services/auctions.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";
import { formatDistanceToNow } from "date-fns";

export default function SellerAuctionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("table");
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAuctions();
  }, [filterValues]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionsService.list({
        ...filterValues,
      });
      setAuctions(response.data || []);
      setTotalAuctions(response.data?.length || 0);
    } catch (error) {
      console.error("Failed to load auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fields configuration for inline edit (using centralized config)
  const fields: InlineField[] = toInlineFields(
    getFieldsForContext(AUCTION_FIELDS, "table")
  );

  // Bulk actions configuration
  const bulkActions = getAuctionBulkActions(selectedIds.length);

  // Bulk action handler
  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);
      const response = await auctionsService.bulkAction(actionId, selectedIds);

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
    const styles: Record<string, string> = {
      [AuctionStatus.DRAFT]: "bg-gray-100 text-gray-800",
      [AuctionStatus.SCHEDULED]: "bg-blue-100 text-blue-800",
      [AuctionStatus.ACTIVE]: "bg-green-100 text-green-800",
      [AuctionStatus.ENDED]: "bg-yellow-100 text-yellow-800",
      [AuctionStatus.CANCELLED]: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          styles[status] || styles[AuctionStatus.DRAFT]
        }`}
      >
        {status}
      </span>
    );
  };

  const stats = {
    total: auctions.length,
    live: auctions.filter((a) => a.status === AuctionStatus.ACTIVE).length,
    scheduled: auctions.filter((a) => a.status === AuctionStatus.SCHEDULED)
      .length,
    ended: auctions.filter((a) => a.status === AuctionStatus.ENDED).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <UnifiedFilterSidebar
          sections={AUCTION_FILTERS}
          values={filterValues}
          onChange={(key, value) => {
            setFilterValues((prev) => ({ ...prev, [key]: value }));
          }}
          onApply={() => {}}
          onReset={() => {
            setFilterValues({});
            setSearchQuery("");
          }}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={false}
          resultCount={totalAuctions}
          isLoading={loading}
          showInlineSearch={true}
          inlineSearchValue={searchQuery}
          onInlineSearchChange={setSearchQuery}
          inlineSearchPlaceholder="Search auctions..."
        />
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your auction listings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            )}
            <Link
              href="/seller/auctions/create"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Auction
            </Link>
          </div>
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
            title={
              Object.keys(filterValues).length > 0
                ? "No auctions found"
                : "No auctions yet"
            }
            description={
              Object.keys(filterValues).length > 0
                ? "Try adjusting your filters"
                : "Create your first auction to start bidding"
            }
            action={{
              label:
                Object.keys(filterValues).length > 0
                  ? "Clear Filters"
                  : "Create Auction",
              onClick: () =>
                Object.keys(filterValues).length > 0
                  ? setFilterValues({})
                  : router.push("/seller/auctions/create"),
            }}
          />
        ) : (
          <>
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
              <div className="sticky top-16 z-10 mb-4">
                <BulkActionBar
                  selectedCount={selectedIds.length}
                  actions={bulkActions}
                  onAction={handleBulkAction}
                  onClearSelection={() => setSelectedIds([])}
                  loading={actionLoading}
                  resourceName="auction"
                />
              </div>
            )}

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
                                checked ? auctions.map((a) => a.id) : []
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
                            // Validate form fields
                            const fieldsToValidate = getFieldsForContext(
                              AUCTION_FIELDS,
                              "table"
                            );
                            const { isValid, errors } = validateForm(
                              values,
                              fieldsToValidate
                            );

                            if (!isValid) {
                              setValidationErrors(errors);
                              throw new Error("Please fix validation errors");
                            }

                            setValidationErrors({});

                            await auctionsService.quickCreate({
                              name: values.name,
                              startingBid: values.startingBid,
                              startTime: values.startTime,
                              endTime: values.endTime,
                              status: values.status,
                              images: values.images ? [values.images] : [],
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
                                  // Validate form fields
                                  const fieldsToValidate = getFieldsForContext(
                                    AUCTION_FIELDS,
                                    "table"
                                  );
                                  const { isValid, errors } = validateForm(
                                    values,
                                    fieldsToValidate
                                  );

                                  if (!isValid) {
                                    setValidationErrors(errors);
                                    throw new Error(
                                      "Please fix validation errors"
                                    );
                                  }

                                  setValidationErrors({});

                                  await auctionsService.quickUpdate(
                                    auction.id,
                                    values
                                  );
                                  await loadAuctions();
                                  setEditingId(null);
                                } catch (error) {
                                  console.error(
                                    "Failed to update auction:",
                                    error
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
                                      : prev.filter((id) => id !== auction.id)
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
                                ₹
                                {(
                                  auction.currentBid ||
                                  auction.startingBid ||
                                  0
                                ).toLocaleString("en-IN")}
                              </div>
                            </td>

                            {/* Bids */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {auction.bidCount}
                            </td>

                            {/* Time */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {auction.status === AuctionStatus.ACTIVE
                                ? formatDistanceToNow(
                                    new Date(auction.endTime),
                                    {
                                      addSuffix: true,
                                    }
                                  )
                                : new Date(
                                    auction.endTime
                                  ).toLocaleDateString()}
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
                                  href={`/seller/auctions/${auction.slug}/edit`}
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
                            ₹
                            {(
                              auction.currentBid ||
                              auction.startingBid ||
                              0
                            ).toLocaleString()}
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
                            {auction.status === AuctionStatus.ACTIVE
                              ? formatDistanceToNow(new Date(auction.endTime), {
                                  addSuffix: true,
                                })
                              : new Date(auction.endTime).toLocaleDateString()}
                          </span>
                        </div>
                        {auction.featured && (
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
                          href={`/seller/auctions/${auction.slug}/edit`}
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

      {/* Mobile Filter Drawer */}
      {isMobile && (
        <UnifiedFilterSidebar
          sections={AUCTION_FILTERS}
          values={filterValues}
          onChange={(key, value) => {
            setFilterValues((prev) => ({ ...prev, [key]: value }));
          }}
          onApply={() => {
            setShowFilters(false);
          }}
          onReset={() => {
            setFilterValues({});
            setSearchQuery("");
          }}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={true}
          resultCount={totalAuctions}
          isLoading={loading}
          showInlineSearch={true}
          inlineSearchValue={searchQuery}
          onInlineSearchChange={setSearchQuery}
          inlineSearchPlaceholder="Search auctions..."
        />
      )}
    </div>
  );
}
