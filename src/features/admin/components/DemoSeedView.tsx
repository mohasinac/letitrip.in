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
import { useDemoSeed } from "@/features/admin/hooks";
import type { SeedCollectionName } from "@/features/admin/hooks";

type CollectionName = SeedCollectionName;

interface CollectionGroup {
  label: string;
  emoji: string;
  color: string;
  headerBg: string;
  chipBg: string;
  chipSelected: string;
  collections: CollectionName[];
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

/** Expected item counts from the current seed files — used as pre-load reference. */
const SEED_ITEM_COUNTS: Record<CollectionName, number> = {
  users: 19,
  addresses: 23,
  sessions: 19,
  products: 50,
  orders: 25,
  bids: 72,
  carts: 5,
  coupons: 14,
  payouts: 7,
  reviews: 29,
  blogPosts: 9,
  events: 11,
  eventEntries: 17,
  faqs: 103,
  notifications: 31,
  categories: 20,
  carouselSlides: 23,
  homepageSections: 17,
  siteSettings: 1,
};

export function DemoSeedView() {
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionName[]
  >([]);
  const [confirmPending, setConfirmPending] = useState<
    "deleteAll" | "deleteSelected" | null
  >(null);

  const { statusMap, statusLoading, run, isLoading, lastAction, actionResult } =
    useDemoSeed();

  const handleSeedData = (
    action: "load" | "delete",
    collections?: CollectionName[],
  ) => run(action, collections ?? ALL_COLLECTIONS);

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
            {COLLECTION_GROUPS.map((g) => {
              const groupItemTotal = g.collections.reduce(
                (sum, col) => sum + SEED_ITEM_COUNTS[col],
                0,
              );
              return (
                <div
                  key={g.label}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                >
                  <Span>{g.emoji}</Span>
                  <Span>{g.label}</Span>
                  <Span className="font-bold text-white">{groupItemTotal}</Span>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
              {ALL_COLLECTIONS.reduce(
                (sum, col) => sum + SEED_ITEM_COUNTS[col],
                0,
              )}{" "}
              docs · {totalCount} collections
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 mt-8">
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
                disabled={isLoading}
              >
                Select all
              </Button>
              <Button
                onClick={deselectAll}
                variant="outline"
                size="sm"
                disabled={isLoading || selCount === 0}
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
                    disabled={isLoading}
                    className={`w-full ${flex.between} px-4 py-3 ${group.headerBg} transition-opacity ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
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
                      const colStatus = statusMap[col];
                      const seedCount = colStatus?.seedCount ?? null;
                      const existingCount = colStatus?.existingCount ?? null;
                      const allExist =
                        seedCount !== null &&
                        existingCount !== null &&
                        existingCount === seedCount &&
                        seedCount > 0;
                      const noneExist =
                        existingCount !== null && existingCount === 0;
                      return (
                        <div
                          key={col}
                          onClick={() => !isLoading && toggleCollection(col)}
                          onKeyDown={(e) =>
                            e.key === " " && !isLoading && toggleCollection(col)
                          }
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          className={`
                            flex flex-col gap-1 px-3 py-2.5 rounded-lg border-2 cursor-pointer
                            transition-all duration-150 select-none
                            ${isSelected ? group.chipSelected : group.chipBg + " text-gray-700 dark:text-gray-300"}
                            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleCollection(col)}
                              disabled={isLoading}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <Span className="text-sm font-medium leading-tight">
                              {COLLECTION_LABELS[col]}
                            </Span>
                          </div>
                          {/* Count row */}
                          {statusLoading ? (
                            <Span className="text-[10px] text-gray-400 pl-5">
                              checking…
                            </Span>
                          ) : seedCount !== null ? (
                            <Span
                              className={`text-[10px] pl-5 font-medium ${
                                allExist
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : noneExist
                                    ? "text-gray-400 dark:text-gray-500"
                                    : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {existingCount}/{seedCount} seeded
                            </Span>
                          ) : null}
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
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold"
              >
                {isLoading && lastAction === "load" ? (
                  <Span className={`${flex.center} gap-2`}>
                    <Spinner size="sm" variant="white" /> Loading…
                  </Span>
                ) : (
                  "Load All Collections"
                )}
              </Button>
              <Button
                onClick={() => handleSeedData("load", selectedCollections)}
                disabled={isLoading || selCount === 0}
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
            <LoadDeleteStatus
              isLoading={isLoading && lastAction === "load"}
              result={lastAction === "load" ? actionResult : null}
              action="load"
            />
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
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold"
              >
                Delete All Collections
              </Button>
              <Button
                onClick={() => setConfirmPending("deleteSelected")}
                disabled={isLoading || selCount === 0}
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
            <LoadDeleteStatus
              isLoading={isLoading && lastAction === "delete"}
              result={lastAction === "delete" ? actionResult : null}
              action="delete"
            />
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
            <Li>
              FAQs use generated IDs (
              <Span className="font-mono text-xs">
                faq-{"{category}"}-{"{question-slug}"}
              </Span>
              ) — not stored directly in the seed file
            </Li>
            <Li>
              Site Settings is a singleton stored at{" "}
              <Span className="font-mono text-xs">siteSettings/global</Span>
            </Li>
            <Li>
              Demo users are created with password{" "}
              <Span className="font-mono text-xs">TempPass123!</Span>
            </Li>
            <Li>
              19 users · 50 products (20 auctions) · 72 bids · 103 FAQs · 20
              categories · 479 docs total
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
        isDeleting={isLoading}
      />
    </div>
  );
}

// ── Inline status panel rendered below action buttons ───────────────────────
interface LoadDeleteStatusProps {
  isLoading: boolean;
  result: {
    success: boolean;
    message: string;
    details?: Record<string, any>;
  } | null;
  action: "load" | "delete";
}

function LoadDeleteStatus({
  isLoading,
  result,
  action,
}: LoadDeleteStatusProps) {
  if (!isLoading && !result) return null;

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner size="sm" />
        <Span>{action === "load" ? "Loading" : "Deleting"} seed data…</Span>
      </div>
    );
  }

  if (!result) return null;

  const { success, message, details } = result;

  return (
    <div
      className={`mt-4 rounded-lg px-4 py-3 text-sm border ${
        success
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      }`}
    >
      <div className="flex items-start gap-2">
        <Span className="shrink-0">{success ? "✅" : "❌"}</Span>
        <div className="min-w-0">
          <Span className="font-medium block">{message}</Span>
          {details && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              {details.created != null && details.created > 0 && (
                <Span className="text-xs">
                  <Span className="font-bold">{details.created}</Span> created
                </Span>
              )}
              {details.updated != null && details.updated > 0 && (
                <Span className="text-xs">
                  <Span className="font-bold">{details.updated}</Span> updated
                </Span>
              )}
              {details.deleted != null && details.deleted > 0 && (
                <Span className="text-xs">
                  <Span className="font-bold">{details.deleted}</Span> deleted
                </Span>
              )}
              {details.skipped != null && details.skipped > 0 && (
                <Span className="text-xs">
                  <Span className="font-bold">{details.skipped}</Span> skipped
                </Span>
              )}
              {details.errors != null && details.errors > 0 && (
                <Span className="text-xs text-orange-600 dark:text-orange-400">
                  <Span className="font-bold">{details.errors}</Span> errors
                </Span>
              )}
              {Array.isArray(details.collections) &&
                details.collections.length > 0 && (
                  <div className="w-full flex flex-wrap gap-1 mt-1">
                    {(details.collections as string[]).map((col: string) => (
                      <Badge key={col} variant="info" className="text-[10px]">
                        {col}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
