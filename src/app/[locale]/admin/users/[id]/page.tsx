"use client";

import { Badge, Button, Code, Container, Div, Divider, Heading, MediaImage, Row, Section, Span, Stack, Tabs, TabsList, TabsTrigger, Text } from "@mohasinac/appkit/client";
import type { JsonValue } from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { getAdminUser, getAdminUserAddresses } from "@/lib/api/admin-client";
import {useEffect, useState, Suspense } from "react";
import { ADMIN_USER_DETAIL_TABS, API_ROUTES, type AdminUserDetailTabId } from "@/constants";



interface AdminAddressRow {
  id: string;
  label?: string;
  fullName?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isDefault?: boolean;
}

const ROLE_BADGE_VARIANT: Record<string, "admin" | "moderator" | "seller" | "employee" | "user" | "default"> = {
  admin: "admin",
  moderator: "moderator",
  seller: "seller",
  employee: "employee",
  user: "user",
};

function PageInner() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [tab, setTab] = useState<AdminUserDetailTabId>("overview");
  const [user, setUser] = useState<Record<string, JsonValue> | null>(null);
  const [addresses, setAddresses] = useState<AdminAddressRow[]>([]);
  useEffect(() => {
    getAdminUser(API_ROUTES.ADMIN.USER_BY_ID(id))
      .then((r) => r.json())
      .then((j) => setUser(j?.data ?? null))
      .catch(() => setUser(null));
  }, [id]);
  useEffect(() => {
    if (!id) return;
    getAdminUserAddresses(id)
      .then((r) => r.json())
      .then((j) => setAddresses((j?.data?.items ?? []) as AdminAddressRow[]))
      .catch(() => setAddresses([]));
  }, [id]);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Row gap="md" align="center">
            <Div className="h-16 w-16 shrink-0" rounded="full" overflow="hidden">
              <MediaImage src={(user?.photoURL as string) ?? undefined} alt={(user?.displayName as string) ?? id} size="avatar" />
            </Div>
            <Stack gap="xs" className="min-w-0 flex-1">
              <Row gap="sm" align="center" wrap>
                <Heading level={1}>
                  {(user?.displayName as string) ?? id}
                </Heading>
                <Badge variant={ROLE_BADGE_VARIANT[(user?.role as string) ?? "user"] ?? "default"}>
                  {(user?.role as string) ?? "user"}
                </Badge>
                {Boolean(user?.isTester) && <Badge variant="info">Tester</Badge>}
                {Boolean(user?.canTestAdmin) && <Badge variant="secondary">Admin QA</Badge>}
                {Boolean(user?.isDisabled) && <Badge variant="danger">Hard banned</Badge>}
                {Boolean(user?.disabled) && !user?.isDisabled && <Badge variant="warning">Disabled</Badge>}
                {Array.isArray(user?.softBans) && (user!.softBans as unknown[]).length > 0 && (
                  <Badge variant="warning">{(user!.softBans as unknown[]).length} soft ban{(user!.softBans as unknown[]).length !== 1 ? "s" : ""}</Badge>
                )}
              </Row>
              <Text size="xs" color="muted">
                {(user?.email as string) ?? "—"} · uid <Code className="font-mono">{id}</Code>
              </Text>
            </Stack>
          </Row>
          {Boolean(user?.isDisabled) && Boolean(user?.hardBanReason) && (
            <Div surface="danger-surface" padding="sm" rounded="lg" className="border border-error/20">
              <Text size="sm" weight="semibold" className="text-error">Hard ban reason</Text>
              <Text size="sm" className="text-error">{user!.hardBanReason as string}</Text>
              {user?.hardBannedAt != null && (
                <Text size="xs" className="text-error mt-1">
                  Banned {new Date(user!.hardBannedAt as string).toLocaleString()}
                  {user?.hardBanExpiresAt ? ` · expires ${new Date(user!.hardBanExpiresAt as string).toLocaleString()}` : " · permanent"}
                </Text>
              )}
            </Div>
          )}
          <Divider />
          <Tabs value={tab} onChange={(k: string) => setTab(k as AdminUserDetailTabId)}>
            <TabsList>
              {ADMIN_USER_DETAIL_TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {tab === "overview" && user && (
            <Stack gap="lg">
              {(() => {
                const stats = user.stats as Record<string, JsonValue> | undefined;
                const cards: { label: string; value: string | number }[] = stats
                  ? [
                      { label: "Orders", value: Number(stats.totalOrders ?? 0) },
                      { label: "Auctions won", value: Number(stats.auctionsWon ?? 0) },
                      { label: "Items sold", value: Number(stats.itemsSold ?? 0) },
                      { label: "Reviews", value: Number(stats.reviewsCount ?? 0) },
                      ...(stats.rating != null ? [{ label: "Rating", value: `${stats.rating}★` }] : []),
                    ]
                  : [];
                return cards.length > 0 ? (
                  <Row gap="sm" wrap>
                    {cards.map((c) => (
                      <Div key={c.label} surface="card" padding="sm" rounded="lg" className="min-w-[100px]">
                        <Text size="xs" color="muted">{c.label}</Text>
                        <Text size="lg" weight="semibold">{c.value}</Text>
                      </Div>
                    ))}
                  </Row>
                ) : null;
              })()}

              <Stack textSize="sm" gap="sm">
                <Text>
                  <Span weight="bold">Email:</Span> {(user.email as string) ?? "—"}
                  {Boolean(user.emailVerified) && <Span size="xs" color="muted"> (verified)</Span>}
                </Text>
                <Text>
                  <Span weight="bold">Phone:</Span> {(user.phoneNumber as string) ?? "—"}
                </Text>
                <Text>
                  <Span weight="bold">Created:</Span>{" "}
                  {user.createdAt
                    ? new Date(user.createdAt as string).toLocaleString()
                    : "—"}
                </Text>
                {(() => {
                  const metadata = user.metadata as Record<string, JsonValue> | undefined;
                  if (!metadata?.lastSignInTime && !metadata?.loginCount) return null;
                  return (
                    <Text>
                      <Span weight="bold">Last sign-in:</Span>{" "}
                      {metadata.lastSignInTime ? new Date(metadata.lastSignInTime as string).toLocaleString() : "—"}
                      {metadata.loginCount != null && ` · ${metadata.loginCount} logins`}
                    </Text>
                  );
                })()}
                {user.storeId != null && (
                  <Text>
                    <Span weight="bold">Store:</Span>{" "}
                    <Link href={`/admin/stores?ownerId=${id}`} className="underline">
                      {(user.storeSlug as string) ?? (user.storeId as string)}
                    </Link>{" "}
                    ({(user.storeStatus as string) ?? "pending"})
                  </Text>
                )}
                {(() => {
                  const profile = user.publicProfile as Record<string, JsonValue> | undefined;
                  if (!profile?.bio && !profile?.location && !profile?.website) return null;
                  return (
                    <>
                      {profile?.bio && (
                        <Text><Span weight="bold">Bio:</Span> {profile.bio as string}</Text>
                      )}
                      {profile?.location && (
                        <Text><Span weight="bold">Location:</Span> {profile.location as string}</Text>
                      )}
                      {profile?.website && (
                        <Text><Span weight="bold">Website:</Span> {profile.website as string}</Text>
                      )}
                    </>
                  );
                })()}
                {(user.adminNotes as string) && (
                  <Div surface="muted" padding="sm" rounded="lg" className="mt-2">
                    <Text size="xs" weight="semibold" color="muted">Admin notes</Text>
                    <Text size="sm">{user.adminNotes as string}</Text>
                  </Div>
                )}
              </Stack>

              {addresses.length > 0 && (
                <Stack gap="sm">
                  <Row justify="between" align="center">
                    <Text size="sm" weight="semibold" color="muted">
                      Addresses ({addresses.length})
                    </Text>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/addresses?ownerId=${id}`}>Open Address Book</Link>
                    </Button>
                  </Row>
                  <Stack gap="xs">
                    {addresses.map((a) => (
                      <Div key={a.id} rounded="lg" padding="sm" surface="muted" border="default">
                        <Text size="sm" weight="medium">
                          {a.label ?? "Address"}
                          {a.isDefault && <Span size="xs" color="muted"> (default)</Span>}
                        </Text>
                        <Text size="xs" color="muted">
                          {[a.fullName, a.addressLine1, a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
                        </Text>
                      </Div>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
          {tab === "orders" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/orders?buyerId=${id}`}>Open Orders filtered by buyer</Link>
              </Button>
            </Row>
          )}
          {tab === "store" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/stores?ownerId=${id}`}>Open Stores filtered by owner</Link>
              </Button>
            </Row>
          )}
          {tab === "reviews" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/reviews?buyerId=${id}`}>Open Reviews filtered by buyer</Link>
              </Button>
            </Row>
          )}
          {tab === "sessions" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/sessions?userId=${id}`}>Open Sessions filtered by user</Link>
              </Button>
            </Row>
          )}
          {tab === "bids" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/bids?bidderId=${id}`}>Open Bids filtered by bidder</Link>
              </Button>
            </Row>
          )}
          {tab === "reports" && (
            <Row gap="sm">
              <Button asChild variant="outline">
                <Link href={`/admin/reports?reporterId=${id}`}>Reports filed by user</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/admin/reports?entityId=${id}&entityType=user`}>Reports against user</Link>
              </Button>
            </Row>
          )}
        </Stack>
      </Container>
    </Section>
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
