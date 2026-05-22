"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  BecomeSellerView,
  ROUTES,
  useAuth,
  useBecomeSeller,
  Button,
  Heading,
  Stack,
  Text,
  Ul,
  Li,
} from "@mohasinac/appkit";
import type { BecomeSellerResult } from "@mohasinac/appkit";

type ViewState = "guide" | "success" | "already-seller";

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<ViewState>("guide");

  const mutation = useBecomeSeller<BecomeSellerResult>({
    onSuccess: (result) => {
      setState(result.alreadySeller ? "already-seller" : "success");
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (user && (user.role === "seller" || user.role === "admin")) {
      setState("already-seller");
    }
  }, [user, authLoading]);

  return (
    <BecomeSellerView
      labels={{ title: "Become a Seller on LetItRip" }}
      state={state}
      isLoading={authLoading || mutation.isPending}
      renderGuide={() => (
        <Stack
          gap="lg"
          className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
        >
          <Stack gap="sm">
            <Heading
              level={2}
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Sell collectibles to a verified community
            </Heading>
            <Text className="text-sm text-zinc-600 dark:text-zinc-300">
              Open a store for Pokémon TCG, Hot Wheels, Beyblades, anime
              figures, and more. We handle discovery, secure checkout, and
              shipping integrations — you focus on listings.
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-400">
              What you get
            </Text>
            <Ul className="list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              <Li>A storefront page with your own URL and branding</Li>
              <Li>Standard listings, auctions, pre-orders, and bundles</Li>
              <Li>Built-in payouts via UPI or bank transfer</Li>
              <Li>Shiprocket-backed shipping or your own carrier</Li>
            </Ul>
          </Stack>

          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !user}
            className="self-start"
          >
            {mutation.isPending ? "Submitting..." : "Apply to become a seller"}
          </Button>

          {!user && !authLoading ? (
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              Please <Link href={String(ROUTES.AUTH.LOGIN)} className="text-primary hover:underline">sign in</Link> first to apply.
            </Text>
          ) : null}

          {mutation.isError ? (
            <Text className="text-sm text-rose-600 dark:text-rose-400">
              {mutation.error?.message ?? "Could not submit application. Please try again."}
            </Text>
          ) : null}
        </Stack>
      )}
      renderSuccess={() => (
        <Stack
          gap="md"
          className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 p-6"
        >
          <Heading
            level={2}
            className="text-lg font-semibold text-emerald-900 dark:text-emerald-200"
          >
            Application received
          </Heading>
          <Text className="text-sm text-emerald-800 dark:text-emerald-300">
            Thanks for applying. We&apos;ll review your account and notify you
            once your seller status is approved. In the meantime, you can set
            up your store profile.
          </Text>
          <Button asChild className="self-start">
            <Link href={String(ROUTES.STORE.DASHBOARD)}>Go to Store Dashboard</Link>
          </Button>
        </Stack>
      )}
      renderAlreadySeller={() => (
        <Stack
          gap="md"
          className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
        >
          <Heading
            level={2}
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            You&apos;re already a seller
          </Heading>
          <Text className="text-sm text-zinc-600 dark:text-zinc-300">
            Head over to your Store Dashboard to manage listings, orders, and
            payouts.
          </Text>
          <Button asChild className="self-start">
            <Link href={String(ROUTES.STORE.DASHBOARD)}>Open Store Dashboard</Link>
          </Button>
        </Stack>
      )}
    />
  );
}
