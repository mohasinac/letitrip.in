"use client";

import {useEffect, useState, Suspense } from "react";
import { Link, useRouter } from "@/i18n/navigation";
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
import { StoreCreateForm } from "@mohasinac/appkit/features/stores/components/StoreCreateForm";
import type { StoreCreateInput } from "@mohasinac/appkit/features/stores/schemas/store-create";
import { createStoreAction } from "@/actions/seller.actions";

/*
 * 🛑 FOUR states, not three. Being a seller and owning a storefront are
 * different things, and the gap between them was a dead end: `becomeSeller`
 * flips `role` to "seller" and sets `storeStatus: "pending"` but creates NO
 * store, `createStoreAction` had no caller anywhere, and this page's
 * "already-seller" panel pointed a storeless seller at a Store Dashboard with
 * no store behind it. `create-store` is the missing step.
 */
type ViewState = "guide" | "create-store" | "already-seller";

function PageInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<ViewState>("guide");

  const mutation = useBecomeSeller<BecomeSellerResult>({
    /*
     * Straight to the form either way. `alreadySeller` only tells us the
     * role was already set — it says nothing about whether a store exists,
     * and the effect below is what decides that.
     */
    onSuccess: () => setState("create-store"),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (isSellerUser(user) || isAdminUser(user)) {
      /*
       * 🛑 `storeId` on the session is refreshed only periodically (every ~5
       * minutes, or on a hard reload) — see Root Cause #44. That is safe in
       * THIS direction: a seller whose store was just created but whose
       * session has not caught up is handed the create form again, which is
       * wrong but recoverable, whereas the create path redirects to the
       * dashboard on success rather than relying on the session updating. It
       * is never used to grant anything.
       */
      setState(user.storeId ? "already-seller" : "create-store");
    }
  }, [user, authLoading]);

  async function handleCreate(input: StoreCreateInput) {
    const result = await createStoreAction(input);
    if (result.ok) return { ok: true as const };
    /*
     * Pass the stable CODE through, never `result.error` — the form maps it
     * with `toUserMessage`, which never renders server text (Root Cause #86).
     */
    return { ok: false as const, code: result.code };
  }

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
              <Li>Your own carrier, or a courier you arrange yourself</Li>
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
      renderCreateStore={() => (
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={2} size="lg" weight="semibold" color="primary">
              You&apos;re a seller — one step left
            </Heading>
            <Text size="sm" color="muted">
              Create your storefront below. It stays private until we review it,
              and you can edit everything afterwards.
            </Text>
          </Stack>
          {/*
           * On success we REDIRECT rather than flipping local state: the store
           * dashboard re-reads the store server-side, so it shows the real
           * (pending) store immediately instead of waiting for the session's
           * `storeId` to refresh on its own schedule.
           */}
          <StoreCreateForm
            onSubmit={handleCreate}
            onCreated={() => router.push(String(ROUTES.STORE.DASHBOARD))}
          />
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
