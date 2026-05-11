"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useSession,
  useHistory,
  ROUTES,
  HISTORY_MAX,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Button,
  type GuestHistoryItem,
} from "@mohasinac/appkit/client";

type FilterKey = "all" | "product" | "auction" | "preorder";

const TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "product", label: "Products" },
  { key: "auction", label: "Auctions" },
  { key: "preorder", label: "Pre-orders" },
];

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function detailHref(item: GuestHistoryItem): string {
  if (item.productType === "auction")
    return String(ROUTES.PUBLIC.AUCTION_DETAIL(item.productId));
  if (item.productType === "preorder")
    return String(ROUTES.PUBLIC.PRE_ORDER_DETAIL(item.productId));
  return String(ROUTES.PUBLIC.PRODUCT_DETAIL(item.productId));
}

export default function UserHistoryPage() {
  const { user } = useSession();
  const { items, remove, clear, isGuest } = useHistory(user?.uid);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.productType === filter)),
    [items, filter],
  );

  return (
    <Div className="w-full max-w-3xl space-y-6">
      <Row justify="between" align="end" wrap gap="3">
        <Div>
          <Heading
            level={1}
            className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Recently Viewed
          </Heading>
          <Text variant="secondary" className="text-sm mt-0.5">
            {items.length} of {HISTORY_MAX}
            {isGuest ? " · Sign in to keep your history across devices" : ""}
          </Text>
        </Div>
        {items.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => setConfirmClear(true)}
            className="shrink-0"
          >
            Clear all
          </Button>
        )}
      </Row>

      <Row gap="sm" className="flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-white"
                : "bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </Row>

      {filtered.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">
            Nothing here yet — products you view will appear here.
          </Text>
        </Div>
      ) : (
        <Stack gap="md">
          {filtered.map((item) => (
            <Row
              key={`${item.productType}:${item.productId}`}
              gap="md"
              align="center"
              className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3"
            >
              <Link href={detailHref(item)} className="shrink-0">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-slate-800">
                  {item.productSnapshot?.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productSnapshot.thumb}
                      alt={item.productSnapshot.title ?? item.productId}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              </Link>
              <Div className="min-w-0 flex-1">
                <Link
                  href={detailHref(item)}
                  className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline line-clamp-1"
                >
                  {item.productSnapshot?.title ?? item.productId}
                </Link>
                <Row gap="sm" className="mt-1 items-center text-xs">
                  <span className="rounded-full bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 capitalize">
                    {item.productType}
                  </span>
                  {item.productSnapshot?.storeName && (
                    <Text variant="secondary" className="text-xs line-clamp-1">
                      {item.productSnapshot.storeName}
                    </Text>
                  )}
                  <Text variant="secondary" className="text-xs">
                    Visited {relativeTime(item.viewedAt)}
                  </Text>
                </Row>
              </Div>
              <button
                type="button"
                onClick={() => remove(item.productId)}
                aria-label="Remove from history"
                className="shrink-0 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-rose-500"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </Row>
          ))}
        </Stack>
      )}

      {confirmClear && (
        <Div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 shadow-xl">
            <Heading level={3} className="text-base font-semibold">
              Clear all history?
            </Heading>
            <Text variant="secondary" className="text-sm mt-1">
              This removes every item from your recently-viewed list. It cannot be undone.
            </Text>
            <Row gap="sm" justify="end" className="mt-4">
              <Button variant="secondary" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  void clear();
                  setConfirmClear(false);
                }}
              >
                Clear all
              </Button>
            </Row>
          </Div>
        </Div>
      )}
    </Div>
  );
}
