"use client";
import { Row, Stack, normalizeError, IMAGE_ACCEPT_ATTR, formatCurrency } from "@mohasinac/appkit/client";
import {useRef, useState, Suspense } from "react";
import {
  UserAccountHubView,
  useAuth,
  useOrders,
  useWishlistCount,
  useMediaUpload,
  useUpdateProfile,
  useToast,
  useProfile,
  useLinkGoogleAccount,
  OrdersList,
  ROUTES,
  ACTIONS,
  Alert,
  Badge,
  Button,
  Div,
  DynamicBgDiv,
  Grid,
  Input,
  Span,
} from "@mohasinac/appkit/client";
import { useNotifications } from "@mohasinac/appkit/client";
import {
  /*
   * One icon. Twenty more were imported solely to decorate the deleted
   * `NAV_LINKS` tile wall; `Camera` is the avatar-upload affordance and is the
   * only one with a job of its own.
   */
  Camera,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { toUserMessage } from "@mohasinac/appkit/client";
import { TextLink } from "@mohasinac/appkit/client";
import { USER_NAV_GROUPS } from "@/constants/navigation";
import { DashboardSectionsClient } from "@mohasinac/appkit/features/dashboard/components/DashboardSectionsClient";



const __P = {
  p5: "p-[var(--appkit-space-5)]",
} as const;

const __O = {
  hidden: "overflow-hidden",
} as const;

const BRAND_GRAD = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)";

function StatCard({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3)] shadow-sm hover:border-[var(--appkit-color-primary)] hover:shadow-md transition-colors"
    >
      <Div textSize="2xl" textWeight="bold" className="text-[var(--appkit-color-text)] leading-tight">{value}</Div>
      <Div textSize="xs" className="text-[var(--appkit-color-text-muted)] mt-0.5">{label}</Div>
    </Link>
  );
}

/*
 * 🛑 A local `formatINR` stood here and it is the `₹ 261.8` in the audit.
 *
 * It was `₹${amount.toLocaleString("en-IN")}` — no fraction digits named at
 * all, so `toLocaleString` applied its default of up to 3 and a minimum of 0.
 * "Total spent" is a sum of order totals, so it carries real decimals:
 * 261.8333 printed as "₹261.833", 17500 as "₹17,500", and the same column
 * elsewhere in the product as "₹17,500.00".
 *
 * `formatCurrency` goes through `Intl.NumberFormat` with `style: "currency"`,
 * which pins the fraction digits to the currency's own minor-unit count in
 * both directions and takes the symbol from the locale rather than hardcoding
 * one.
 */

function PageInner() {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();
  const { orders, isLoading: ordersLoading } = useOrders({ page: 1, pageSize: 3 });
  const { orders: allOrdersForStats } = useOrders({ page: 1, pageSize: 100 });
  const { unreadCount } = useNotifications();
  const wishlistCount = useWishlistCount(user?.uid ?? null);
  const { upload } = useMediaUpload();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  // No `onError`: `useUpdateProfile` already surfaces the failure, and a second
  // toast here shows the same error twice — once generic, once raw.
  const updateProfile = useUpdateProfile({
    onSuccess: () => showToast("Profile photo updated.", "success"),
  });

  const { data: profile, refetch: refetchProfile } = useProfile({ enabled: !!user });
  const linkGoogle = useLinkGoogleAccount({
    onSuccess: () => {
      showToast("Google account connected.", "success");
      void refetchProfile();
    },
    onError: () =>
      showToast(
        toUserMessage(undefined, undefined, {
          fallback: "Failed to connect Google account.",
        }),
        "error",
      ),
  });

  async function onPickFile(file: File | null) {
    if (!file || !user) return;
    setUploading(true);
    try {
      const parts = (user.displayName ?? user.email ?? "user").split(" ");
      const url = await upload(file, "avatars", true, {
        type: "user-avatar",
        firstName: parts[0] ?? "user",
        lastName: parts[1] ?? "",
      });
      await updateProfile.mutateAsync({ photoURL: url });
    } catch (e: unknown) {
      // The MUTATION surfaces its own failure; this catch only stops the upload
      // rejection escaping and clears the spinner. Recorded, never re-toasted —
      // two toasts for one failure is how the user ends up reading the raw text.
      void normalizeError(e);
    } finally {
      setUploading(false);
    }
  }

  const totalOrders = allOrdersForStats.length;
  const totalSpent = allOrdersForStats.reduce(
    (acc: number, o: any) => acc + (typeof o?.totalAmount === "number" ? o.totalAmount : 0),
    0,
  );

  return (
    <UserAccountHubView
      labels={{ title: "My Account" }}
      renderProfile={() =>
        userLoading ? null : user ? (
          <Stack gap="md">
            <Row className={`relative border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__O.hidden} ${__P.p5}`} align="center" gap="md" rounded="xl" shadow="sm">
              <DynamicBgDiv
                background={BRAND_GRAD}
                className="absolute top-0 left-0 right-0 h-[3px]"
                aria-hidden="true"
              />
              <Button rounded="full" 
                variant="ghost"
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="group relative h-16 w-16 flex-shrink-0 overflow-hidden ring-2 ring-[var(--appkit-color-border)] p-[var(--appkit-space-0)] min-h-0 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line lir/no-raw-media-elements, @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <DynamicBgDiv
                    background={BRAND_GRAD}
                    className="h-full w-full flex items-center justify-center text-white font-bold text-[length:var(--appkit-text-xl)]"
                  >
                    {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </DynamicBgDiv>
                )}
                <Row surface="overlay-xs" className="absolute inset-0 pointer-events-none bg-transparent group-hover:bg-[var(--appkit-color-text)]/40 transition-colors opacity-0 group-hover:opacity-100" align="center" justify="center">
                  <Camera className="w-5 h-5 text-white" />
                </Row>
                {uploading && (
                  <Row textWeight="semibold" surface="overlay-lg" className="absolute inset-0 text-white text-[10px]" align="center" justify="center">
                    Saving…
                  </Row>
                )}
              </Button>
              <Input
                ref={fileRef}
                type="file"
                accept={IMAGE_ACCEPT_ATTR}
                hidden
                bare
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <Div className="min-w-0 flex-1">
                <Div textWeight="semibold" className="text-[var(--appkit-color-text)] truncate">
                  {user.displayName ?? "My Account"}
                </Div>
                {user.email && (
                  <Div textSize="sm" className="text-[var(--appkit-color-text-muted)] truncate">{user.email}</Div>
                )}
                <Row gap="md" className="mt-0.5">
                  <Link
                    href={String(ROUTES.USER.PROFILE)}
                    className="text-[length:var(--appkit-text-xs)] font-medium text-[var(--appkit-color-primary)] hover:underline"
                  >
                    View / edit profile →
                  </Link>
                  <Link
                    href={String(ROUTES.PUBLIC.PROFILE(user.uid))}
                    className="text-[length:var(--appkit-text-xs)] font-medium text-[var(--appkit-color-primary)] hover:underline"
                  >
                    View public profile →
                  </Link>
                </Row>
              </Div>
            </Row>

            {profile && !profile.googleLinked && (
              <Alert variant="info" title="Connect your Google account">
                <Row align="center" justify="between" gap="md" wrap>
                  <Span size="sm" className="text-[var(--appkit-color-text-muted)]">
                    Sign in with either your password or Google going forward.
                  </Span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={linkGoogle.isLoading}
                    onClick={() => linkGoogle.mutate()}
                  >
                    Connect Google
                  </Button>
                </Row>
              </Alert>
            )}

            {profile && profile.googleLinked && (
              <Alert variant="success" title="Google account connected">
                <Row align="center" gap="sm" wrap>
                  <Badge variant="success" size="sm">Connected</Badge>
                  <Span size="sm" className="text-[var(--appkit-color-text-muted)]">
                    Signed in as {profile.googleLinkedEmail ?? "your Google account"}. You can sign in with either your password or Google.
                  </Span>
                </Row>
              </Alert>
            )}

            <Grid cols="statTiles" gap="3">
              <StatCard label="Orders"        value={totalOrders}                   href={String(ROUTES.USER.ORDERS)} />
              <StatCard label="Total spent"   value={formatCurrency(totalSpent)}    href={String(ROUTES.USER.ORDERS)} />
              <StatCard label="Wishlist"      value={wishlistCount ?? 0}            href={String(ROUTES.USER.WISHLIST)} />
              <StatCard label="Unread alerts" value={unreadCount ?? 0}              href={String(ROUTES.USER.NOTIFICATIONS)} />
              <StatCard label="Support"       value={"Open"}                         href={String(ROUTES.USER.SUPPORT)} />
            </Grid>
          </Stack>
        ) : null
      }
      renderNav={() => (
        /*
         * ── Was an 18-tile wall from a hand-written `NAV_LINKS` ───────────
         *
         * `NAV_LINKS` listed eighteen destinations that `USER_NAV_GROUPS`
         * already holds, in four named groups, each with a sentence on what the
         * page is for — so this grid was a second list of the same links with
         * the explanations stripped off, and nothing kept the two in step.
         *
         * Now the four sections, each a card to its own hub.
         *
         * 🛑 "My Public Profile" is kept as a separate link and is the one
         * destination here that genuinely cannot be derived: it is
         * `ROUTES.PUBLIC.PROFILE(user.uid)`, a PUBLIC route parameterised by
         * the viewer, so no nav group can carry it. Dropping it while deleting
         * its nineteen neighbours would have been the easy mistake.
         */
        <DashboardSectionsClient
          portal="user"
          groups={USER_NAV_GROUPS}
          above={
            user ? (
              <Row>
                <TextLink href={String(ROUTES.PUBLIC.PROFILE(user.uid))} size="sm">
                  View my public profile →
                </TextLink>
              </Row>
            ) : undefined
          }
        />
      )}
      renderRecentOrders={() =>
        orders.length > 0 || ordersLoading ? (
          <>
            <Row className="mb-3" align="center" justify="between">
              <Span size="sm" weight="semibold" className="text-[var(--appkit-color-text)]">
                Recent Orders
              </Span>
              <Link
                href={String(ROUTES.USER.ORDERS)}
                className="text-[length:var(--appkit-text-xs)] text-[var(--appkit-color-primary)] hover:underline"
              >
                View all →
              </Link>
            </Row>
            <OrdersList
              orders={orders}
              isLoading={ordersLoading}
              emptyLabel="No orders yet"
              onOrderClick={(order) =>
                router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))
              }
              renderActions={(order) => (
                <Button asChild variant="outline" size="sm">
                  <Link href={ROUTES.USER.ORDER_DETAIL(order.id)}>
                    {ACTIONS.USER["view-order"].label}
                  </Link>
                </Button>
              )}
            />
          </>
        ) : null
      }
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
