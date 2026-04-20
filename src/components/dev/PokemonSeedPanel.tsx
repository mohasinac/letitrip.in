"use client";

/**
 * PokemonSeedPanel — Dev-only UI for loading / deleting the
 * Pokémon Base Set 151 themed seed data via the demo seed server action.
 *
 * Route: /[locale]/demo/seed
 */

import React, { useState, useTransition } from "react";
import {
  Section,
  Container,
  Stack,
  Row,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  Checkbox,
} from "@mohasinac/appkit/ui";
import { demoSeedAction } from "@/actions/demo-seed.actions";
import type { SeedCollectionName, SeedOperationResult } from "@/actions/demo-seed.actions";

const POKEMON_COLLECTIONS: SeedCollectionName[] = [
  "users",
  "addresses",
  "stores",
  "categories",
  "orders",
  "products",
  "bids",
  "blogPosts",
  "events",
  "faqs",
  "carouselSlides",
  "homepageSections",
];

const FALLBACK_COLLECTIONS: SeedCollectionName[] = [
  "reviews",
  "coupons",
  "notifications",
  "payouts",
  "eventEntries",
  "sessions",
  "carts",
  "siteSettings",
  "storeAddresses",
];

type SeedCollectionStatus = {
  name: SeedCollectionName;
  seedCount: number;
  existingCount: number;
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
  const [result, setResult] = useState<SeedOperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SeedCollectionStatus[]>([]);
  const [dryRun, setDryRun] = useState<boolean>(true);

  const ALL_COLLECTIONS: SeedCollectionName[] = [
    ...POKEMON_COLLECTIONS,
    ...FALLBACK_COLLECTIONS,
  ];

  const collectionLabel: Record<string, string> = {
    users: "Users (Pokemon themed)",
    addresses: "Addresses (fallback dataset)",
    stores: "Stores (fallback dataset)",
    categories: "Categories (Pokemon themed)",
    orders: "Orders (fallback dataset)",
    products: "Products (Pokemon themed + auctions + pre-orders)",
    bids: "Bids / Auctions (fallback dataset)",
    blogPosts: "Blogs (fallback dataset)",
    events: "Events (fallback dataset)",
    faqs: "FAQs (fallback dataset)",
    carouselSlides: "Homepage Slides (Pokemon themed)",
    homepageSections: "Homepage Sections (Pokemon themed)",
    reviews: "Reviews (fallback dataset)",
    coupons: "Coupons (fallback dataset)",
    notifications: "Notifications (fallback dataset)",
    payouts: "Payouts (fallback dataset)",
    eventEntries: "Event Entries (fallback dataset)",
    sessions: "Sessions (fallback dataset)",
    carts: "Carts (fallback dataset)",
    siteSettings: "Site Settings (fallback dataset)",
    storeAddresses: "Store Addresses (fallback dataset)",
  };

  React.useEffect(() => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/demo/seed", { method: "GET" });
        const payload = await response.json();
        const collections = (payload?.data?.collections ?? []) as SeedCollectionStatus[];
        setStatus(collections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch seed status");
      }
    });
  }, []);

  function run(action: "load" | "delete") {
    setResult(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await demoSeedAction({
          action,
          collections: ALL_COLLECTIONS,
          dryRun,
        });
        setResult(res);

        const response = await fetch("/api/demo/seed", { method: "GET" });
        const payload = await response.json();
        const collections = (payload?.data?.collections ?? []) as SeedCollectionStatus[];
        setStatus(collections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    });
  }

  return (
    <Section className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-8">
      <Container size="2xl">
        <Stack gap="lg">

          {/* Header */}
          <Stack gap="sm" className="items-center text-center">
            <Text className="text-5xl">🃏</Text>
            <Heading level={1} className="text-[#FFCB05] text-3xl font-extrabold">
              Pokémon Base Set 151
            </Heading>
            <Text className="text-slate-400">
              Dev seed tool — supports dry run + add/remove for all required collections
            </Text>
            <Badge variant="danger">DEV ONLY — Not available in production</Badge>
          </Stack>

          {/* Collections summary */}
          <Grid cols={3} gap="sm">
            {ALL_COLLECTIONS.map((col) => {
              const colStatus = status.find((s) => s.name === col);
              const seeded = (colStatus?.existingCount ?? 0) > 0;
              return (
                <Stack
                  key={col}
                  gap="xs"
                  className={`rounded-xl p-4 bg-white/5 border ${seeded ? "border-green-500/60" : "border-red-500/40"}`}
                >
                  <Row justify="between" className="items-center">
                    <Text className="text-sm font-bold text-slate-200 flex-1 mr-2">
                      {collectionLabel[col] ?? col}
                    </Text>
                    <Badge variant={seeded ? "success" : "danger"}>
                      {seeded ? "SEEDED" : "NOT SEEDED"}
                    </Badge>
                  </Row>
                  <Text className="text-xs text-slate-400">
                    Seed docs: {colStatus?.seedCount ?? 0} | Existing: {colStatus?.existingCount ?? 0}
                  </Text>
                </Stack>
              );
            })}
          </Grid>

          {/* Dry-run toggle */}
          <Row justify="center">
            <Checkbox
              label="Dry Run (preview only, no writes/deletes)"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
            />
          </Row>

          {/* Action buttons */}
          <Row gap="md" justify="center" className="flex-wrap">
            <Button
              variant="primary"
              size="lg"
              isLoading={isPending}
              onClick={() => run("load")}
              disabled={isPending}
            >
              {dryRun ? "⚡ Dry Run Add Seed" : "⚡ Add / Upsert Seed Data"}
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={() => run("delete")}
              disabled={isPending}
            >
              {dryRun ? "🗑️ Dry Run Remove Seed" : "🗑️ Remove Seed Data"}
            </Button>
          </Row>

          {/* Error */}
          {error && (
            <Container size="lg">
              <Stack gap="xs" className="rounded-xl p-4 bg-red-500/15 border border-red-500 text-red-300">
                <Text>❌ {error}</Text>
              </Stack>
            </Container>
          )}

          {/* Result */}
          {result && (
            <Container size="lg">
              <Stack gap="sm" className="rounded-xl p-4 bg-green-500/10 border border-green-500">
                <Text className="font-bold text-green-300">
                  ✅ {result.success
                    ? result.details?.dryRun ? "Dry Run Complete" : "Success"
                    : "Completed with errors"}
                </Text>
                {result.details?.collectionPlans && (
                  <Stack gap="xs">
                    {result.details.collectionPlans.map((plan) => (
                      <Text key={plan.name} className="text-xs text-slate-300">
                        {plan.name}: seed={plan.seedCount}, existing={plan.existingCount}, wouldCreate={plan.wouldCreate ?? 0}, wouldDelete={plan.wouldDelete ?? 0}, wouldSkip={plan.wouldSkip ?? 0}
                      </Text>
                    ))}
                  </Stack>
                )}
                <pre className="text-xs text-slate-400 whitespace-pre-wrap break-words m-0">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </Stack>
            </Container>
          )}

          {/* Featured card gallery */}
          <Stack gap="md">
            <Heading level={2} className="text-[#FFCB05] text-center">
              📋 Seeded Cards Preview
            </Heading>
            <Grid cols={3} gap="md" className="sm:grid-cols-4 lg:grid-cols-6">
              {FEATURED_CARDS.map((card) => (
                <Stack
                  key={card.num}
                  gap="none"
                  className="rounded-xl overflow-hidden border border-[#FFCB05]/20 bg-white/5"
                >
                  <img src={CARD_IMG(card.num)} alt={card.name} className="w-full block" />
                  <Stack gap="none" className="p-2">
                    <Text className="text-xs font-bold text-[#FFCB05]">{card.name}</Text>
                    <Text className="text-[0.65rem] text-slate-400">{card.rarity}</Text>
                    <Text className="text-[0.65rem] text-green-300 mt-1">{card.price}</Text>
                  </Stack>
                </Stack>
              ))}
            </Grid>

            {/* What gets seeded info */}
            <Stack gap="sm" className="rounded-xl p-6 bg-white/[0.03] border border-white/10">
              <Heading level={3} className="text-[#FFCB05] mt-0">📦 What Gets Seeded</Heading>
              <Stack gap="xs" className="text-slate-400 leading-loose">
                <Text>
                  <strong className="text-slate-200">Requested collections</strong> — users, addresses, stores, products,
                  auctions (products with isAuction + bids), pre-orders (products with isPreOrder), orders, blogs, events, FAQs.
                </Text>
                <Text>
                  <strong className="text-slate-200">Pokemon-themed</strong> — users, categories, products, homepage slides, homepage sections.
                </Text>
                <Text>
                  <strong className="text-slate-200">Fallback appkit data</strong> — addresses, stores, orders, bids, blogs, events, FAQs, reviews, coupons, notifications, payouts, eventEntries, sessions, carts, siteSettings, storeAddresses.
                </Text>
                <Text>
                  <strong className="text-slate-200">Dry run</strong> — shows per-collection plan (seedCount, existingCount, wouldCreate/wouldDelete/wouldSkip) without writing.
                </Text>
              </Stack>
            </Stack>
          </Stack>

        </Stack>
      </Container>
    </Section>
  );
}
