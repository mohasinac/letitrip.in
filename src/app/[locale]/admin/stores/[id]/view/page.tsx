"use client";

import {useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  AdminStoreEditorView,
  ADMIN_ENDPOINTS,
  Anchor,
  apiClient,
  Badge,
  Button,
  Code,
  Container,
  Div,
  Divider,
  Heading,
  MediaImage,
  Row,
  Section,
  Stack,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  type JsonValue,
} from "@mohasinac/appkit/client";
import { ADMIN_STORE_DETAIL_TABS, type AdminStoreDetailTabId } from "@/constants";
import { RecordStatusTimeline } from "@mohasinac/appkit/client";



const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  active: "success",
  approved: "success",
  pending: "warning",
  suspended: "danger",
  rejected: "danger",
};

function PageInner() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [tab, setTab] = useState<AdminStoreDetailTabId>("overview");
  const [store, setStore] = useState<Record<string, JsonValue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  const reload = () => {
    setIsLoading(true);
    apiClient
      .get<{ data?: Record<string, JsonValue> } | Record<string, JsonValue>>(ADMIN_ENDPOINTS.STORE_BY_ID(id))
      .then((res) => setStore((res as { data?: Record<string, JsonValue> })?.data ?? (res as Record<string, JsonValue>)))
      .catch(() => setStore(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (id) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const status = ((store?.status as string) ?? "pending").toLowerCase();
  const stats = store?.stats as Record<string, JsonValue> | undefined;
  const capabilities = Array.isArray(store?.capabilities) ? (store!.capabilities as string[]) : [];

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          {isLoading && !store && <Text color="muted" size="sm">Loading store…</Text>}
          {!isLoading && !store && <Text color="muted" size="sm">Store not found.</Text>}

          {store && (
            <>
              <Row gap="md" align="start" wrap>
                <Div className="h-16 w-16 shrink-0" rounded="lg" overflow="hidden">
                  <MediaImage src={(store.storeLogoURL as string) ?? undefined} alt={(store.storeName as string) ?? id} size="avatar" />
                </Div>
                <Stack gap="xs" className="min-w-0 flex-1">
                  <Row gap="sm" align="center" wrap>
                    <Heading level={1}>{(store.storeName as string) ?? id}</Heading>
                    <Badge variant={STATUS_BADGE_VARIANT[status] ?? "default"}>{status}</Badge>
                    {Boolean(store.isVerified) && <Badge variant="info">Verified</Badge>}
                    {Boolean(store.isFeatured) && <Badge variant="secondary">Featured</Badge>}
                    {Boolean(store.isVacationMode) && <Badge variant="warning">On vacation</Badge>}
                  </Row>
                  <Text size="xs" color="muted">
                    {(store.storeSlug as string) ?? "—"} · owner{" "}
                    <Link href={`/admin/users/${store.ownerId as string}`} className="underline">
                      {(store.ownerId as string) ?? "—"}
                    </Link>{" "}
                    · id <Code className="font-mono">{id}</Code>
                  </Text>
                  {store.storeDescription != null && (
                    <Text size="sm" color="muted">{store.storeDescription as string}</Text>
                  )}
                  {store.website != null && (
                    <Anchor href={store.website as string} size="sm">{store.website as string}</Anchor>
                  )}
                </Stack>
                <Button variant="outline" size="sm" onClick={() => setEditorOpen(true)}>
                  Manage
                </Button>
              </Row>

              {status === "suspended" && store.suspensionReason != null && (
                <Div surface="danger-surface" padding="sm" rounded="lg" className="border border-error/20">
                  <Text size="sm" weight="semibold" className="text-error">Suspension reason</Text>
                  <Text size="sm" className="text-error">{store.suspensionReason as string}</Text>
                </Div>
              )}

              {store.isVacationMode ? (
                <Div surface="warning-surface" padding="sm" rounded="lg" className="border border-warning/20">
                  <Text size="sm" weight="semibold" className="text-warning">On vacation</Text>
                  {store.vacationMessage != null && <Text size="sm" className="text-warning">{store.vacationMessage as string}</Text>}
                  {store.vacationReturnDate != null && (
                    <Text size="xs" className="text-warning">
                      Returning {new Date(store.vacationReturnDate as string).toLocaleDateString()}
                    </Text>
                  )}
                </Div>
              ) : null}

              <Divider />
              <Tabs value={tab} onChange={(k: string) => setTab(k as AdminStoreDetailTabId)}>
                <TabsList>
                  {ADMIN_STORE_DETAIL_TABS.map((t) => (
                    <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {tab === "overview" && (
                <Stack gap="lg">
                  {stats && (
                    <Row gap="sm" wrap>
                      <Div surface="card" padding="sm" rounded="lg" className="min-w-[100px]">
                        <Text size="xs" color="muted">Products</Text>
                        <Text size="lg" weight="semibold">{Number(stats.totalProducts ?? 0)}</Text>
                      </Div>
                      <Div surface="card" padding="sm" rounded="lg" className="min-w-[100px]">
                        <Text size="xs" color="muted">Items sold</Text>
                        <Text size="lg" weight="semibold">{Number(stats.itemsSold ?? 0)}</Text>
                      </Div>
                      <Div surface="card" padding="sm" rounded="lg" className="min-w-[100px]">
                        <Text size="xs" color="muted">Reviews</Text>
                        <Text size="lg" weight="semibold">{Number(stats.totalReviews ?? 0)}</Text>
                      </Div>
                      {stats.averageRating != null && (
                        <Div surface="card" padding="sm" rounded="lg" className="min-w-[100px]">
                          <Text size="xs" color="muted">Rating</Text>
                          <Text size="lg" weight="semibold">{stats.averageRating as number}★</Text>
                        </Div>
                      )}
                    </Row>
                  )}

                  {capabilities.length > 0 && (
                    <Stack gap="xs">
                      <Text size="sm" weight="semibold">Capabilities</Text>
                      <Row gap="xs" wrap>
                        {capabilities.map((cap) => (
                          <Badge key={cap} variant="default">{cap.replace(/_/g, " ")}</Badge>
                        ))}
                      </Row>
                    </Stack>
                  )}

                  {store.customCommissionRate != null && (
                    <Text size="sm">
                      <Text as="span" weight="bold">Custom commission rate:</Text> {store.customCommissionRate as number}%
                    </Text>
                  )}

                  {store.adminNotes != null && (
                    <Div surface="muted" padding="sm" rounded="lg">
                      <Text size="xs" weight="semibold" color="muted">Admin notes</Text>
                      <Text size="sm">{store.adminNotes as string}</Text>
                    </Div>
                  )}

                  {/*
                    "Why is this store suspended and who did it" was previously
                    recoverable only from `adminAuditLog`, which the store
                    owner can never see. `statusHistory` rides on the store
                    document itself. `adminNotes` is deliberately NOT tracked —
                    its own schema comment says it is never shown to the owner.
                  */}
                  <RecordStatusTimeline
                    entries={store.statusHistory as never}
                    truncatedCount={store.statusHistoryTruncated as number | undefined}
                  />

                  <Text size="xs" color="muted">
                    Created {store.createdAt ? new Date(store.createdAt as string).toLocaleString() : "—"}
                  </Text>
                </Stack>
              )}

              {tab === "products" && (
                <Row gap="sm">
                  <Button asChild variant="outline">
                    <Link href={`/admin/products?storeId=${id}`}>Open Products filtered by store</Link>
                  </Button>
                </Row>
              )}
              {tab === "orders" && (
                <Row gap="sm">
                  <Button asChild variant="outline">
                    <Link href={`/admin/orders?storeId=${id}`}>Open Orders filtered by store</Link>
                  </Button>
                </Row>
              )}
              {tab === "reviews" && (
                <Row gap="sm">
                  <Button asChild variant="outline">
                    <Link href={`/admin/reviews?storeId=${id}`}>Open Reviews filtered by store</Link>
                  </Button>
                </Row>
              )}
              {tab === "payouts" && (
                <Row gap="sm">
                  <Button asChild variant="outline">
                    <Link href={`/admin/payouts?storeId=${id}`}>Open Payouts filtered by store</Link>
                  </Button>
                </Row>
              )}
              {tab === "coupons" && (
                <Row gap="sm">
                  <Button asChild variant="outline">
                    <Link href={`/admin/coupons?storeId=${id}`}>Open Coupons filtered by store</Link>
                  </Button>
                </Row>
              )}

              <AdminStoreEditorView
                open={editorOpen}
                onClose={() => {
                  setEditorOpen(false);
                  reload();
                }}
                storeId={id}
                storeName={store.storeName as string}
                currentStatus={status}
                currentIsVerified={Boolean(store.isVerified)}
                currentIsFeatured={Boolean(store.isFeatured)}
                currentCapabilities={capabilities}
              />
            </>
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
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
