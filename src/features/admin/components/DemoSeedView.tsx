"use client";

import { useState } from "react";
import {
  Heading,
  Text,
  Caption,
  Ul,
  Li,
  Div,
  Section,
  BlockHeader,
  Row,
  Stack,
  Grid,
  IndeterminateProgress,
  Span,
  Badge,
  Spinner,
  Progress,
  Button,
} from "@mohasinac/appkit/ui";
import { Card, ConfirmDeleteModal, Checkbox } from "@/components";
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

const { themed } = THEME_CONSTANTS;

const COLLECTION_GROUPS: CollectionGroup[] = [
  {
    label: "Auth & Users",
    emoji: "🔐",
    color: "text-violet-700 dark:text-violet-300",
    headerBg:
      "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800",
    chipBg: `${themed.border} hover:border-violet-300 dark:hover:border-violet-700`,
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
    chipBg: `${themed.border} hover:border-emerald-300 dark:hover:border-emerald-700`,
    chipSelected:
      "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    collections: [
      "stores",
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
    chipBg: `${themed.border} hover:border-sky-300 dark:hover:border-sky-700`,
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
    chipBg: `${themed.border} hover:border-amber-300 dark:hover:border-amber-700`,
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
  stores: "Stores",
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
  addresses: 22,
  sessions: 19,
  stores: 3,
  products: 101,
  orders: 25,
  bids: 73,
  carts: 5,
  coupons: 14,
  payouts: 7,
  reviews: 29,
  blogPosts: 9,
  events: 11,
  eventEntries: 17,
  faqs: 102,
  notifications: 31,
  categories: 23,
  carouselSlides: 6,
  homepageSections: 15,
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
      <Div className={`min-h-screen ${flex.center} p-4`}>
        <Card className="max-w-md w-full p-10 text-center">
          <Div className="text-5xl mb-4">🔒</Div>
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
      </Div>
    );
  }

  return (
    <Div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary} pb-16`}>
      {/* ── Hero Header ── */}
      <Div
        className={`${THEME_CONSTANTS.accentBanner.devHero} px-6 py-10 sm:py-14`}
      >
        <Div className="max-w-5xl mx-auto">
          <Row wrap className="flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Div>
              <Row gap="sm" className="mb-2">
                <Span className="text-4xl">🌱</Span>
                <Heading
                  level={1}
                  variant="none"
                  className={`text-3xl sm:text-4xl font-bold tracking-tight ${THEME_CONSTANTS.accentBanner.devHeroText}`}
                >
                  Seed Data Manager
                </Heading>
              </Row>
              <Text
                variant="none"
                className={`${THEME_CONSTANTS.accentBanner.devHeroTextMuted} text-sm sm:text-base max-w-lg`}
              >
                Load or remove deterministic seed documents from Firestore. All
                operations are ID-scoped — safe alongside real data.
              </Text>
            </Div>
            <Span className="self-start sm:self-auto px-3 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full uppercase tracking-wide shrink-0">
              Dev Only
            </Span>
          </Row>

          {/* Summary chips */}
          <Row wrap gap="md" className="mt-6">
            {COLLECTION_GROUPS.map((g) => {
              const groupItemTotal = g.collections.reduce(
                (sum, col) => sum + SEED_ITEM_COUNTS[col],
                0,
              );
              return (
                <Row
                  key={g.label}
                  gap="xs"
                  className={`px-3 py-1 ${THEME_CONSTANTS.accentBanner.devHeroChipBg} rounded-full text-xs ${THEME_CONSTANTS.accentBanner.devHeroChipText}`}
                >
                  <Span>{g.emoji}</Span>
                  <Span>{g.label}</Span>
                  <Span
                    className={`font-bold ${THEME_CONSTANTS.accentBanner.devHeroChipBoldText}`}
                  >
                    {groupItemTotal}
                  </Span>
                </Row>
              );
            })}
            <Row
              gap="xs"
              className={`px-3 py-1 ${THEME_CONSTANTS.accentBanner.devHeroChipBoldBg} rounded-full text-xs font-semibold ${THEME_CONSTANTS.accentBanner.devHeroChipBoldText}`}
            >
              {ALL_COLLECTIONS.reduce(
                (sum, col) => sum + SEED_ITEM_COUNTS[col],
                0,
              )}{" "}
              docs · {totalCount} collections
            </Row>
          </Row>
        </Div>
      </Div>

      <Stack gap="lg" className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        {/* ── Seed Status Banner ── */}
        <SeedStatusBanner
          statusMap={statusMap}
          statusLoading={statusLoading}
          collections={ALL_COLLECTIONS}
        />

        {/* ── Collection Selector ── */}
        <Card className="p-6">
          <Row wrap className="flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <Div>
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
            </Div>
            <Row gap="sm" className="shrink-0">
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
            </Row>
          </Row>

          <Stack gap="md" className="gap-5">
            {COLLECTION_GROUPS.map((group) => {
              const allGroupSelected = group.collections.every((c) =>
                selectedCollections.includes(c),
              );
              const someGroupSelected = group.collections.some((c) =>
                selectedCollections.includes(c),
              );
              return (
                <Div
                  key={group.label}
                  className={`rounded-xl overflow-hidden border ${themed.border}`}
                >
                  {/* Group header */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => toggleGroup(group)}
                    disabled={isLoading}
                    className={`w-full ${flex.between} px-4 py-3 ${group.headerBg} transition-opacity ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                  >
                    <Row gap="sm">
                      <Span>{group.emoji}</Span>
                      <Span className={`font-semibold text-sm ${group.color}`}>
                        {group.label}
                      </Span>
                      <Span className="text-xs text-zinc-500 dark:text-zinc-400">
                        ({group.collections.length})
                      </Span>
                    </Row>
                    <Row gap="sm">
                      {someGroupSelected && !allGroupSelected && (
                        <Span className="text-xs text-zinc-500 dark:text-zinc-400">
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
                            ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-900"
                            : "bg-zinc-200 dark:bg-slate-700 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {allGroupSelected
                          ? "All on"
                          : someGroupSelected
                            ? "Partial"
                            : "All off"}
                      </Span>
                    </Row>
                  </Button>

                  {/* Group chips */}
                  <Grid
                    gap="sm"
                    className={`p-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${themed.bgPrimary}`}
                  >
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
                        <Div
                          key={col}
                          onClick={() => !isLoading && toggleCollection(col)}
                          onKeyDown={(e) =>
                            e.key === " " && !isLoading && toggleCollection(col)
                          }
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          className={[
                            "flex flex-col gap-1 px-3 py-2.5 rounded-lg border-2 cursor-pointer",
                            "transition-all duration-150 select-none",
                            isSelected ? group.chipSelected : group.chipBg + " text-zinc-700 dark:text-zinc-300",
                            isLoading ? "opacity-50 cursor-not-allowed" : "",
                          ].filter(Boolean).join(" ")}
                        >
                          <Row gap="sm">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleCollection(col)}
                              disabled={isLoading}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <Span className="text-sm font-medium leading-tight">
                              {COLLECTION_LABELS[col]}
                            </Span>
                          </Row>
                          {/* Count row */}
                          {statusLoading ? (
                            <Span className="text-[10px] text-zinc-400 pl-5">
                              checking…
                            </Span>
                          ) : seedCount !== null ? (
                            <Span
                              className={`text-[10px] pl-5 font-medium ${
                                allExist
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : noneExist
                                    ? "text-zinc-400 dark:text-zinc-500"
                                    : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {existingCount}/{seedCount} seeded
                            </Span>
                          ) : null}
                        </Div>
                      );
                    })}
                  </Grid>
                </Div>
              );
            })}
          </Stack>
        </Card>

        {/* ── Actions ── */}
        <Grid cols={2} gap="md">
          {/* Load card */}
          <Card className="p-5 border-2 border-emerald-200 dark:border-emerald-800">
            <Row gap="sm" className="mb-4">
              <Span className="text-xl">📥</Span>
              <Heading
                level={3}
                className={`font-bold text-base ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Load Data
              </Heading>
            </Row>
            <Stack gap="sm">
              <Button
                onClick={() => handleSeedData("load")}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold"
              >
                {isLoading && lastAction === "load" ? (
                  <Row gap="sm" className="justify-center">
                    <Spinner size="sm" variant="white" /> Loading…
                  </Row>
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
            </Stack>
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
            <Row gap="sm" className="mb-4">
              <Span className="text-xl">🗑️</Span>
              <Heading
                level={3}
                className={`font-bold text-base ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Delete Data
              </Heading>
            </Row>
            <Stack gap="sm">
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
            </Stack>
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
        </Grid>

        {/* ── Demo Credentials ── */}
        <Card className="p-5">
          <Row gap="sm" className="mb-4">
            <Span className="text-xl">🔑</Span>
            <Heading
              level={3}
              className={`font-bold text-base ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Demo Credentials
            </Heading>
          </Row>
          <Text size="sm" variant="secondary" className="mb-4">
            All demo accounts use the password{" "}
            <Span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              TempPass123!
            </Span>
          </Text>
          <Grid cols={3} gap="sm">
            {[
              {
                role: "Admin",
                email: "admin@letitrip.in",
                color:
                  "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20",
                badge:
                  "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
                emoji: "👑",
              },
              {
                role: "Moderator",
                email: "moderator@letitrip.in",
                color:
                  "border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20",
                badge:
                  "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
                emoji: "🛡️",
              },
              {
                role: "Seller",
                email: "techhub@letitrip.in",
                color:
                  "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20",
                badge:
                  "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
                emoji: "🏪",
              },
            ].map(({ role, email, color, badge, emoji }) => (
              <Div
                key={role}
                className={`rounded-xl border-2 p-4 flex flex-col gap-2 ${color}`}
              >
                <Row gap="sm">
                  <Span>{emoji}</Span>
                  <Span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}
                  >
                    {role}
                  </Span>
                </Row>
                <Span
                  className={`font-mono text-xs break-all ${THEME_CONSTANTS.themed.textPrimary}`}
                >
                  {email}
                </Span>
              </Div>
            ))}
          </Grid>
        </Card>

        {/* ── Info footer ── */}
        <Div
          className={`rounded-xl border ${themed.border} ${themed.bgSecondary} px-5 py-4`}
        >
          <Caption className="font-semibold uppercase tracking-wider mb-2">
            How it works
          </Caption>
          <Ul
            className={`text-sm ${themed.textSecondary} space-y-1 list-disc list-inside`}
          >
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
              19 users · 101 products (19 auctions) · 73 bids · 102 FAQs · 23
              categories · 3 stores · 532 docs total
            </Li>
          </Ul>
        </Div>
      </Stack>

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
    </Div>
  );
}

// ── Top-level seed status banner ────────────────────────────────────────────
interface SeedStatusBannerProps {
  statusMap: Record<string, { seedCount: number; existingCount: number }>;
  statusLoading: boolean;
  collections: CollectionName[];
}

function SeedStatusBanner({
  statusMap,
  statusLoading,
  collections,
}: SeedStatusBannerProps) {
  const { themed } = THEME_CONSTANTS;

  const totalExpected = collections.reduce(
    (sum, col) => sum + (statusMap[col]?.seedCount ?? SEED_ITEM_COUNTS[col]),
    0,
  );
  const totalSeeded = collections.reduce(
    (sum, col) => sum + (statusMap[col]?.existingCount ?? 0),
    0,
  );
  const totalPending = Math.max(0, totalExpected - totalSeeded);
  const fullySeeded = collections.filter(
    (col) =>
      statusMap[col] &&
      statusMap[col].existingCount > 0 &&
      statusMap[col].existingCount >= statusMap[col].seedCount,
  ).length;
  const emptyCount = collections.filter(
    (col) => statusMap[col] && statusMap[col].existingCount === 0,
  ).length;
  const partialCount = collections.length - fullySeeded - emptyCount;
  const pct =
    totalExpected > 0 ? Math.round((totalSeeded / totalExpected) * 100) : 0;

  const isFullyLoaded =
    !statusLoading && totalSeeded === totalExpected && totalExpected > 0;
  const isFullyEmpty = !statusLoading && totalSeeded === 0 && totalExpected > 0;

  const borderCls = isFullyLoaded
    ? "border-emerald-300 dark:border-emerald-700"
    : isFullyEmpty
      ? "border-zinc-300 dark:border-zinc-700"
      : "border-amber-300 dark:border-amber-700";

  const progressVariant = isFullyLoaded
    ? "success"
    : isFullyEmpty
      ? "primary"
      : "warning";

  return (
    <Section
      aria-label="Seed data status"
      aria-live="polite"
      className={`rounded-2xl border-2 overflow-hidden ${themed.bgPrimary} ${borderCls}`}
    >
      {/* ── Header ── */}
      <BlockHeader
        className={`${THEME_CONSTANTS.flex.between} gap-3 px-5 py-4 border-b ${themed.border} ${themed.bgSecondary}`}
      >
        <Row gap="sm" align="center">
          <Span className="text-xl" aria-hidden="true">
            {isFullyLoaded ? "✅" : isFullyEmpty ? "📭" : "⏳"}
          </Span>
          <Heading
            level={2}
            className={`text-base font-semibold ${themed.textPrimary}`}
          >
            Seed Data Status
          </Heading>
        </Row>

        {statusLoading ? (
          <Row
            gap="xs"
            align="center"
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            <Spinner size="sm" />
            <Span>Checking…</Span>
          </Row>
        ) : (
          <Badge
            variant={
              isFullyLoaded ? "success" : isFullyEmpty ? "secondary" : "warning"
            }
            className="text-xs font-semibold"
          >
            {isFullyLoaded
              ? "Fully seeded"
              : isFullyEmpty
                ? "Not seeded"
                : `${pct}% seeded`}
          </Badge>
        )}
      </BlockHeader>

      {/* ── Body ── */}
      <Stack gap="sm" className="p-5">
        {/* Progress bar */}
        {statusLoading ? (
          <IndeterminateProgress size="sm" className="rounded-full" />
        ) : (
          <Progress
            value={pct}
            variant={progressVariant}
            size="sm"
            label={`${totalSeeded.toLocaleString()} / ${totalExpected.toLocaleString()} documents seeded`}
            showValue
          />
        )}

        {/* ── Stat grid ── */}
        <Grid cols={4} gap="sm">
          <SeedStatTile
            label="Seeded"
            sub="docs in DB"
            loading={statusLoading}
            value={totalSeeded}
            accent={
              totalSeeded > 0
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : undefined
            }
          />

          <SeedStatTile
            label="Pending"
            sub="not yet loaded"
            loading={statusLoading}
            value={totalPending}
            accent={
              totalPending > 0
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                : undefined
            }
          />

          <SeedStatTile
            label="Expected"
            sub="in seed files"
            loading={statusLoading}
            value={totalExpected}
          />

          {/* Collections breakdown tile */}
          <Div
            className={`rounded-xl px-4 py-3 border ${themed.bgSecondary} ${themed.border}`}
          >
            <Caption className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 dark:text-zinc-400">
              Collections
            </Caption>
            {statusLoading ? (
              <Div className="h-6 w-20 mt-1 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <Row
                gap="xs"
                wrap
                align="baseline"
                className="mt-1 min-h-[1.75rem]"
              >
                {fullySeeded > 0 && (
                  <Span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {fullySeeded}
                    <Span className="text-[10px] font-normal ml-0.5">✓</Span>
                  </Span>
                )}
                {partialCount > 0 && (
                  <Span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {partialCount}
                    <Span className="text-[10px] font-normal ml-0.5">~</Span>
                  </Span>
                )}
                {emptyCount > 0 && (
                  <Span className="text-sm font-bold text-zinc-400 dark:text-zinc-500">
                    {emptyCount}
                    <Span className="text-[10px] font-normal ml-0.5">✗</Span>
                  </Span>
                )}
              </Row>
            )}
            <Caption className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              full · partial · empty
            </Caption>
          </Div>
        </Grid>
      </Stack>
    </Section>
  );
}

// ── Stat tile used inside the banner grid ─────────────────────────────────────
interface SeedStatTileProps {
  label: string;
  sub: string;
  value: number;
  loading: boolean;
  accent?: string;
}

function SeedStatTile({
  label,
  sub,
  value,
  loading,
  accent,
}: SeedStatTileProps) {
  const { themed } = THEME_CONSTANTS;
  const tileBase = `rounded-xl px-4 py-3 border`;
  const tileCls = accent
    ? `${tileBase} ${accent}`
    : `${tileBase} ${themed.bgSecondary} ${themed.border}`;
  const valueCls = accent
    ? `text-2xl font-bold`
    : `text-2xl font-bold ${themed.textPrimary}`;

  return (
    <Div className={tileCls}>
      <Caption className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </Caption>
      {loading ? (
        <Div className="h-7 w-14 mt-1 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      ) : (
        <Span className={valueCls}>{value.toLocaleString()}</Span>
      )}
      <Caption className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
        {sub}
      </Caption>
    </Div>
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
      <Row gap="sm" className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        <Spinner size="sm" />
        <Span>{action === "load" ? "Loading" : "Deleting"} seed data…</Span>
      </Row>
    );
  }

  if (!result) return null;

  const { success, message, details } = result;

  return (
    <Div
      className={`mt-4 rounded-lg px-4 py-3 text-sm border ${
        success
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      }`}
    >
      <Row gap="sm" align="start">
        <Span className="shrink-0">{success ? "✅" : "❌"}</Span>
        <Div className="min-w-0">
          <Span className="font-medium block">{message}</Span>
          {details && (
            <Row wrap gap="sm" className="mt-1.5 gap-x-4 gap-y-1">
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
                  <Row wrap gap="px" className="w-full mt-1">
                    {(details.collections as string[]).map((col: string) => (
                      <Badge key={col} variant="info" className="text-[10px]">
                        {col}
                      </Badge>
                    ))}
                  </Row>
                )}
            </Row>
          )}
        </Div>
      </Row>
    </Div>
  );
}
