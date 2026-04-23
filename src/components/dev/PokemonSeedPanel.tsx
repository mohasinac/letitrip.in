"use client";

/**
 * PokemonSeedPanel — Dev-only UI for loading / deleting the
 * Pokémon Base Set 151 themed seed data via the demo seed server action.
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
  MediaImage,
} from "@mohasinac/appkit/client";
import { Spinner } from "@mohasinac/appkit/ui";
import { demoSeedAction } from "@/actions/demo-seed.actions";
import type { SeedCollectionName, SeedOperationResult } from "@/actions/demo-seed.types";

// Core content — seeded first (dependencies for others)
const CORE_COLLECTIONS: SeedCollectionName[] = [
  "users",
  "addresses",
  "stores",
  "categories",
  "products",
];

// Transactional — depend on users + products
const TRANSACTIONAL_COLLECTIONS: SeedCollectionName[] = [
  "orders",
  "bids",
  "carts",
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

const CARD_IMG = (n: number) =>
  `https://images.pokemontcg.io/base1/${n}_hires.png`;

const FEATURED_CARDS = [
  { num: 4, name: "Charizard #4", rarity: "Holo Rare", price: "₹89,999" },
  { num: 2, name: "Blastoise #2", rarity: "Holo Rare", price: "₹34,999" },
  { num: 10, name: "Mewtwo #10", rarity: "Holo Rare", price: "₹19,999" },
  { num: 16, name: "Zapdos #16", rarity: "Holo Rare", price: "₹12,999" },
  { num: 58, name: "Pikachu #58", rarity: "Common", price: "₹1,999" },
  { num: 15, name: "Venusaur #15", rarity: "Holo Rare", price: "₹14,999" },
];

export function PokemonSeedPanel() {
  const [isPending, startTransition] = useTransition();
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [result, setResult] = useState<SeedOperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start / stop elapsed timer whenever a long operation is pending
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
    stores: "Stores (PokéVault Cards, Trainer's Closet, Prof. Oak's)",
    categories: "Categories (TCG, Figures, Apparel)",
    products: "Products (101 Pokémon — TCG, figures, auctions, pre-orders)",
    orders: "Orders",
    bids: "Bids / Auctions",
    carts: "Carts",
    coupons: "Coupons (POKEFEST15, TRAINERS-CLOSET10, PROF-OAKS15)",
    reviews: "Reviews",
    payouts: "Payouts",
    blogPosts: "Blog Posts (PokéFest, TCG guide, March auctions)",
    events: "Events (PokéFest 2026)",
    eventEntries: "Event Entries",
    carouselSlides: "Carousel Slides",
    homepageSections: "Homepage Sections",
    faqs: "FAQs",
    notifications: "Notifications",
    sessions: "Sessions",
    siteSettings: "Site Settings",
    storeAddresses: "Store Addresses",
  };

  const toggleCollection = (col: SeedCollectionName) => {
    const newSet = new Set(selectedCollections);
    if (newSet.has(col)) {
      newSet.delete(col);
    } else {
      newSet.add(col);
    }
    setSelectedCollections(newSet);
  };

  const selectAll = () => {
    setSelectedCollections(new Set(ALL_COLLECTIONS));
  };

  const deselectAll = () => {
    setSelectedCollections(new Set());
  };

  React.useEffect(() => {
    const fetchStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const response = await fetch("/api/demo/seed", { method: "GET" });
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

        // Extract seeded users if present in result
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

        const response = await fetch("/api/demo/seed", { method: "GET" });
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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        >
          <Spinner size="xl" variant="pokeball" label={loadingMessage || "Loading…"} />
          <div className="text-center px-6">
            <p className="text-white font-bold text-lg leading-snug">
              {isPending ? loadingMessage : "Loading status…"}
            </p>
            {isPending && (
              <p className="text-white/70 text-sm mt-1">
                {elapsedSecs < 5
                  ? "Starting up…"
                  : elapsedSecs < 15
                  ? `${elapsedSecs}s — writing collections…`
                  : elapsedSecs < 35
                  ? `${elapsedSecs}s — seeding products & users…`
                  : `${elapsedSecs}s — almost done, hang tight…`}
              </p>
            )}
          </div>
        </div>
      )}

      <Section className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f3460] text-gray-900 dark:text-white py-8">
      <Container size="2xl">
        <Stack gap="lg">

          {/* Header */}
          <Stack gap="sm" className="items-center text-center">
            <Text className="text-5xl">🃏</Text>
            <Heading level={1} className="text-amber-600 dark:text-[#FFCB05] text-3xl font-extrabold">
              Pokémon Base Set 151
            </Heading>
            <Text className="text-gray-700 dark:text-slate-300">
              Dev seed tool — builder pattern with collection selection
            </Text>
            <Badge variant="danger">DEV ONLY — Not available in production</Badge>
          </Stack>

          {/* Collection Builder */}
          <Div className="rounded-xl p-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <Stack gap="md">
              <Stack gap="sm">
                <Row justify="between" className="items-center">
                  <Heading level={2} className="text-lg font-bold text-gray-900 dark:text-white mt-0">
                    📋 Select Collections to Seed
                  </Heading>
                  <Row gap="sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAll}
                      disabled={isPending}
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={deselectAll}
                      disabled={isPending}
                    >
                      Clear All
                    </Button>
                  </Row>
                </Row>
                <Text className="text-xs text-gray-600 dark:text-slate-300">
                  {selectedCollections.size} of {ALL_COLLECTIONS.length} selected
                  {selectedCollections.size === DEFAULT_SELECTED.length && selectedCollections.size < ALL_COLLECTIONS.length
                    ? " (system collections excluded by default)"
                    : ""}
                </Text>
              </Stack>

              {/* Core Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-gray-800 dark:text-slate-200">
                  🗂️ Core (users, stores, categories, products, addresses)
                </Text>
                <Grid cols={2} gap="sm" className="md:grid-cols-3 lg:grid-cols-4">
                  {CORE_COLLECTIONS.map((col) => (
                    <Div key={col} className="flex items-center">
                      <Checkbox
                        id={`col-${col}`}
                        checked={selectedCollections.has(col)}
                        onChange={() => toggleCollection(col)}
                        disabled={isPending}
                        label={
                          <Text className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                            {collectionLabel[col] ?? col}
                          </Text>
                        }
                      />
                    </Div>
                  ))}
                </Grid>
              </Stack>

              {/* Transactional Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-gray-800 dark:text-slate-200">
                  🛒 Transactional (orders, bids, carts, coupons, reviews, payouts)
                </Text>
                <Grid cols={2} gap="sm" className="md:grid-cols-3 lg:grid-cols-4">
                  {TRANSACTIONAL_COLLECTIONS.map((col) => (
                    <Div key={col} className="flex items-center">
                      <Checkbox
                        id={`col-${col}`}
                        checked={selectedCollections.has(col)}
                        onChange={() => toggleCollection(col)}
                        disabled={isPending}
                        label={
                          <Text className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                            {collectionLabel[col] ?? col}
                          </Text>
                        }
                      />
                    </Div>
                  ))}
                </Grid>
              </Stack>

              {/* Content Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-gray-800 dark:text-slate-200">
                  📣 Content (blog, events, carousel, homepage, FAQs)
                </Text>
                <Grid cols={2} gap="sm" className="md:grid-cols-3 lg:grid-cols-4">
                  {CONTENT_COLLECTIONS.map((col) => (
                    <Div key={col} className="flex items-center">
                      <Checkbox
                        id={`col-${col}`}
                        checked={selectedCollections.has(col)}
                        onChange={() => toggleCollection(col)}
                        disabled={isPending}
                        label={
                          <Text className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                            {collectionLabel[col] ?? col}
                          </Text>
                        }
                      />
                    </Div>
                  ))}
                </Grid>
              </Stack>

              {/* System Collections */}
              <Stack gap="sm">
                <Text className="font-semibold text-sm text-gray-800 dark:text-slate-200">
                  ⚙️ System (notifications, sessions, site settings, store addresses)
                </Text>
                <Grid cols={2} gap="sm" className="md:grid-cols-3 lg:grid-cols-4">
                  {SYSTEM_COLLECTIONS.map((col) => (
                    <Div key={col} className="flex items-center">
                      <Checkbox
                        id={`col-${col}`}
                        checked={selectedCollections.has(col)}
                        onChange={() => toggleCollection(col)}
                        disabled={isPending}
                        label={
                          <Text className="text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                            {collectionLabel[col] ?? col}
                          </Text>
                        }
                      />
                    </Div>
                  ))}
                </Grid>
              </Stack>
            </Stack>
          </Div>

          {/* Controls */}
          <Stack gap="sm">
            <Row justify="center" className="flex-wrap gap-4">
              <Checkbox
                label={
                  <Text className="text-sm text-gray-800 dark:text-slate-200">
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
              <Stack gap="sm" className="rounded-xl p-4 bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500">
                <Text className="font-bold text-green-700 dark:text-green-300">
                  ✅ {result.success
                    ? result.details?.dryRun ? "Dry Run Complete" : "Success"
                    : "Completed with errors"}
                </Text>

                {/* Seeded Users - Credentials */}
                {seededUsers.length > 0 && !result.details?.dryRun && (
                  <Stack gap="sm" className="mt-4 p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-green-200 dark:border-green-600/50">
                    <Heading level={3} className="text-base font-bold text-gray-900 dark:text-white mt-0">
                      👥 Generated User Credentials
                    </Heading>
                    <Text className="text-sm text-gray-600 dark:text-slate-300 mb-2">
                      Copy these credentials to test different roles:
                    </Text>
                    <Stack gap="xs">
                      {seededUsers.map((user, idx) => (
                        <Div
                          key={idx}
                          className="p-3 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-xs"
                        >
                          <Stack gap="xs" className="space-y-0.5">
                            <Row justify="between" className="items-start">
                              <Text className="text-gray-600 dark:text-slate-400">Email:</Text>
                              <Text className="text-gray-900 dark:text-white font-semibold">{user.email}</Text>
                            </Row>
                            <Row justify="between" className="items-start">
                              <Text className="text-gray-600 dark:text-slate-400">Password:</Text>
                              <Text className="text-gray-900 dark:text-white font-semibold select-all">{user.password}</Text>
                            </Row>
                            <Row justify="between" className="items-start">
                              <Text className="text-gray-600 dark:text-slate-400">Role:</Text>
                              <Badge variant={user.role === "admin" ? "danger" : user.role === "seller" ? "warning" : "success"}>
                                {user.role.toUpperCase()}
                              </Badge>
                            </Row>
                            {user.userId && (
                              <Row justify="between" className="items-start">
                                <Text className="text-gray-600 dark:text-slate-400">User ID:</Text>
                                <Text className="text-gray-900 dark:text-white text-[0.7rem] truncate">{user.userId}</Text>
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
                    <Text className="font-semibold text-green-700 dark:text-green-300">Collection Plans:</Text>
                    {result.details.collectionPlans.map((plan) => (
                      <Text key={plan.name} className="text-xs text-green-600 dark:text-green-400">
                        <strong>{plan.name}</strong>: seed={plan.seedCount}, existing={plan.existingCount}, wouldCreate={plan.wouldCreate ?? 0}, wouldDelete={plan.wouldDelete ?? 0}, wouldSkip={plan.wouldSkip ?? 0}
                      </Text>
                    ))}
                  </Stack>
                )}

                {/* Full Result JSON */}
                <details className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                  <summary className="font-semibold text-gray-700 dark:text-slate-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                    📄 Full Response JSON
                  </summary>
                  <pre className="text-xs text-gray-600 dark:text-slate-400 whitespace-pre-wrap break-words m-2 max-h-64 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </Stack>
            </Container>
          )}

          {/* Featured card gallery */}
          <Stack gap="md">
            <Heading level={2} className="text-amber-600 dark:text-[#FFCB05] text-center mt-0">
              📋 Seeded Cards Preview
            </Heading>
            <Grid cols={3} gap="md" className="sm:grid-cols-4 lg:grid-cols-6">
              {FEATURED_CARDS.map((card, index) => (
                <Stack
                  key={card.num}
                  gap="none"
                  className="rounded-xl overflow-hidden border border-amber-600/40 dark:border-[#FFCB05]/20 bg-gray-50 dark:bg-white/5"
                >
                  <Div className="aspect-square w-full">
                    <MediaImage
                      src={CARD_IMG(card.num)}
                      alt={card.name}
                      size="card"
                      className="w-full block"
                      priority={index === 0}
                    />
                  </Div>
                  <Stack gap="none" className="p-2">
                    <Text className="text-xs font-bold text-amber-600 dark:text-[#FFCB05]">{card.name}</Text>
                    <Text className="text-[0.65rem] text-gray-600 dark:text-slate-400">{card.rarity}</Text>
                    <Text className="text-[0.65rem] text-green-600 dark:text-green-300 mt-1">{card.price}</Text>
                  </Stack>
                </Stack>
              ))}
            </Grid>

            {/* Info Section */}
            <Stack gap="sm" className="rounded-xl p-6 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10">
              <Heading level={3} className="text-amber-600 dark:text-[#FFCB05] mt-0">📦 What Gets Seeded</Heading>
              <Stack gap="xs" className="text-gray-700 dark:text-slate-400 leading-loose text-sm">
                <Text>
                  <strong className="text-gray-900 dark:text-slate-200">101 Pokémon Products</strong> — TCG singles (PSA-graded Base Set holos), figures, apparel, 8 live auctions, 5 pre-orders, and OOS/discontinued items.
                </Text>
                <Text>
                  <strong className="text-gray-900 dark:text-slate-200">3 Stores</strong> — PokéVault Cards, Trainer's Closet, Professor Oak's Collectibles — each with products, reviews, and payout history.
                </Text>
                <Text>
                  <strong className="text-gray-900 dark:text-slate-200">PokéFest 2026 Coupon Drop</strong> — POKEFEST15, TRAINERS-CLOSET10, and PROF-OAKS15 discount codes with event entries and notifications.
                </Text>
                <Text>
                  <strong className="text-gray-900 dark:text-slate-200">Role-Based Credentials</strong> — Admin, seller, and buyer accounts are created and credentials are shown after seeding.
                </Text>
                <Text>
                  <strong className="text-gray-900 dark:text-slate-200">Builder Pattern + Dry Run</strong> — Select exactly which collections to seed; preview plans without writing to the database.
                </Text>
              </Stack>
            </Stack>
          </Stack>

        </Stack>
      </Container>
    </Section>
    </>
  );
}
