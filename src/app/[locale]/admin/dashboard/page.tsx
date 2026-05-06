"use client";
import { AdminDashboardView, ROUTES } from "@mohasinac/appkit/client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
    <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
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

const QUICK_ACTIONS = [
  { label: "Users", href: ROUTES.ADMIN.USERS },
  { label: "Categories", href: ROUTES.ADMIN.CATEGORIES },
  { label: "Reviews", href: ROUTES.ADMIN.REVIEWS },
  { label: "Coupons", href: ROUTES.ADMIN.COUPONS },
  { label: "FAQs", href: ROUTES.ADMIN.FAQS },
  { label: "Site Settings", href: ROUTES.ADMIN.SITE },
  { label: "Carousel", href: ROUTES.ADMIN.CAROUSEL },
  { label: "Sections", href: ROUTES.ADMIN.SECTIONS },
];

export default function Page() {
  const [prefs, setPrefs] = useState<DevPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(loadPrefs());
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
            {QUICK_ACTIONS.map(({ label, href }) => (
              <Link
                key={label}
                href={String(href)}
                className="rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-medium text-neutral-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Dev Settings</span>
              {(prefs.mockRazorpay || prefs.mockShiprocket) && (
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
          </div>
        </div>
      )}
    />
  );
}
