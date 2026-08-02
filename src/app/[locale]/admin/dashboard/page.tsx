"use client";
import { Row, Stack, normalizeError } from "@mohasinac/appkit";
import { AdminDashboardView, ROUTES, Span, Text, Div, Grid, Toggle, useToast, DynamicBgDiv } from "@mohasinac/appkit/client";
import { ADMIN_CHECKOUT_BYPASS_FLAG_KEY } from "@mohasinac/appkit";
import { Users, Tag, Star, Ticket, HelpCircle, Settings, Layout, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fetchAdminResource, getCheckoutBypassStatus, setFeatureFlags } from "@/lib/api/admin-client";
import { useCallback, useEffect, useRef, useState } from "react";

const __P = {
  p5: "p-5",
} as const;


const __O = {
  hidden: "overflow-hidden",
} as const;
const STORAGE_KEY = "letitrip_dev_prefs";

interface DevPrefs {
  mockRazorpay: boolean;
  mockShiprocket: boolean;
}

const DEFAULT_PREFS: DevPrefs = { mockRazorpay: false, mockShiprocket: false };

function loadPrefs(): DevPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

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

const QUICK_ACTIONS = [
  { label: "Users",         href: ROUTES.ADMIN.USERS,       Icon: Users },
  { label: "Categories",    href: ROUTES.ADMIN.CATEGORIES,  Icon: Tag },
  { label: "Reviews",       href: ROUTES.ADMIN.REVIEWS,     Icon: Star },
  { label: "Coupons",       href: ROUTES.ADMIN.COUPONS,     Icon: Ticket },
  { label: "FAQs",          href: ROUTES.ADMIN.FAQS,        Icon: HelpCircle },
  { label: "Site Settings", href: ROUTES.ADMIN.SITE,        Icon: Settings },
  { label: "Carousel",      href: ROUTES.ADMIN.CAROUSEL,    Icon: Layout },
  { label: "Sections",      href: ROUTES.ADMIN.SECTIONS,    Icon: Layers },
];

interface DashboardStats {
  pendingOrders: number;
  pendingPayouts: number;
  pendingReviews: number;
  activeCoupons: number;
}

interface RecentOrder {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

function StatCard({ label, value, href }: { label: string; value: number | null; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3.5 shadow-sm hover:border-[var(--appkit-color-primary)] transition-colors"
    >
      <Span size="xs" className="text-[var(--appkit-color-text-muted)]">{label}</Span>
      <Span weight="bold" className="text-[var(--appkit-color-text)]" size="2xl">
        {value === null ? "—" : value}
      </Span>
    </Link>
  );
}

export default function Page() {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<DevPrefs>(DEFAULT_PREFS);
  const [adminBypassEnabled, setAdminBypassEnabled] = useState(false);
  const [bypassLoading, setBypassLoading] = useState(false);
  const bypassFetched = useRef(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

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
        setLoadError((prev) => prev ?? (err instanceof Error ? err.message : "Couldn't load checkout-bypass flag."));
      });
  }, []);

  useEffect(() => {
    const fetchJson = async (url: string, label: string) => {
      const data = await fetchAdminResource(url).catch((err: unknown) => { throw err instanceof Error ? err : new Error(`${label} failed`); });
      return data;
    };

    Promise.all([
      fetchJson("/api/admin/orders?status=PENDING&pageSize=1", "orders"),
      fetchJson("/api/admin/payouts?status=PENDING&pageSize=1", "payouts"),
      fetchJson("/api/admin/reviews?status=pending&pageSize=1", "reviews"),
      fetchJson("/api/admin/coupons?validity.isActive=true&pageSize=1", "coupons"),
    ])
      .then(([orders, payouts, reviews, coupons]) => {
        setStats({
          pendingOrders: orders?.data?.total ?? orders?.data?.items?.length ?? 0,
          pendingPayouts: payouts?.data?.total ?? payouts?.data?.items?.length ?? 0,
          pendingReviews: reviews?.data?.total ?? reviews?.data?.items?.length ?? 0,
          activeCoupons: coupons?.data?.total ?? coupons?.data?.items?.length ?? 0,
        });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Couldn't load dashboard stats.";
        setLoadError((prev) => prev ?? msg);
        showToast(msg, "error");
      });

    fetchJson("/api/admin/orders?sort=-createdAt&pageSize=5", "recent orders")
      .then((data) => {
        if (data?.data?.items) setRecentOrders(data.data.items as RecentOrder[]);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Couldn't load recent orders.";
        setLoadError((prev) => prev ?? msg);
      });
  }, [showToast]);

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

  const update = useCallback((patch: Partial<DevPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, [prefs]);

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
          <Grid cols={2} gap="3" className="sm:grid-cols-4">
            <StatCard label="Pending Orders" value={stats?.pendingOrders ?? null} href={String(ROUTES.ADMIN.ORDERS)} />
            <StatCard label="Pending Payouts" value={stats?.pendingPayouts ?? null} href={String(ROUTES.ADMIN.PAYOUTS)} />
            <StatCard label="Pending Reviews" value={stats?.pendingReviews ?? null} href={String(ROUTES.ADMIN.REVIEWS)} />
            <StatCard label="Active Coupons" value={stats?.activeCoupons ?? null} href={String(ROUTES.ADMIN.COUPONS)} />
          </Grid>
        </Stack>
      )}
      renderQuickActions={() => (
        <Stack gap="xl">
          <Grid cols={2} gap="3" className="sm:grid-cols-4">
            {QUICK_ACTIONS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={String(href)}
                className="group flex items-center gap-3 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3.5 text-sm font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
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
              {(prefs.mockRazorpay || prefs.mockShiprocket || adminBypassEnabled) && (
                <Span size="xs" weight="medium" surface="subtle" padding="pill-sm" rounded="full" className="text-warning">
                  Mock active
                </Span>
              )}
            </Row>
            <ToggleRow
              label="Mock Razorpay"
              description={prefs.mockRazorpay ? "Routing to /api/dev/mock-razorpay" : "Use mock instead of live Razorpay keys"}
              enabled={prefs.mockRazorpay}
              onChange={(v) => update({ mockRazorpay: v })}
            />
            <ToggleRow
              label="Mock Shiprocket"
              description={prefs.mockShiprocket ? "Routing to /api/dev/mock-shiprocket" : "Use mock for shipping flows"}
              enabled={prefs.mockShiprocket}
              onChange={(v) => update({ mockShiprocket: v })}
            />
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
            <Row align="center" justify="between" gap="md" padding="y-sm">
              <>
                <Text size="sm" weight="medium" color="primary">Seed Data</Text>
                <Text className="mt-0.5" color="muted" size="xs">Load or reset Firestore seed collections</Text>
              </>
              <Link
                href={ROUTES.DEMO.SEED}
                className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--appkit-color-border-subtle)] text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-primary)] hover:text-white transition-colors"
              >
                Open Seed Panel →
              </Link>
            </Row>
          </Div>
        </Stack>
      )}
      renderRecentActivity={() =>
        recentOrders.length > 0 ? (
          <Div className={`border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__O.hidden}`} rounded="xl">
            <Row className="border-b border-[var(--appkit-color-border-subtle)]" padding="md" align="center" justify="between">
              <Text className="text-[var(--appkit-color-text)]" size="sm" weight="semibold">Recent Orders</Text>
              <Link href={String(ROUTES.ADMIN.ORDERS)} className="text-xs text-[var(--appkit-color-primary)] hover:underline">View all →</Link>
            </Row>
            <Div className="divide-y divide-[var(--appkit-color-border-subtle)]">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`${String(ROUTES.ADMIN.ORDERS)}/${order.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--appkit-color-surface-hover)] transition-colors">
                  <Text className="font-mono text-[var(--appkit-color-text-muted)]" size="xs">{order.id}</Text>
                  <Row align="center" gap="3">
                    <Text className="text-[var(--appkit-color-text-muted)]" size="xs">{order.status}</Text>
                    <Text className="text-[var(--appkit-color-text)]" size="xs" weight="semibold">
                      ₹{((order.totalAmount ?? 0) / 100).toLocaleString("en-IN")}
                    </Text>
                  </Row>
                </Link>
              ))}
            </Div>
          </Div>
        ) : null
      }
    />
  );
}
