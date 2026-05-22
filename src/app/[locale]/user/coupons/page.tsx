"use client";

/**
 * /user/coupons — Claimed-coupons wallet (plan §10).
 *
 * Tabs: Active / Expired / Used. Each tab renders cards driven by the
 * denormalised `couponSnapshot` so listing is one indexed read. The "Apply
 * at checkout" CTA deep-links to `/checkout?coupon=<code>` which the
 * checkout coupon panel reads on mount.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useSession,
  ROUTES,
  ACTIONS,
  Button,
  Div,
  Heading,
  Row,
  Stack,
  Text,
} from "@mohasinac/appkit/client";
import { useToast } from "@mohasinac/appkit/client";
import type { ClaimedCouponDocument } from "@mohasinac/appkit";

type Tab = "active" | "expired" | "used";

interface WalletPayload {
  active: ClaimedCouponDocument[];
  expired: ClaimedCouponDocument[];
  used: ClaimedCouponDocument[];
  total: number;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "active",  label: "Active"  },
  { key: "expired", label: "Expired" },
  { key: "used",    label: "Used"    },
];

function formatDiscount(c: ClaimedCouponDocument): string {
  const d = c.couponSnapshot.discount;
  if (c.couponSnapshot.type === "percentage") return `${d.value}% off`;
  if (c.couponSnapshot.type === "fixed") return `₹${(d.value / 100).toFixed(0)} off`;
  if (c.couponSnapshot.type === "free_shipping") return "Free shipping";
  return `${d.value}`;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function CouponWalletCard({
  claim,
  onApply,
  onRemove,
  removable,
}: {
  claim: ClaimedCouponDocument;
  onApply: () => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-2 shadow-sm">
      <Row align="center" gap="sm" className="flex-wrap">
        <Text className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-zinc-200">
          {claim.couponCode}
        </Text>
        <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {formatDiscount(claim)}
        </Text>
      </Row>
      <Heading level={3} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {claim.couponSnapshot.name}
      </Heading>
      {claim.couponSnapshot.description && (
        <Text className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {claim.couponSnapshot.description}
        </Text>
      )}
      <Text className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Claimed {formatDate(claim.claimedAt)}
        {claim.expiresAt ? ` · Expires ${formatDate(claim.expiresAt)}` : ""}
        {claim.usedOrderId ? ` · Order ${claim.usedOrderId}` : ""}
      </Text>
      <Row gap="xs" className="mt-1">
        {claim.status === "active" && (
          <Button
            size="sm"
            onClick={onApply}
            action={ACTIONS.USER["use-claimed-coupon"]}
          />
        )}
        {removable && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            action={ACTIONS.USER["remove-claimed-coupon"]}
          />
        )}
      </Row>
    </Div>
  );
}

export default function ClaimedCouponsPage() {
  const { user, loading: sessionLoading } = useSession();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("active");

  const { data, isLoading, refetch } = useQuery<{ data: WalletPayload }>({
    queryKey: ["user-coupons", user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const res = await fetch("/api/user/coupons", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load coupons");
      return res.json();
    },
  });

  const wallet = data?.data ?? { active: [], expired: [], used: [], total: 0 };
  const items = wallet[tab] ?? [];

  const handleApply = (code: string) => {
    if (typeof window === "undefined") return;
    // Coupons are applied at the cart stage (CartRouteClient reads ?coupon=).
    window.location.href = `${String(ROUTES.USER.CART)}?coupon=${encodeURIComponent(code)}`;
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/user/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      showToast("Coupon removed from wallet.", "info");
      void refetch();
    } catch {
      showToast("Could not remove coupon. Please try again.", "error");
    }
  };

  if (sessionLoading) return null;
  if (!user) {
    return (
      <Div className="py-12 text-center">
        <Text>Please sign in to view your coupons.</Text>
      </Div>
    );
  }

  return (
    <Stack gap="md">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          My Coupons
        </Heading>
        <Text variant="secondary" className="text-sm mt-0.5">
          Coupons you&apos;ve claimed from promotions, spin wheels and prize draws.
        </Text>
      </Div>

      {/* Tab bar */}
      <Row gap="xs" className="border-b border-zinc-200 dark:border-slate-700">
        {TABS.map((t) => {
          const count = wallet[t.key]?.length ?? 0;
          const active = t.key === tab;
          return (
            <Button
              key={t.key}
              type="button"
              variant={active ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTab(t.key)}
              className="rounded-b-none"
            >
              {t.label} {count > 0 ? `(${count})` : ""}
            </Button>
          );
        })}
      </Row>

      {/* Tab body */}
      {isLoading ? (
        <Div className="fluid-grid-card gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Div key={i} className="animate-pulse rounded-xl border border-zinc-200 dark:border-slate-700 h-32 bg-zinc-100 dark:bg-slate-800" />
          ))}
        </Div>
      ) : items.length === 0 ? (
        <Div className="py-16 text-center">
          <Text variant="secondary">No {tab} coupons.</Text>
        </Div>
      ) : (
        <Div className="fluid-grid-card gap-3">
          {items.map((c) => (
            <CouponWalletCard
              key={c.id}
              claim={c}
              onApply={() => handleApply(c.couponCode)}
              onRemove={() => handleRemove(c.id)}
              removable={tab === "active"}
            />
          ))}
        </Div>
      )}
    </Stack>
  );
}
