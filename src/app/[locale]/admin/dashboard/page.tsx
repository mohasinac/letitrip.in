"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-21: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-21) */
import { AdminDashboardView, ROUTES, Text } from "@mohasinac/appkit/client";
import { Users, Tag, Star, Ticket, HelpCircle, Settings, Layout, Layers } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--appkit-color-border-subtle)] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--appkit-color-text)]">{label}</div>
        <div className="text-xs text-[var(--appkit-color-text-muted)] mt-0.5">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-zinc-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
            enabled ? "left-5" : "left-1"
          }`}
        />
      </button>
    </div>
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

export default function Page() {
  const [prefs, setPrefs] = useState<DevPrefs>(DEFAULT_PREFS);
  const [adminBypassEnabled, setAdminBypassEnabled] = useState(false);
  const [bypassLoading, setBypassLoading] = useState(false);
  const bypassFetched = useRef(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  // Load adminCheckoutBypass from Firestore on mount.
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
    } catch {
      // silently revert on failure
    } finally {
      setBypassLoading(false);
    }
  }, []);

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
      renderQuickActions={() => (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={String(href)}
                className="group flex items-center gap-3 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3.5 text-sm font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ background: BRAND_GRAD }}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </span>
                {label}
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-[var(--appkit-color-text)]">Dev Settings</span>
              {(prefs.mockRazorpay || prefs.mockShiprocket || adminBypassEnabled) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                  Mock active
                </span>
              )}
            </div>
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
            <div className="flex items-center justify-between gap-4 py-3">
              <>
                <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Seed Data</Text>
                <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Load or reset Firestore seed collections</Text>
              </>
              <Link
                href="/demo/seed"
                className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--appkit-color-border-subtle)] text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-primary)] hover:text-white transition-colors"
              >
                Open Seed Panel →
              </Link>
            </div>
          </div>
        </div>
      )}
    />
  );
}
