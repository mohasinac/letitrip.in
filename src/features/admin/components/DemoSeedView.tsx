"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Badge,
  Spinner,
  ConfirmDeleteModal,
  Heading,
  Text,
  Caption,
  Span,
  Checkbox,
  Ul,
  Li,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { demoService } from "@/services";

type CollectionName =
  | "users"
  | "addresses"
  | "categories"
  | "products"
  | "orders"
  | "reviews"
  | "bids"
  | "coupons"
  | "carouselSlides"
  | "homepageSections"
  | "siteSettings"
  | "faqs"
  | "notifications"
  | "payouts"
  | "blogPosts"
  | "events"
  | "eventEntries"
  | "sessions"
  | "carts";

interface CollectionGroup {
  label: string;
  emoji: string;
  color: string;
  headerBg: string;
  chipBg: string;
  chipSelected: string;
  collections: CollectionName[];
}

interface SeedResponse {
  success: boolean;
  message: string;
  details?: {
    created?: number;
    updated?: number;
    deleted?: number;
    skipped?: number;
    errors?: number;
    collections?: string[];
  };
}

const COLLECTION_GROUPS: CollectionGroup[] = [
  {
    label: "Auth & Users",
    emoji: "🔐",
    color: "text-violet-700 dark:text-violet-300",
    headerBg:
      "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800",
    chipBg:
      "border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700",
    chipSelected:
      "border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    collections: ["users", "addresses", "sessions"],
  },
  {
    label: "Commerce",
    emoji: "🛍️",
    color: "text-emerald-700 dark:text-emerald-300",
    headerBg:
      "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800",
    chipBg:
      "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700",
    chipSelected:
      "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    collections: [
      "products",
      "orders",
      "bids",
      "carts",
      "coupons",
      "payouts",
      "reviews",
    ],
  },
  {
    label: "Content",
    emoji: "📝",
    color: "text-sky-700 dark:text-sky-300",
    headerBg:
      "bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800",
    chipBg:
      "border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700",
    chipSelected:
      "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
    collections: [
      "blogPosts",
      "events",
      "eventEntries",
      "faqs",
      "notifications",
    ],
  },
  {
    label: "Configuration",
    emoji: "⚙️",
    color: "text-amber-700 dark:text-amber-300",
    headerBg:
      "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800",
    chipBg:
      "border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700",
    chipSelected:
      "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    collections: [
      "categories",
      "carouselSlides",
      "homepageSections",
      "siteSettings",
    ],
  },
];

const ALL_COLLECTIONS: CollectionName[] = COLLECTION_GROUPS.flatMap(
  (g) => g.collections,
);

const COLLECTION_LABELS: Record<CollectionName, string> = {
  users: "Users",
  addresses: "Addresses",
  sessions: "Sessions",
  products: "Products",
  orders: "Orders",
  bids: "Bids",
  carts: "Carts",
  coupons: "Coupons",
  payouts: "Payouts",
  reviews: "Reviews",
  blogPosts: "Blog Posts",
  events: "Events",
  eventEntries: "Event Entries",
  faqs: "FAQs",
  notifications: "Notifications",
  categories: "Categories",
  carouselSlides: "Carousel",
  homepageSections: "Homepage",
  siteSettings: "Site Settings",
};

export function DemoSeedView() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SeedResponse | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionName[]
  >([]);
  const [confirmPending, setConfirmPending] = useState<
    "deleteAll" | "deleteSelected" | null
  >(null);
  const [lastAction, setLastAction] = useState<"load" | "delete" | null>(null);

  const handleSeedData = async (
    action: "load" | "delete",
    collections?: CollectionName[],
  ) => {
    setLoading(true);
    setResponse(null);
    setLastAction(action);

    try {
      const data = await demoService.seed({
        action,
        collections: collections ?? ALL_COLLECTIONS,
      });
      setResponse(data as SeedResponse);
    } catch (error) {
      setResponse({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (collection: CollectionName) => {
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection],
    );
  };

  const toggleGroup = (group: CollectionGroup) => {
    const allSelected = group.collections.every((c) =>
      selectedCollections.includes(c),
    );
    if (allSelected) {
      setSelectedCollections((prev) =>
        prev.filter((c) => !group.collections.includes(c)),
      );
    } else {
      setSelectedCollections((prev) => [
        ...prev,
        ...group.collections.filter((c) => !prev.includes(c)),
      ]);
    }
  };

  const selectAll = () => setSelectedCollections([...ALL_COLLECTIONS]);
  const deselectAll = () => setSelectedCollections([]);

  const selCount = selectedCollections.length;
  const totalCount = ALL_COLLECTIONS.length;
  const { flex } = THEME_CONSTANTS;

  // Guard: dev only
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className={`min-h-screen ${flex.center} p-4`}>
        <Card className="max-w-md w-full p-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <Heading
            level={1}
            className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2"
          >
            Access Denied
          </Heading>
          <Text variant="secondary">
            This page is only available in development mode.
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary} pb-16`}>
      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Span className="text-4xl">🌱</Span>
                <Heading
                  level={1}
                  className="text-3xl sm:text-4xl font-bold tracking-tight"
                >
                  Seed Data Manager
                </Heading>
              </div>
              <Text className="text-gray-400 text-sm sm:text-base max-w-lg">
                Load or remove deterministic seed documents from Firestore. All
                operations are ID-scoped — safe alongside real data.
              </Text>
            </div>
            <Span className="self-start sm:self-auto px-3 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full uppercase tracking-wide shrink-0">
              Dev Only
            </Span>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-3 mt-6">
            {COLLECTION_GROUPS.map((g) => (
              <div
                key={g.label}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300"
              >
                <Span>{g.emoji}</Span>
                <Span>{g.label}</Span>
                <Span className="font-bold text-white">
                  {g.collections.length}
                </Span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
              {totalCount} collections total
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 mt-8">
        {/* ── Loading overlay banner ── */}
        {loading && (
          <div className="flex items-center gap-3 px-5 py-4 bg-blue-600 text-white rounded-xl shadow-lg">
            <Spinner size="sm" variant="white" />
            <Span className="font-medium">
              {lastAction === "load" ? "Loading" : "Deleting"} seed data…
            </Span>
            <Span className="text-blue-200 text-sm ml-auto">
              This may take a moment
            </Span>
          </div>
        )}

        {/* ── Result panel ── */}
        {response && !loading && (
          <Card
            className={`p-6 border-2 ${response.success ? "border-emerald-300 dark:border-emerald-700" : "border-red-300 dark:border-red-700"}`}
          >
            <div className="flex items-start gap-3 mb-5">
              <Span className="text-2xl">{response.success ? "✅" : "❌"}</Span>
              <div>
                <Heading
                  level={3}
                  className={`font-bold text-lg ${THEME_CONSTANTS.themed.textPrimary}`}
                >
                  {response.success ? "Operation complete" : "Operation failed"}
                </Heading>
                <Text size="sm" variant="secondary" className="mt-0.5">
                  {response.message}
                </Text>
              </div>
            </div>

            {response.details && (
              <>
                {/* Stat grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {response.details.created !== undefined && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {response.details.created}
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                        Created
                      </div>
                    </div>
                  )}
                  {response.details.updated !== undefined &&
                    response.details.updated > 0 && (
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {response.details.updated}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium">
                          Updated
                        </div>
                      </div>
                    )}
                  {response.details.deleted !== undefined && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {response.details.deleted}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300 mt-1 font-medium">
                        Deleted
                      </div>
                    </div>
                  )}
                  {response.details.skipped !== undefined &&
                    response.details.skipped > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                          {response.details.skipped}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                          Skipped
                        </div>
                      </div>
                    )}
                  {response.details.errors !== undefined &&
                    response.details.errors > 0 && (
                      <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {response.details.errors}
                        </div>
                        <div className="text-xs text-orange-700 dark:text-orange-300 mt-1 font-medium">
                          Errors
                        </div>
                      </div>
                    )}
                </div>

                {/* Collections processed */}
                {response.details.collections &&
                  response.details.collections.length > 0 && (
                    <div>
                      <Caption className="font-semibold uppercase tracking-wider mb-2">
                        Collections processed
                      </Caption>
                      <div className="flex flex-wrap gap-2">
                        {response.details.collections.map((col) => (
                          <Badge key={col} variant="info" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </Card>
        )}

        {/* ── Collection Selector ── */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <Heading
                level={2}
                className={`text-xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Select Collections
              </Heading>
              <Text size="sm" variant="secondary" className="mt-0.5">
                {selCount === 0
                  ? "None selected — actions below will target all collections"
                  : `${selCount} of ${totalCount} selected`}
              </Text>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={selectAll}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Select all
              </Button>
              <Button
                onClick={deselectAll}
                variant="outline"
                size="sm"
                disabled={loading || selCount === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            {COLLECTION_GROUPS.map((group) => {
              const allGroupSelected = group.collections.every((c) =>
                selectedCollections.includes(c),
              );
              const someGroupSelected = group.collections.some((c) =>
                selectedCollections.includes(c),
              );
              return (
                <div
                  key={group.label}
                  className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Group header */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => toggleGroup(group)}
                    disabled={loading}
                    className={`w-full ${flex.between} px-4 py-3 ${group.headerBg} transition-opacity ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Span>{group.emoji}</Span>
                      <Span className={`font-semibold text-sm ${group.color}`}>
                        {group.label}
                      </Span>
                      <Span className="text-xs text-gray-500 dark:text-gray-400">
                        ({group.collections.length})
                      </Span>
                    </div>
                    <div className="flex items-center gap-2">
                      {someGroupSelected && !allGroupSelected && (
                        <Span className="text-xs text-gray-500 dark:text-gray-400">
                          {
                            group.collections.filter((c) =>
                              selectedCollections.includes(c),
                            ).length
                          }{" "}
                          selected
                        </Span>
                      )}
                      <Span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          allGroupSelected
                            ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {allGroupSelected
                          ? "All on"
                          : someGroupSelected
                            ? "Partial"
                            : "All off"}
                      </Span>
                    </div>
                  </Button>

                  {/* Group chips */}
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-white dark:bg-gray-900">
                    {group.collections.map((col) => {
                      const isSelected = selectedCollections.includes(col);
                      return (
                        <div
                          key={col}
                          onClick={() => !loading && toggleCollection(col)}
                          onKeyDown={(e) =>
                            e.key === " " && !loading && toggleCollection(col)
                          }
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          className={`
                            flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer
                            transition-all duration-150 select-none
                            ${isSelected ? group.chipSelected : group.chipBg + " text-gray-700 dark:text-gray-300"}
                            ${loading ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleCollection(col)}
                            disabled={loading}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <Span className="text-sm font-medium leading-tight">
                            {COLLECTION_LABELS[col]}
                          </Span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Load card */}
          <Card className="p-5 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-4">
              <Span className="text-xl">📥</Span>
              <Heading
                level={3}
                className={`font-bold text-base ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Load Data
              </Heading>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => handleSeedData("load")}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold"
              >
                {loading && lastAction === "load" ? (
                  <Span className={`${flex.center} gap-2`}>
                    <Spinner size="sm" variant="white" /> Loading…
                  </Span>
                ) : (
                  "Load All Collections"
                )}
              </Button>
              <Button
                onClick={() => handleSeedData("load", selectedCollections)}
                disabled={loading || selCount === 0}
                variant="outline"
                className="w-full border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                Load Selected{selCount > 0 ? ` (${selCount})` : ""}
              </Button>
            </div>
            <Caption className="mt-3">
              Upserts documents using seed IDs. Existing docs are merged, not
              overwritten.
            </Caption>
          </Card>

          {/* Delete card */}
          <Card className="p-5 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-4">
              <Span className="text-xl">🗑️</Span>
              <Heading
                level={3}
                className={`font-bold text-base ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Delete Data
              </Heading>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => setConfirmPending("deleteAll")}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold"
              >
                Delete All Collections
              </Button>
              <Button
                onClick={() => setConfirmPending("deleteSelected")}
                disabled={loading || selCount === 0}
                variant="outline"
                className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete Selected{selCount > 0 ? ` (${selCount})` : ""}
              </Button>
            </div>
            <Caption className="mt-3">
              Removes only documents matching seed IDs. Safe — won&apos;t touch
              non-seed data.
            </Caption>
          </Card>
        </div>

        {/* ── Info footer ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4">
          <Caption className="font-semibold uppercase tracking-wider mb-2">
            How it works
          </Caption>
          <Ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <Li>
              All operations target specific document IDs from seed files —
              never a whole collection
            </Li>
            <Li>
              Delete is safe to run even when the DB has non-seed documents
            </Li>
            <Li>Users are synced to Firebase Auth as well as Firestore</Li>
            <Li>
              Addresses are written as subcollections under their parent user
              document
            </Li>
          </Ul>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmPending !== null}
        onClose={() => setConfirmPending(null)}
        onConfirm={() => {
          if (confirmPending === "deleteAll") {
            handleSeedData("delete");
          } else if (confirmPending === "deleteSelected") {
            handleSeedData("delete", selectedCollections);
          }
          setConfirmPending(null);
        }}
        title={
          confirmPending === "deleteAll"
            ? "Delete all seed data?"
            : `Delete seed data from ${selCount} collection${selCount !== 1 ? "s" : ""}?`
        }
        message={
          confirmPending === "deleteAll"
            ? "This will remove all documents whose IDs match the seed files. Non-seed data is unaffected."
            : `Remove seed documents from: ${selectedCollections.map((c) => COLLECTION_LABELS[c]).join(", ")}.`
        }
        confirmText="Delete"
        isDeleting={loading}
      />
    </div>
  );
}
