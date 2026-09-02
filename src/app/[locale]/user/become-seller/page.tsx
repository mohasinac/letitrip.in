"use client";

import {useEffect, useState, Suspense } from "react";
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
} from "@mohasinac/appkit/client";
import type { BecomeSellerResult } from "@mohasinac/appkit/client";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit/client";



type ViewState = "guide" | "success" | "already-seller";

function PageInner() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<ViewState>("guide");

  const mutation = useBecomeSeller<BecomeSellerResult>({
    onSuccess: (result) => {
      setState(result.alreadySeller ? "already-seller" : "success");
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (user && (isSellerUser(user) || isAdminUser(user))) {
      setState("already-seller");
    }
  }, [user, authLoading]);

  return (
    <BecomeSellerView
      labels={{ title: "Become a Seller on LetItRip" }}
      state={state}
      renderGuide={() => (
        <Stack
          gap="lg"
          surface="card"
          padding="lg"
        >
          <Stack gap="sm">
            <Heading
              level={2} size="lg" weight="semibold" color="primary">
              Sell collectibles to a verified community
            </Heading>
            <Text size="sm" color="muted">
              Open a store for Pokémon TCG, Hot Wheels, Beyblades, anime
              figures, and more. We handle discovery, secure checkout, and
              shipping integrations — you focus on listings.
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text className="tracking-widest" color="faint" size="xs" weight="semibold" transform="uppercase">
              What you get
            </Text>
            <Ul marker="disc" spacing="tight" indent="lg" size="sm" color="primary">
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
            <Text size="xs" color="muted">
              Please <Link href={String(ROUTES.AUTH.LOGIN)} className="text-primary hover:underline">sign in</Link> first to apply.
            </Text>
          ) : null}

          {mutation.isError ? (
            <Text className="text-error" size="sm">
              {mutation.error?.message ?? "Could not submit application. Please try again."}
            </Text>
          ) : null}
        </Stack>
      )}
      renderSuccess={() => (
        <Stack
          gap="md"
          padding="lg"
          className="border border-success/20" surface="success-surface" rounded="xl"
        >
          <Heading
            level={2}
            className="text-success" size="lg" weight="semibold"
          >
            Application received
          </Heading>
          <Text className="text-success" size="sm">
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
          surface="card"
          padding="lg"
        >
          <Heading
            level={2} size="lg" weight="semibold" color="primary">
            You&apos;re already a seller
          </Heading>
          <Text size="sm" color="muted">
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

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
