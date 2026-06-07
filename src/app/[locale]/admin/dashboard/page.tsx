"use client";
import { AdminDashboardView, ROUTES, Text, Div, Toggle, useToast } from "@mohasinac/appkit/client";
import { Users, Tag, Star, Ticket, HelpCircle, Settings, Layout, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
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
    <Div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--appkit-color-border-subtle)] last:border-0">
      <Div className="flex-1 min-w-0">
        <Div className="text-sm font-medium text-[var(--appkit-color-text)]">{label}</Div>
        <Div className="text-xs text-[var(--appkit-color-text-muted)] mt-0.5">{description}</Div>
      </Div>
      <Toggle checked={enabled} onChange={onChange} size="md" />
    </Div>
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
      <span className="text-xs text-[var(--appkit-color-text-muted)]">{label}</span>
      <span className="text-2xl font-bold text-[var(--appkit-color-text)]">
        {value === null ? "—" : value}
      </span>
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

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    if (bypassFetched.current) return;
    bypassFetched.current = true;
    fetch("/api/admin/checkout-bypass", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.data?.enabled !== undefined) {
          setAdminBypassEnabled(data.data.enabled as boolean);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders?status=PENDING&pageSize=1", { credentials: "include" }).then(r => r.ok ? r.json() : null),
      fetch("/api/admin/payouts?status=PENDING&pageSize=1", { credentials: "include" }).then(r => r.ok ? r.json() : null),
      fetch("/api/admin/reviews?status=pending&pageSize=1", { credentials: "include" }).then(r => r.ok ? r.json() : null),
      fetch("/api/admin/coupons?validity.isActive=true&pageSize=1", { credentials: "include" }).then(r => r.ok ? r.json() : null),
    ]).then(([orders, payouts, reviews, coupons]) => {
      setStats({
        pendingOrders: orders?.data?.total ?? orders?.data?.items?.length ?? 0,
        pendingPayouts: payouts?.data?.total ?? payouts?.data?.items?.length ?? 0,
        pendingReviews: reviews?.data?.total ?? reviews?.data?.items?.length ?? 0,
        activeCoupons: coupons?.data?.total ?? coupons?.data?.items?.length ?? 0,
      });
    }).catch(() => {});

    fetch("/api/admin/orders?sort=-createdAt&pageSize=5", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.items) setRecentOrders(data.data.items as RecentOrder[]);
      })
      .catch(() => {});
  }, []);

  const toggleAdminBypass = useCallback(async (next: boolean) => {
    setBypassLoading(true);
    try {
      await fetch("/api/admin/feature-flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ flags: { adminCheckoutBypass: next } }),
      });
      setAdminBypassEnabled(next);
      showToast(next ? "Checkout bypass enabled." : "Checkout bypass disabled.", "success");
    } catch (err) {
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
        <Div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Pending Orders" value={stats?.pendingOrders ?? null} href={String(ROUTES.ADMIN.ORDERS)} />
          <StatCard label="Pending Payouts" value={stats?.pendingPayouts ?? null} href={String(ROUTES.ADMIN.PAYOUTS)} />
          <StatCard label="Pending Reviews" value={stats?.pendingReviews ?? null} href={String(ROUTES.ADMIN.REVIEWS)} />
          <StatCard label="Active Coupons" value={stats?.activeCoupons ?? null} href={String(ROUTES.ADMIN.COUPONS)} />
        </Div>
      )}
      renderQuickActions={() => (
        <Div className="space-y-8">
          <Div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={String(href)}
                className="group flex items-center gap-3 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3.5 text-sm font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
              >
                <Div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ background: BRAND_GRAD }}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </Div>
                {label}
              </Link>
            ))}
          </Div>

          <Div className={`rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p5}`}>
            <Div className="flex items-center gap-2 mb-4">
              <Div className="text-sm font-semibold text-[var(--appkit-color-text)]">Dev Settings</Div>
              {(prefs.mockRazorpay || prefs.mockShiprocket || adminBypassEnabled) && (
                <Div className="text-xs px-2 py-0.5 rounded-full bg-warning-surface text-warning font-medium">
                  Mock active
                </Div>
              )}
            </Div>
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
            <Div className="flex items-center justify-between gap-4 py-3">
              <>
                <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Seed Data</Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Load or reset Firestore seed collections</Text>
              </>
              <Link
                href={ROUTES.DEMO.SEED}
                className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--appkit-color-border-subtle)] text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-primary)] hover:text-white transition-colors"
              >
                Open Seed Panel →
              </Link>
            </Div>
          </Div>
        </Div>
      )}
      renderRecentActivity={() =>
        recentOrders.length > 0 ? (
          <Div className={`rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__O.hidden}`}>
            <Div className="flex items-center justify-between px-4 py-3 border-b border-[var(--appkit-color-border-subtle)]">
              <Text className="text-sm font-semibold text-[var(--appkit-color-text)]">Recent Orders</Text>
              <Link href={String(ROUTES.ADMIN.ORDERS)} className="text-xs text-[var(--appkit-color-primary)] hover:underline">View all →</Link>
            </Div>
            <Div className="divide-y divide-[var(--appkit-color-border-subtle)]">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`${String(ROUTES.ADMIN.ORDERS)}/${order.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--appkit-color-surface-hover)] transition-colors">
                  <Text className="text-xs font-mono text-[var(--appkit-color-text-muted)]">{order.id}</Text>
                  <Div className="flex items-center gap-3">
                    <Text className="text-xs text-[var(--appkit-color-text-muted)]">{order.status}</Text>
                    <Text className="text-xs font-semibold text-[var(--appkit-color-text)]">
                      ₹{((order.totalAmount ?? 0) / 100).toLocaleString("en-IN")}
                    </Text>
                  </Div>
                </Link>
              ))}
            </Div>
          </Div>
        ) : null
      }
    />
  );
}
