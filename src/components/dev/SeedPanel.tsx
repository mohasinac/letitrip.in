"use client";

/**
 * SeedPanel — Dev-only UI for loading / deleting seed data via the demo seed server action.
 *
 * Route: /[locale]/demo/seed
 * Features: Builder pattern (select collections), light/dark mode, user credentials display
 */

import React, { useState, useTransition, useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Grid,
  Heading,
  Row,
  Section,
  Stack,
  Text,
  Div,
} from "@mohasinac/appkit/client";
import { THEME_CONSTANTS, API_ROUTES } from "@/constants";
import { Spinner } from "@mohasinac/appkit/ui";
import { demoSeedAction } from "@/actions/demo-seed.actions";
import type { SeedCollectionName, SeedOperationResult } from "@/actions/demo-seed.types";

// Core content — seeded first (dependencies for others)
const CORE_COLLECTIONS: SeedCollectionName[] = [
  "users",
  "addresses",
  "stores",
  "brands",
  "categories",
  "products",
];

// Transactional — depend on users + products
const TRANSACTIONAL_COLLECTIONS: SeedCollectionName[] = [
  "orders",
  "bids",
  "carts",
  "wishlists",
  "coupons",
  "reviews",
  "payouts",
];

// Content & marketing
const CONTENT_COLLECTIONS: SeedCollectionName[] = [
  "blogPosts",
  "events",
  "eventEntries",
  "carouselSlides",
  "homepageSections",
  "faqs",
];

// System / configuration
const SYSTEM_COLLECTIONS: SeedCollectionName[] = [
  "notifications",
  "sessions",
  "siteSettings",
  "storeAddresses",
];

// Default pre-selected: core + transactional + content (skip system)
const DEFAULT_SELECTED: SeedCollectionName[] = [
  ...CORE_COLLECTIONS,
  ...TRANSACTIONAL_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
];

type SeedCollectionStatus = {
  name: SeedCollectionName;
  seedCount: number;
  existingCount: number;
};

type SeededUser = {
  email: string;
  password: string;
  role: string;
  userId?: string;
};

export function SeedPanel() {
  const [isPending, startTransition] = useTransition();
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [result, setResult] = useState<SeedOperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) {
      setElapsedSecs(0);
      elapsedRef.current = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isPending]);

  const [status, setStatus] = useState<SeedCollectionStatus[]>([]);
  const [dryRun, setDryRun] = useState<boolean>(true);
  const [selectedCollections, setSelectedCollections] = useState<Set<SeedCollectionName>>(
    new Set(DEFAULT_SELECTED)
  );
  const [seededUsers, setSeededUsers] = useState<SeededUser[]>([]);

  const ALL_COLLECTIONS: SeedCollectionName[] = [
    ...CORE_COLLECTIONS,
    ...TRANSACTIONAL_COLLECTIONS,
    ...CONTENT_COLLECTIONS,
    ...SYSTEM_COLLECTIONS,
  ];

  const collectionLabel: Record<string, string> = {
    users: "Users",
    addresses: "Addresses",
    stores: "Stores",
    categories: "Categories",
    products: "Products",
    orders: "Orders",
    bids: "Bids",
    carts: "Carts",
    wishlists: "Wishlists",
    coupons: "Coupons",
    reviews: "Reviews",
    payouts: "Payouts",
    blogPosts: "Blog Posts",
    events: "Events",
    eventEntries: "Event Entries",
    carouselSlides: "Carousel Slides",
    homepageSections: "Homepage Sections",
    faqs: "FAQs",
    notifications: "Notifications",
    sessions: "Sessions",
    siteSettings: "Site Settings",
    storeAddresses: "Store Addresses",
  };

  const getCollectionStatus = (col: SeedCollectionName) =>
    status.find((s) => s.name === col);

  function CollectionRow({ col }: { col: SeedCollectionName }) {
    const st = getCollectionStatus(col);
    const seeded = st?.existingCount ?? 0;
    const total = st?.seedCount ?? 0;
    const pct = total > 0 ? Math.round((seeded / total) * 100) : 0;
    const allSeeded = total > 0 && seeded >= total;
    const noneSeeded = seeded === 0;
    return (
      <Div className="flex items-center gap-2 min-w-0">
        <Checkbox
          id={`col-${col}`}
          checked={selectedCollections.has(col)}
          onChange={() => toggleCollection(col)}
          disabled={isPending}
          label={
            <Div className="flex items-center gap-1.5 min-w-0">
              <Text className="text-sm text-zinc-800 dark:text-slate-200 leading-snug truncate">
                {collectionLabel[col] ?? col}
              </Text>
              {isLoadingStatus ? (
                <Text className="text-[0.65rem] text-zinc-400 shrink-0">…</Text>
              ) : st ? (
                <Text
                  className={`text-[0.65rem] font-mono shrink-0 px-1 rounded ${
                    allSeeded
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
                      : noneSeeded
                      ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                      : "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
                  }`}
                >
                  {seeded}/{total}
                  {total > 0 && !allSeeded && ` (${pct}%)`}
                </Text>
              ) : null}
            </Div>
          }
        />
      </Div>
    );
  }

  const toggleCollection = (col: SeedCollectionName) => {
    const newSet = new Set(selectedCollections);
    if (newSet.has(col)) {
      newSet.delete(col);
    } else {
      newSet.add(col);
    }
    setSelectedCollections(newSet);
  };

  const selectAll = () => setSelectedCollections(new Set(ALL_COLLECTIONS));
  const deselectAll = () => setSelectedCollections(new Set());

  React.useEffect(() => {
    const fetchStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const response = await fetch(API_ROUTES.DEMO.SEED, { method: "GET" });
        const payload = await response.json();
        const collections = (payload?.data?.collections ?? []) as SeedCollectionStatus[];
        setStatus(collections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch seed status");
      } finally {
        setIsLoadingStatus(false);
      }
    };
    void fetchStatus();
  }, []);

  function run(action: "load" | "delete") {
    setResult(null);
    setError(null);
    setSeededUsers([]);
    setLoadingMessage(
      action === "load"
        ? `Seeding ${selectedCollections.size} collection${selectedCollections.size !== 1 ? "s" : ""}…`
        : `Removing seed data from ${selectedCollections.size} collection${selectedCollections.size !== 1 ? "s" : ""}…`
    );
    startTransition(async () => {
      try {
        const collectionsToRun = Array.from(selectedCollections);
        if (collectionsToRun.length === 0) {
          setError("Please select at least one collection to seed");
          return;
        }

        const res = await demoSeedAction({
          action,
          collections: collectionsToRun as SeedCollectionName[],
          dryRun,
        });
        setResult(res);

        if (res.details && "seedDetails" in res.details) {
          const details = (res.details as Record<string, unknown>)?.seedDetails as
            | { users?: Array<{ email: string; password: string; role: string; id?: string }> }
            | undefined;
          if (details?.users) {
            setSeededUsers(
              details.users.map((u) => ({
                email: u.email,
                password: u.password,
                role: u.role,
                userId: u.id,
              }))
            );
          }
        }

        const response = await fetch(API_ROUTES.DEMO.SEED, { method: "GET" });
        const payload = await response.json();
        const collections = (payload?.data?.collections ?? []) as SeedCollectionStatus[];
        setStatus(collections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  }

  const isWorking = isPending || isLoadingStatus;

  return (
    <>
      {/* ── Loading overlay ── */}
      {isWorking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={loadingMessage || "Loading…"}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/65 backdrop-blur ${THEME_CONSTANTS.spacing.gap.md}`}
        >
          <Spinner size="xl" variant="pokeball" label={loadingMessage || "Loading…"} />
          <Div className="text-center px-6">
            <Text className="text-white font-bold text-lg leading-snug">
              {isPending ? loadingMessage : "Loading status…"}
            </Text>
            {isPending && (
              <Text className="text-white/70 text-sm mt-1">
                {elapsedSecs < 5
                  ? "Starting up…"
                  : elapsedSecs < 15
                  ? `${elapsedSecs}s — writing collections…`
                  : elapsedSecs < 35
                  ? `${elapsedSecs}s — seeding products & users…`
                  : `${elapsedSecs}s — almost done, hang tight…`}
              </Text>
            )}
          </Div>
        </div>
      )}

      <Section className="min-h-screen bg-white dark:bg-slate-950 text-zinc-900 dark:text-white py-8">
      <Container size="2xl">
        <Stack gap="lg">

          {/* Header */}
          <Stack gap="sm" className="items-center text-center">
            <Text className="text-5xl">🎮</Text>
            <Heading level={1} className="text-amber-600 dark:text-amber-400 text-3xl font-extrabold">
              LetItRip Demo Seed
            </Heading>
            <Text className="text-zinc-700 dark:text-slate-300">
              Dev seed tool — builder pattern with collection selection
            </Text>
            <Badge variant="danger">DEV ONLY — Not available in production</Badge>
          </Stack>

          {/* Collection Builder */}
          <Div className="rounded-xl p-6 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
            <Stack gap="md">
              <Stack gap="sm">
                <Row justify="between" className="items-center">
                  <Heading level={2} className="text-lg font-bold text-zinc-900 dark:text-white mt-0">
                    📋 Select Collections to Seed
                  </Heading>
                  <Row gap="sm">
                    <Button size="sm" variant="outline" onClick={selectAll} disabled={isPending}>
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={deselectAll} disabled={isPending}>
                      Clear All
                    </Button>
                  </Row>
                </Row>
                <Div className="flex flex-wrap gap-3 items-center">
                  <Text className="text-xs text-zinc-600 dark:text-slate-300">
                    {selectedCollections.size} of {ALL_COLLECTIONS.length} selected
                    {selectedCollections.size === DEFAULT_SELECTED.length && selectedCollections.size < ALL_COLLECTIONS.length
                      ? " (system excluded by default)"
                      : ""}
                  </Text>
                  {status.length > 0 && (
                    <Text className="text-xs font-mono text-zinc-500 dark:text-slate-400">
                      DB:{" "}
                      {(() => {
                        const seeded = status.reduce((a, s) => a + s.existingCount, 0);
                        const total = status.reduce((a, s) => a + s.seedCount, 0);
                        const pct = total > 0 ? Math.round((seeded / total) * 100) : 0;
                        const allDone = seeded >= total;
                        return (
                          <span className={allDone ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {seeded}/{total} docs ({pct}% seeded)
                          </span>
                        );
                      })()}
                    </Text>
                  )}
                </Div>
              </Stack>

              {/* Core Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-zinc-800 dark:text-slate-200">
                  🗂️ Core — users, stores, categories, products, addresses
                </Text>
                <Grid cols={2} gap="sm" className={THEME_CONSTANTS.grid.cols3}>
                  {CORE_COLLECTIONS.map((col) => <CollectionRow key={col} col={col} />)}
                </Grid>
              </Stack>

              {/* Transactional Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-zinc-800 dark:text-slate-200">
                  🛒 Transactional — orders, bids, carts, wishlists, coupons, reviews, payouts
                </Text>
                <Grid cols={2} gap="sm" className={THEME_CONSTANTS.grid.cols3}>
                  {TRANSACTIONAL_COLLECTIONS.map((col) => <CollectionRow key={col} col={col} />)}
                </Grid>
              </Stack>

              {/* Content Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-zinc-800 dark:text-slate-200">
                  📣 Content — blog, events, carousel, homepage, FAQs
                </Text>
                <Grid cols={2} gap="sm" className={THEME_CONSTANTS.grid.cols3}>
                  {CONTENT_COLLECTIONS.map((col) => <CollectionRow key={col} col={col} />)}
                </Grid>
              </Stack>

              {/* System Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-zinc-800 dark:text-slate-200">
                  ⚙️ System — notifications, sessions, site settings, store addresses
                </Text>
                <Grid cols={2} gap="sm" className={THEME_CONSTANTS.grid.cols3}>
                  {SYSTEM_COLLECTIONS.map((col) => <CollectionRow key={col} col={col} />)}
                </Grid>
              </Stack>
            </Stack>
          </Div>

          {/* Controls */}
          <Stack gap="sm">
            <Row justify="center" className={`flex-wrap ${THEME_CONSTANTS.spacing.gap.md}`}>
              <Checkbox
                label={
                  <Text className="text-sm text-zinc-800 dark:text-slate-200">
                    Dry Run (preview only)
                  </Text>
                }
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                disabled={isPending || isLoadingStatus}
              />
            </Row>

            <Row gap="md" justify="center" className="flex-wrap">
              <Button
                variant="primary"
                size="lg"
                isLoading={isPending}
                onClick={() => run("load")}
                disabled={isPending || selectedCollections.size === 0}
              >
                {dryRun ? "⚡ Dry Run Add Seed" : "⚡ Add / Upsert Seed Data"}
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={() => run("delete")}
                disabled={isPending || selectedCollections.size === 0}
              >
                {dryRun ? "🗑️ Dry Run Remove Seed" : "🗑️ Remove Seed Data"}
              </Button>
            </Row>
          </Stack>

          {/* Error */}
          {error && (
            <Container size="lg">
              <Stack gap="xs" className="rounded-xl p-4 bg-red-100 dark:bg-red-500/15 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-300">
                <Text className="font-semibold">❌ Error</Text>
                <Text>{error}</Text>
              </Stack>
            </Container>
          )}

          {/* Result with Credentials */}
          {result && (
            <Container size="lg">
              <Stack gap="sm" className="rounded-xl p-4 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500">
                <Text className="font-bold text-emerald-700 dark:text-emerald-300">
                  ✅ {result.success
                    ? result.details?.dryRun ? "Dry Run Complete" : "Success"
                    : "Completed with errors"}
                </Text>

                {/* Seeded Users - Credentials */}
                {seededUsers.length > 0 && !result.details?.dryRun && (
                  <Stack gap="sm" className="mt-4 p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-emerald-200 dark:border-emerald-600/50">
                    <Heading level={3} className="text-base font-bold text-zinc-900 dark:text-white mt-0">
                      👥 Generated User Credentials
                    </Heading>
                    <Text className="text-sm text-zinc-600 dark:text-slate-300 mb-2">
                      Copy these credentials to test different roles:
                    </Text>
                    <Stack gap="xs">
                      {seededUsers.map((user, idx) => (
                        <Div
                          key={idx}
                          className="p-3 bg-zinc-50 dark:bg-slate-800 rounded border border-zinc-200 dark:border-slate-700 font-mono text-xs"
                        >
                          <Stack gap="xs" className="space-y-0.5">
                            <Row justify="between" className="items-start">
                              <Text className="text-zinc-600 dark:text-slate-400">Email:</Text>
                              <Text className="text-zinc-900 dark:text-white font-semibold">{user.email}</Text>
                            </Row>
                            <Row justify="between" className="items-start">
                              <Text className="text-zinc-600 dark:text-slate-400">Password:</Text>
                              <Text className="text-zinc-900 dark:text-white font-semibold select-all">{user.password}</Text>
                            </Row>
                            <Row justify="between" className="items-start">
                              <Text className="text-zinc-600 dark:text-slate-400">Role:</Text>
                              <Badge variant={user.role === "admin" ? "danger" : user.role === "seller" ? "warning" : "success"}>
                                {user.role.toUpperCase()}
                              </Badge>
                            </Row>
                            {user.userId && (
                              <Row justify="between" className="items-start">
                                <Text className="text-zinc-600 dark:text-slate-400">User ID:</Text>
                                <Text className="text-zinc-900 dark:text-white text-[0.7rem] truncate">{user.userId}</Text>
                              </Row>
                            )}
                          </Stack>
                        </Div>
                      ))}
                    </Stack>
                  </Stack>
                )}

                {/* Collection Plans */}
                {result.details?.collectionPlans && (
                  <Stack gap="xs">
                    <Text className="font-semibold text-emerald-700 dark:text-emerald-300">Collection Plans:</Text>
                    {result.details.collectionPlans.map((plan) => (
                      <Text key={plan.name} className="text-xs text-emerald-600 dark:text-emerald-400">
                        <strong>{plan.name}</strong>: seed={plan.seedCount}, existing={plan.existingCount}, wouldCreate={plan.wouldCreate ?? 0}, wouldDelete={plan.wouldDelete ?? 0}, wouldSkip={plan.wouldSkip ?? 0}
                      </Text>
                    ))}
                  </Stack>
                )}

                {/* Full Result JSON */}
                <details className="mt-4 p-3 bg-zinc-50 dark:bg-slate-800 rounded border border-zinc-200 dark:border-slate-700">
                  <summary className="font-semibold text-zinc-700 dark:text-slate-300 cursor-pointer hover:text-zinc-900 dark:hover:text-white">
                    📄 Full Response JSON
                  </summary>
                  <pre className="text-xs text-zinc-600 dark:text-slate-400 whitespace-pre-wrap break-words m-2 max-h-64 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </Stack>
            </Container>
          )}

          {/* What Gets Seeded */}
          <Stack gap="sm" className="rounded-xl p-6 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
            <Heading level={3} className="text-amber-600 dark:text-amber-400 mt-0">📦 What Gets Seeded</Heading>
            <Stack gap="xs" className="text-zinc-700 dark:text-slate-400 leading-loose text-sm">
              <Text>
                <strong className="text-zinc-900 dark:text-slate-200">7 Franchises</strong> — Pokémon TCG, Hot Wheels, Beyblade Burst, Transformers, Anime Figures, Retro Gaming, and Cosplay Accessories — each with dedicated stores, products, and reviews.
              </Text>
              <Text>
                <strong className="text-zinc-900 dark:text-slate-200">8 Stores</strong> — Misty's Water Cards, Surge's Electric Emporium, Blaine's Fire Shoppe, Speed King Diecast, Bladers' Paradise, Anime Vault India, Retro Vault India, and Cosplay India Hub — each with products, reviews, and payout history.
              </Text>
              <Text>
                <strong className="text-zinc-900 dark:text-slate-200">Live Auctions & Pre-orders</strong> — Active auction listings with bids, pre-order products, and out-of-stock/discontinued items for full lifecycle coverage.
              </Text>
              <Text>
                <strong className="text-zinc-900 dark:text-slate-200">Wishlist + Promotions Coverage</strong> — Seeded wishlist items, promoted products, featured products, active coupons, and homepage-linked merchandising flows.
              </Text>
              <Text>
                <strong className="text-zinc-900 dark:text-slate-200">Admin Ads Coverage</strong> — Site settings include ad placements, consent gating, and sample ad inventory for homepage, listings, and search slots.
              </Text>
              <Text>
                <strong className="text-zinc-900 dark:text-slate-200">Role-Based Credentials</strong> — Admin, seller, and buyer accounts are created and credentials are shown after seeding.
              </Text>
              <Text>
                <strong className="text-zinc-900 dark:text-slate-200">Builder Pattern + Dry Run</strong> — Select exactly which collections to seed; preview plans without writing to the database.
              </Text>
            </Stack>
          </Stack>

        </Stack>
      </Container>
    </Section>
    </>
  );
}
