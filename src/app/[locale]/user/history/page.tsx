"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useSession,
  useHistory,
  ROUTES,
  HISTORY_MAX,
  ConfirmDeleteModal,
  MediaImage,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Button,
  type GuestHistoryItem,
} from "@mohasinac/appkit/client";
import { Span } from "@mohasinac/appkit/ui";

type FilterKey = "all" | "product" | "auction" | "preorder";

const TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "product", label: "Products" },
  { key: "auction", label: "Auctions" },
  { key: "preorder", label: "Pre-orders" },
];

const TYPE_LABEL: Record<GuestHistoryItem["productType"], string> = {
  product: "Product",
  auction: "Auction",
  preorder: "Pre-order",
};

const TAB_BTN_BASE =
  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors";
const TAB_BTN_ACTIVE = "bg-primary text-white";
const TAB_BTN_IDLE =
  "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-zinc-300 dark:hover:bg-slate-700";

const CARD =
  "rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-3 shadow-sm";
const TYPE_CHIP =
  "rounded-full bg-[var(--appkit-color-border-subtle)] px-2 py-0.5 capitalize text-[var(--appkit-color-text-muted)]";
const REMOVE_BTN =
  "shrink-0 rounded-full p-2 text-[var(--appkit-color-text-muted)] hover:bg-[var(--appkit-color-border-subtle)] hover:text-red-500";

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

interface HistoryRowProps {
  item: GuestHistoryItem;
  onRemove: (productId: string) => void;
}

function HistoryRow({ item, onRemove }: HistoryRowProps) {
  const href = detailHref(item);
  const title = item.productSnapshot?.title ?? item.productId;
  return (
    <Row gap="md" align="center" className={CARD}>
      <Link href={href} className="shrink-0">
        <Div className="relative h-16 w-16 overflow-hidden rounded-lg bg-[var(--appkit-color-border-subtle)]">
          <MediaImage
            src={item.productSnapshot?.thumb}
            alt={title}
            size="thumbnail"
            fallback={item.productType === "auction" ? "🎯" : item.productType === "preorder" ? "📅" : "📦"}
          />
        </Div>
      </Link>
      <Div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block line-clamp-1 text-sm font-semibold text-[var(--appkit-color-text)] hover:underline"
        >
          {title}
        </Link>
        <Row gap="sm" className="mt-1 items-center text-xs">
          <Span className={TYPE_CHIP}>{TYPE_LABEL[item.productType]}</Span>
          {item.productSnapshot?.storeName && (
            <Text variant="secondary" className="line-clamp-1 text-xs">
              {item.productSnapshot.storeName}
            </Text>
          )}
          <Text variant="secondary" className="text-xs">
            Visited {relativeTime(item.viewedAt)}
          </Text>
        </Row>
      </Div>
      <Button
        type="button"
        onClick={() => onRemove(item.productId)}
        aria-label={`Remove ${title} from history`}
        title="Remove from history"
        className={REMOVE_BTN}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
        </svg>
      </Button>
    </Row>
  );
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
          <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
            Recently Viewed
          </Heading>
          <Text variant="secondary" className="mt-0.5 text-sm">
            {items.length} of {HISTORY_MAX}
            {isGuest ? " · Sign in to keep your history across devices" : ""}
          </Text>
        </Div>
        {items.length > 0 && (
          <Button variant="secondary" onClick={() => setConfirmClear(true)} className="shrink-0">
            Clear all
          </Button>
        )}
      </Row>

      <Row gap="sm" className="flex-wrap">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`${TAB_BTN_BASE} ${filter === tab.key ? TAB_BTN_ACTIVE : TAB_BTN_IDLE}`}
          >
            {tab.label}
          </Button>
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
            <HistoryRow
              key={`${item.productType}:${item.productId}`}
              item={item}
              onRemove={remove}
            />
          ))}
        </Stack>
      )}

      <ConfirmDeleteModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          void clear();
          setConfirmClear(false);
        }}
        title="Clear all history?"
        message="This removes every item from your recently-viewed list. It cannot be undone."
        confirmText="Clear all"
        cancelText="Cancel"
        variant="warning"
      />
    </Div>
  );
}
