"use client";
import { Row, Stack, normalizeError, DASHBOARD_QUICK_ACTIONS, DASHBOARD_QUICK_ACTION_META, type DashboardQuickActionId } from "@mohasinac/appkit/client";
import { AdminDashboardView, ROUTES, Span, Text, Div, Grid, Toggle, useToast, DynamicBgDiv, useFeatureFlags, CollapsibleSection, useCollapsedSections } from "@mohasinac/appkit/client";
import { ADMIN_CHECKOUT_BYPASS_FLAG_KEY } from "@mohasinac/appkit/client";
import {
  Plus, UserPlus, Store, Tag, Calendar, FileText, Settings,
  ShoppingBag, Banknote, BarChart, LifeBuoy, ShieldAlert, BookOpen,
  Users, Star, HelpCircle, Layout, Layers,
  AlertTriangle, Package2, Gift, ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fetchAdminResource, getCheckoutBypassStatus, setFeatureFlags } from "@/lib/api/admin-client";
import { API_ROUTES } from "@/constants";
import { useCallback, useEffect, useRef, useState } from "react";

const __P = {
  p5: "p-[var(--appkit-space-5)]",
} as const;


const __O = {
  hidden: "overflow-hidden",
} as const;
function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row className="border-b border-[var(--appkit-color-border-subtle)] last:border-0" padding="y-sm" align="center" justify="between" gap="md">
      <Div className="flex-1 min-w-0">
        <Text size="sm" weight="medium">{label}</Text>
        <Text size="xs" color="muted" className="mt-0.5">{description}</Text>
      </Div>
      <Toggle checked={enabled} onChange={onChange} size="md" />
    </Row>
  );
}

const BRAND_GRAD = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)";

// Data-driven off DASHBOARD_QUICK_ACTIONS.admin / DASHBOARD_QUICK_ACTION_META
// (appkit/src/features/products/constants/action-defs.ts) — the single source
// of quick-action labels/icons/RBAC metadata. This page only owns the
// href + icon-component resolution, since those are Next.js/lucide specifics
// the shared config can't hold directly.
const ADMIN_QUICK_ACTION_ICONS: Record<string, LucideIcon> = {
  Plus, UserPlus, Store, Tag, Calendar, FileText, Settings,
  ShoppingBag, Banknote, BarChart, LifeBuoy, ShieldAlert, BookOpen,
  Users, Star, HelpCircle, Layout, Layers,
  AlertTriangle, Package2, Gift, ClipboardCheck,
};
const ADMIN_QUICK_ACTION_HREFS: Partial<Record<DashboardQuickActionId, string>> = {
  "dqa-admin-add-product": String(ROUTES.ADMIN.PRODUCTS_NEW),
  "dqa-admin-add-user": String(ROUTES.ADMIN.USERS),
  "dqa-admin-add-store": String(ROUTES.ADMIN.STORES),
  "dqa-admin-add-coupon": String(ROUTES.ADMIN.COUPONS),
  "dqa-admin-add-event": String(ROUTES.ADMIN.EVENTS),
  "dqa-admin-add-blog": String(ROUTES.ADMIN.BLOG),
  "dqa-admin-settings": String(ROUTES.ADMIN.SITE),
  "dqa-admin-stores": String(ROUTES.ADMIN.STORES),
  "dqa-admin-orders": String(ROUTES.ADMIN.ORDERS),
  "dqa-admin-payouts": String(ROUTES.ADMIN.PAYOUTS),
  "dqa-admin-analytics": String(ROUTES.ADMIN.ANALYTICS),
  "dqa-admin-events": String(ROUTES.ADMIN.EVENTS),
  "dqa-admin-support": String(ROUTES.ADMIN.SUPPORT_TICKETS),
  "dqa-admin-moderation": String(ROUTES.ADMIN.MODERATION),
  "dqa-admin-users": String(ROUTES.ADMIN.USERS),
  "dqa-admin-categories": String(ROUTES.ADMIN.CATEGORIES),
  "dqa-admin-reviews": String(ROUTES.ADMIN.REVIEWS),
  "dqa-admin-faqs": String(ROUTES.ADMIN.FAQS),
  "dqa-admin-carousel": String(ROUTES.ADMIN.CAROUSEL),
  "dqa-admin-sections": String(ROUTES.ADMIN.SECTIONS),
  "dqa-admin-blog": String(ROUTES.ADMIN.BLOG),
  "dqa-admin-scammers": String(ROUTES.ADMIN.SCAMMERS),
  "dqa-admin-bundles": String(ROUTES.ADMIN.BUNDLES),
  "dqa-admin-prize-draws": String(ROUTES.ADMIN.PRIZE_DRAWS),
  "dqa-admin-tester-checklist": String(ROUTES.ADMIN.TESTER_CHECKLIST),
};
const QUICK_ACTIONS = DASHBOARD_QUICK_ACTIONS.admin
  .map((id) => {
    const meta = DASHBOARD_QUICK_ACTION_META[id];
    const href = ADMIN_QUICK_ACTION_HREFS[id];
    const Icon = meta.iconName ? ADMIN_QUICK_ACTION_ICONS[meta.iconName] : undefined;
    return href && Icon ? { label: meta.label, href, Icon } : null;
  })
  .filter((a): a is { label: string; href: string; Icon: LucideIcon } => a !== null);

interface DashboardStats {
  pendingOrders: number;
  // null when the owning feature flag is off — the card is hidden entirely
  // in that case (see renderAlerts below), this is just the resting value.
  pendingPayouts: number | null;
  pendingReviews: number;
  activeCoupons: number | null;
}

interface RecentOrder {
  id: string;
  status: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
}

function StatCard({ label, value, href }: { label: string; value: number | null; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-[var(--appkit-space-1)] rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3-5)] shadow-sm hover:border-[var(--appkit-color-primary)] transition-colors"
    >
      <Span size="xs" className="text-[var(--appkit-color-text-muted)]">{label}</Span>
      <Span weight="bold" className="text-[var(--appkit-color-text)]" size="2xl">
        {value === null ? "—" : value}
      </Span>
    </Link>
  );
}

const DASHBOARD_SECTION_IDS = [
  "admin-dashboard:stats",
  "admin-dashboard:quick-actions",
  "admin-dashboard:recent-orders",
];

export default function Page() {
  const { showToast } = useToast();
  const { flags, isLoading: flagsLoading } = useFeatureFlags();
  const { isCollapsed, toggle } = useCollapsedSections({ sectionIds: DASHBOARD_SECTION_IDS });
  const [adminBypassEnabled, setAdminBypassEnabled] = useState(false);
  const [bypassLoading, setBypassLoading] = useState(false);
  const bypassFetched = useRef(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (bypassFetched.current) return;
    bypassFetched.current = true;
    getCheckoutBypassStatus()
      .then((r) => {
        if (!r.ok) throw new Error(`checkout-bypass HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data?.data?.enabled !== undefined) {
          setAdminBypassEnabled(data.data.enabled as boolean);
        }
      })
      .catch((err) => {
        setLoadError((prev) => prev ?? (normalizeError(err).message || "Couldn't load checkout-bypass flag."));
      });
  }, []);

  useEffect(() => {
    // Wait for the flag snapshot before deciding what to fetch — Payouts and
    // Coupons are both feature-guarded server-side (404 when off); calling
    // them unconditionally is exactly the bug this rewrite fixes.
    if (flagsLoading) return;

    const fetchJson = async <T,>(url: string, label: string): Promise<T> => {
      return fetchAdminResource<T>(url).catch((err: unknown) => { throw err instanceof Error ? err : new Error(`${label} failed`); });
    };

    // Two response-shape conventions coexist in the admin API: orders/payouts
    // nest their totals under meta/summary; reviews/coupons return a flat
    // {items,total} shape. Type each call to match its route exactly instead
    // of guessing one shape for all four (the original bug here).
    const ordersPromise = fetchJson<{ data?: { orders?: RecentOrder[]; meta?: { total?: number } } }>(
      `${API_ROUTES.ADMIN.ORDERS}?filters=status==PENDING&pageSize=1`, "orders",
    );
    const reviewsPromise = fetchJson<{ data?: { total?: number } }>(
      `${API_ROUTES.ADMIN.REVIEWS}?filters=status==pending&pageSize=1`, "reviews",
    );
    const payoutsPromise = flags.PAYOUTS
      ? fetchJson<{ data?: { summary?: { pending?: number } } }>(`${API_ROUTES.ADMIN.PAYOUTS}?pageSize=1`, "payouts")
      : Promise.resolve(null);
    const couponsPromise = flags.COUPONS
      ? fetchJson<{ data?: { total?: number } }>(
          `${API_ROUTES.ADMIN.COUPONS}?filters=validity.isActive==true&pageSize=1`, "coupons",
        )
      : Promise.resolve(null);

    Promise.all([ordersPromise, payoutsPromise, reviewsPromise, couponsPromise])
      .then(([orders, payouts, reviews, coupons]) => {
        setStats({
          pendingOrders: orders?.data?.meta?.total ?? 0,
          // The payouts route already computes a full status breakdown
          // server-side regardless of filters — read it directly rather
          // than re-deriving "pending" from a filtered list call.
          pendingPayouts: payouts?.data?.summary?.pending ?? null,
          pendingReviews: reviews?.data?.total ?? 0,
          activeCoupons: coupons?.data?.total ?? null,
        });
      })
      .catch((err) => {
        const msg = normalizeError(err).message || "Couldn't load dashboard stats.";
        setLoadError((prev) => prev ?? msg);
        showToast(msg, "error");
      });

    fetchJson<{ data?: { orders?: RecentOrder[] } }>(`${API_ROUTES.ADMIN.ORDERS}?sorts=-createdAt&pageSize=5`, "recent orders")
      .then((data) => {
        if (data?.data?.orders) setRecentOrders(data.data.orders);
      })
      .catch((err) => {
        const msg = normalizeError(err).message || "Couldn't load recent orders.";
        setLoadError((prev) => prev ?? msg);
      });
  }, [showToast, flagsLoading, flags.PAYOUTS, flags.COUPONS]);

  const toggleAdminBypass = useCallback(async (next: boolean) => {
    setBypassLoading(true);
    try {
      await setFeatureFlags({ [ADMIN_CHECKOUT_BYPASS_FLAG_KEY]: next });
      setAdminBypassEnabled(next);
      showToast(next ? "Checkout bypass enabled." : "Checkout bypass disabled.", "success");
    } catch (err) {
      void normalizeError(err);
      showToast(err instanceof Error ? err.message : "Failed to toggle bypass.", "error");
    } finally {
      setBypassLoading(false);
    }
  }, [showToast]);

  return (
    <AdminDashboardView
      labels={{ title: "Admin Dashboard" }}
      renderAlerts={() => (
        <Stack gap="3">
          {loadError && (
            <Div className="border border-error/30" color="error" surface="danger-surface" padding="md" rounded="xl">
              <Text size="sm">
                <Span weight="semibold">Couldn&apos;t load dashboard data — </Span>
                <Span>{loadError}. Refresh to retry; if it persists, your admin session may have expired.</Span>
              </Text>
            </Div>
          )}
          <CollapsibleSection
            title="Stats"
            isCollapsed={isCollapsed("admin-dashboard:stats")}
            onToggle={() => toggle("admin-dashboard:stats")}
          >
            <Grid cols={2} gap="3" className="sm:grid-cols-4">
              <StatCard label="Pending Orders" value={stats?.pendingOrders ?? null} href={String(ROUTES.ADMIN.ORDERS)} />
              {flags.PAYOUTS && (
                <StatCard label="Pending Payouts" value={stats?.pendingPayouts ?? null} href={String(ROUTES.ADMIN.PAYOUTS)} />
              )}
              <StatCard label="Pending Reviews" value={stats?.pendingReviews ?? null} href={String(ROUTES.ADMIN.REVIEWS)} />
              {flags.COUPONS && (
                <StatCard label="Active Coupons" value={stats?.activeCoupons ?? null} href={String(ROUTES.ADMIN.COUPONS)} />
              )}
            </Grid>
          </CollapsibleSection>
        </Stack>
      )}
      renderQuickActions={() => (
        <CollapsibleSection
          title="Quick Actions"
          isCollapsed={isCollapsed("admin-dashboard:quick-actions")}
          onToggle={() => toggle("admin-dashboard:quick-actions")}
        >
          <Stack gap="xl">
            <Grid cols={2} gap="3" className="sm:grid-cols-4">
              {QUICK_ACTIONS.map(({ label, href, Icon }) => (
                <Link
                  key={label}
                  href={String(href)}
                  className="group flex items-center gap-[var(--appkit-space-3)] rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3-5)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
                >
                  <DynamicBgDiv
                    background={BRAND_GRAD}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md"
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </DynamicBgDiv>
                  {label}
                </Link>
              ))}
            </Grid>

            <Div className={`border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p5}`} rounded="xl">
              <Row className="mb-4" align="center" gap="sm">
                <Text size="sm" weight="semibold">Dev Settings</Text>
                {adminBypassEnabled && (
                  <Span size="xs" weight="medium" surface="subtle" padding="pill-sm" rounded="full" className="text-warning">
                    Bypass active
                  </Span>
                )}
              </Row>
              <ToggleRow
                label="Admin Checkout Bypass"
                description={
                  bypassLoading
                    ? "Saving…"
                    : adminBypassEnabled
                      ? "Bypass active — OTP + payment skipped for admin orders (server-enforced)"
                      : "Allow admins to skip OTP and payment at checkout (for testing)"
                }
                enabled={adminBypassEnabled}
                onChange={toggleAdminBypass}
              />
            </Div>
          </Stack>
        </CollapsibleSection>
      )}
      renderRecentActivity={() =>
        recentOrders.length > 0 ? (
          <CollapsibleSection
            title="Recent Orders"
            isCollapsed={isCollapsed("admin-dashboard:recent-orders")}
            onToggle={() => toggle("admin-dashboard:recent-orders")}
            renderHeaderExtra={() => (
              <Link href={String(ROUTES.ADMIN.ORDERS)} className="text-[length:var(--appkit-text-xs)] text-[var(--appkit-color-primary)] hover:underline">View all →</Link>
            )}
          >
            <Div className={`-mx-[var(--appkit-space-4)] -mt-[var(--appkit-space-4)] divide-y divide-[var(--appkit-color-border-subtle)] ${__O.hidden}`}>
              {recentOrders.map((order) => (
                <Link key={order.id} href={String(ROUTES.ADMIN.ORDER_DETAIL(order.id))} className="flex items-center justify-between px-[var(--appkit-space-4)] py-[var(--appkit-space-2-5)] hover:bg-[var(--appkit-color-surface-hover)] transition-colors">
                  <Text className="font-mono text-[var(--appkit-color-text-muted)]" size="xs">{order.id}</Text>
                  <Row align="center" gap="3">
                    <Text className="text-[var(--appkit-color-text-muted)]" size="xs">{order.status}</Text>
                    <Text className="text-[var(--appkit-color-text)]" size="xs" weight="semibold">
                      ₹{(order.totalPrice ?? 0).toLocaleString("en-IN")}
                    </Text>
                  </Row>
                </Link>
              ))}
            </Div>
          </CollapsibleSection>
        ) : null
      }
    />
  );
}
