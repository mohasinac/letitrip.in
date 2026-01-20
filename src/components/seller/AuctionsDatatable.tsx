"use client";

import Image from "next/image";
import React, { useState } from "react";

/**
 * AuctionsDatatable Component
 *
 * A comprehensive data table for managing seller auctions with:
 * - Inline editing capability for quick updates
 * - Bulk actions for efficient multi-auction operations
 * - Advanced filtering and search functionality
 * - Grid/Table toggle for different viewing preferences
 * - Row-level actions for individual auction management
 * - Real-time status display (active, scheduled, ended)
 *
 * @example
 * ```tsx
 * <AuctionsDatatable
 *   auctions={auctions}
 *   onUpdate={(id, updates) => console.log('Update:', id, updates)}
 *   onDelete={(ids) => console.log('Delete:', ids)}
 * />
 * ```
 */

// Types
interface Auction {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: string;
  startingBid: number;
  currentBid: number;
  bidCount: number;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "active" | "ended";
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuctionsDatatableProps {
  auctions: Auction[];
  onUpdate?: (auctionId: string, updates: Partial<Auction>) => void;
  onDelete?: (auctionIds: string[]) => void;
  onBulkAction?: (action: string, auctionIds: string[]) => void;
}

// Mock data for development
const MOCK_AUCTIONS: Auction[] = [
  {
    id: "1",
    title: "Vintage Watch Collection",
    slug: "vintage-watch-collection",
    image: "/placeholder-auction.svg",
    category: "Collectibles",
    startingBid: 5000,
    currentBid: 12500,
    bidCount: 23,
    startTime: new Date("2026-01-15T10:00:00"),
    endTime: new Date("2026-01-25T18:00:00"),
    status: "active",
    featured: true,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-20"),
  },
  {
    id: "2",
    title: "Gaming Console Bundle",
    slug: "gaming-console-bundle",
    image: "/placeholder-auction.svg",
    category: "Electronics",
    startingBid: 10000,
    currentBid: 10000,
    bidCount: 0,
    startTime: new Date("2026-01-25T12:00:00"),
    endTime: new Date("2026-02-05T20:00:00"),
    status: "scheduled",
    featured: false,
    createdAt: new Date("2026-01-18"),
    updatedAt: new Date("2026-01-18"),
  },
  {
    id: "3",
    title: "Antique Furniture Set",
    slug: "antique-furniture-set",
    image: "/placeholder-auction.svg",
    category: "Home",
    startingBid: 15000,
    currentBid: 28000,
    bidCount: 45,
    startTime: new Date("2026-01-05T09:00:00"),
    endTime: new Date("2026-01-15T21:00:00"),
    status: "ended",
    featured: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-15"),
  },
  {
    id: "4",
    title: "Limited Edition Sneakers",
    slug: "limited-edition-sneakers",
    image: "/placeholder-auction.svg",
    category: "Fashion",
    startingBid: 3000,
    currentBid: 8500,
    bidCount: 67,
    startTime: new Date("2026-01-18T14:00:00"),
    endTime: new Date("2026-01-22T22:00:00"),
    status: "active",
    featured: false,
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-01-20"),
  },
];

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Home",
  "Collectibles",
  "Books",
  "Sports",
  "Beauty",
];

const SORT_OPTIONS = [
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Title (Z-A)", value: "title_desc" },
  { label: "Current Bid (Low to High)", value: "bid_asc" },
  { label: "Current Bid (High to Low)", value: "bid_desc" },
  { label: "Bid Count (Low to High)", value: "count_asc" },
  { label: "Bid Count (High to Low)", value: "count_desc" },
  { label: "Ending Soon", value: "end_asc" },
  { label: "Ending Later", value: "end_desc" },
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
];

export default function AuctionsDatatable({
  auctions: initialAuctions = MOCK_AUCTIONS,
  onUpdate,
  onDelete,
  onBulkAction,
}: AuctionsDatatableProps) {
  // State management
  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);
  const [selectedAuctions, setSelectedAuctions] = useState<Set<string>>(
    new Set(),
  );
  const [editingAuction, setEditingAuction] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Auction>>({});
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<string>("All Categories");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  // Calculate time left for active auctions
  const getTimeLeft = (endTime: Date): string => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAuctions.map((a) => a.id));
      setSelectedAuctions(allIds);
    } else {
      setSelectedAuctions(new Set());
    }
  };

  // Handle individual auction selection
  const handleSelectAuction = (auctionId: string, checked: boolean) => {
    const newSelection = new Set(selectedAuctions);
    if (checked) {
      newSelection.add(auctionId);
    } else {
      newSelection.delete(auctionId);
    }
    setSelectedAuctions(newSelection);
  };

  // Start inline editing
  const handleStartEdit = (auction: Auction) => {
    setEditingAuction(auction.id);
    setEditForm({
      title: auction.title,
      startingBid: auction.startingBid,
      startTime: auction.startTime,
      endTime: auction.endTime,
      featured: auction.featured,
    });
  };

  // Save inline edit
  const handleSaveEdit = () => {
    if (!editingAuction) return;

    const updatedAuctions = auctions.map((a) =>
      a.id === editingAuction
        ? { ...a, ...editForm, updatedAt: new Date() }
        : a,
    );
    setAuctions(updatedAuctions);

    // Call parent callback
    if (onUpdate) {
      onUpdate(editingAuction, editForm);
    }

    setEditingAuction(null);
    setEditForm({});
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingAuction(null);
    setEditForm({});
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedAuctions);

    if (selectedIds.length === 0) {
      alert("Please select at least one auction");
      return;
    }

    switch (action) {
      case "feature":
        const featuredAuctions = auctions.map((a) =>
          selectedIds.includes(a.id) ? { ...a, featured: true } : a,
        );
        setAuctions(featuredAuctions);
        break;

      case "unfeature":
        const unfeaturedAuctions = auctions.map((a) =>
          selectedIds.includes(a.id) ? { ...a, featured: false } : a,
        );
        setAuctions(unfeaturedAuctions);
        break;

      case "extend_time":
        const hours = prompt("Enter hours to extend auction by:");
        if (hours !== null) {
          const hoursValue = parseInt(hours);
          if (!isNaN(hoursValue) && hoursValue > 0) {
            const extendedAuctions = auctions.map((a) => {
              if (selectedIds.includes(a.id) && a.status !== "ended") {
                const newEndTime = new Date(a.endTime);
                newEndTime.setHours(newEndTime.getHours() + hoursValue);
                return { ...a, endTime: newEndTime };
              }
              return a;
            });
            setAuctions(extendedAuctions);
          }
        }
        break;

      case "delete":
        if (
          confirm(
            `Are you sure you want to delete ${selectedIds.length} auction(s)?`,
          )
        ) {
          const remainingAuctions = auctions.filter(
            (a) => !selectedIds.includes(a.id),
          );
          setAuctions(remainingAuctions);
          setSelectedAuctions(new Set());

          if (onDelete) {
            onDelete(selectedIds);
          }
        }
        break;
    }

    // Call parent callback for custom actions
    if (onBulkAction) {
      onBulkAction(action, selectedIds);
    }
  };

  // Handle delete single auction
  const handleDeleteAuction = (auctionId: string) => {
    if (confirm("Are you sure you want to delete this auction?")) {
      const remainingAuctions = auctions.filter((a) => a.id !== auctionId);
      setAuctions(remainingAuctions);

      if (onDelete) {
        onDelete([auctionId]);
      }
    }
  };

  // Handle search (triggered on Enter key)
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Search:", searchQuery);
    }
  };

  // Filter and sort auctions
  const filteredAuctions = auctions
    .filter((auction) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          auction.title.toLowerCase().includes(query) ||
          auction.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((auction) => {
      // Status filter
      if (statusFilter === "all") return true;
      return auction.status === statusFilter;
    })
    .filter((auction) => {
      // Category filter
      if (categoryFilter === "All Categories") return true;
      return auction.category === categoryFilter;
    })
    .sort((a, b) => {
      // Sort logic
      switch (sortBy) {
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "bid_asc":
          return a.currentBid - b.currentBid;
        case "bid_desc":
          return b.currentBid - a.currentBid;
        case "count_asc":
          return a.bidCount - b.bidCount;
        case "count_desc":
          return b.bidCount - a.bidCount;
        case "end_asc":
          return a.endTime.getTime() - b.endTime.getTime();
        case "end_desc":
          return b.endTime.getTime() - a.endTime.getTime();
        case "date_asc":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "date_desc":
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

  const allSelected =
    filteredAuctions.length > 0 &&
    selectedAuctions.size === filteredAuctions.length;
  const someSelected =
    selectedAuctions.size > 0 &&
    selectedAuctions.size < filteredAuctions.length;

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Auctions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredAuctions.length} auction(s) • {selectedAuctions.size}{" "}
            selected
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedAuctions.size > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction("feature")}
              className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Mark Featured
            </button>
            <button
              onClick={() => handleBulkAction("unfeature")}
              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Remove Featured
            </button>
            <button
              onClick={() => handleBulkAction("extend_time")}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Extend Time
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search auctions
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by title or category (press Enter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg border ${
                viewMode === "table"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              } transition-colors`}
              title="Table View"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg border ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              } transition-colors`}
              title="Grid View"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Auction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Current Bid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Bids
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Time Left
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAuctions.map((auction) => {
                  const isEditing = editingAuction === auction.id;
                  const isSelected = selectedAuctions.has(auction.id);
                  const timeLeft = getTimeLeft(auction.endTime);

                  return (
                    <tr
                      key={auction.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectAuction(auction.id, e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <Image
                              src={auction.image}
                              alt={auction.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.title || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    title: e.target.value,
                                  })
                                }
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {auction.title}
                                  </span>
                                  {auction.featured && (
                                    <span
                                      className="text-yellow-500"
                                      title="Featured"
                                    >
                                      ⭐
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  /{auction.slug}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {auction.category}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.startingBid || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                startingBid: parseFloat(e.target.value),
                              })
                            }
                            className="w-28 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Starting bid"
                          />
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              ₹{auction.currentBid.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Starting: ₹{auction.startingBid.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {auction.bidCount}{" "}
                          {auction.bidCount === 1 ? "bid" : "bids"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="datetime-local"
                              value={
                                editForm.startTime
                                  ?.toISOString()
                                  .slice(0, 16) || ""
                              }
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  startTime: new Date(e.target.value),
                                })
                              }
                              className="w-40 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="datetime-local"
                              value={
                                editForm.endTime?.toISOString().slice(0, 16) ||
                                ""
                              }
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  endTime: new Date(e.target.value),
                                })
                              }
                              className="w-40 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <span
                            className={`text-sm font-medium ${
                              auction.status === "ended"
                                ? "text-gray-500 dark:text-gray-400"
                                : auction.status === "scheduled"
                                ? "text-blue-600 dark:text-blue-400"
                                : timeLeft.includes("m") &&
                                  !timeLeft.includes("h") &&
                                  !timeLeft.includes("d")
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {auction.status === "scheduled"
                              ? `Starts in ${getTimeLeft(auction.startTime)}`
                              : timeLeft}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            auction.status === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : auction.status === "scheduled"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {auction.status.charAt(0).toUpperCase() +
                            auction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="Save"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Cancel"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(auction)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Quick Edit"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  console.log("Edit in wizard:", auction.id)
                                }
                                className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                title="Edit in Wizard"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => console.log("View:", auction.id)}
                                className="p-1.5 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                                title="View"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteAuction(auction.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAuctions.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No auctions found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAuctions.map((auction) => {
            const isSelected = selectedAuctions.has(auction.id);
            const timeLeft = getTimeLeft(auction.endTime);

            return (
              <div
                key={auction.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                  isSelected
                    ? "border-blue-500 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700"
                } overflow-hidden hover:shadow-md transition-shadow`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={auction.image}
                    alt={auction.title}
                    fill
                    className="object-cover"
                  />

                  {/* Checkbox overlay */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        handleSelectAuction(auction.id, e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        auction.status === "active"
                          ? "bg-green-100 text-green-800"
                          : auction.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {auction.status.charAt(0).toUpperCase() +
                        auction.status.slice(1)}
                    </span>
                  </div>

                  {/* Featured badge */}
                  {auction.featured && (
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        ⭐ Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {auction.category}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {auction.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Current Bid
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{auction.currentBid.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>{auction.bidCount} bids</span>
                    <span
                      className={`font-medium ${
                        auction.status === "ended"
                          ? "text-gray-500 dark:text-gray-400"
                          : auction.status === "scheduled"
                          ? "text-blue-600 dark:text-blue-400"
                          : timeLeft.includes("m") &&
                            !timeLeft.includes("h") &&
                            !timeLeft.includes("d")
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {auction.status === "scheduled"
                        ? `Starts in ${getTimeLeft(auction.startTime)}`
                        : timeLeft}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(auction)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Quick Edit
                    </button>
                    <button
                      onClick={() => console.log("View:", auction.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="View"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteAuction(auction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAuctions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No auctions found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
