"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useSession,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Button,

} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";

interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  listingType?: string;
  digitalCode?: string;
}

interface OrderDoc {
  id: string;
  status: string;
  createdAt: string | Date;
  items: OrderItem[];
}

function paise(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function CodeRevealRow({ item, orderId }: { item: OrderItem; orderId: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const code = item.digitalCode;

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Div className="rounded-lg border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] p-4 space-y-3">
      <Row justify="between" align="start">
        <Div className="space-y-0.5">
          <Link
            href={String(ROUTES.PUBLIC.DIGITAL_CODE_DETAIL(item.productId))}
            className="text-sm font-semibold text-[var(--appkit-color-text)] hover:underline line-clamp-1"
          >
            {item.productTitle}
          </Link>
          <Text variant="secondary" className="text-xs">{paise(item.price)}</Text>
        </Div>
        <Link
          href={String(ROUTES.USER.ORDER_DETAIL(orderId))}
          className="text-xs text-[var(--appkit-color-primary)] hover:underline shrink-0"
        >
          View order
        </Link>
      </Row>
      {code ? (
        <Div className="rounded-md bg-[var(--appkit-color-surface-input)] border border-[var(--appkit-color-border)] p-3">
          <Row justify="between" align="center" gap="3">
            <Text className="font-mono text-sm text-[var(--appkit-color-text)] break-all">
              {revealed ? code : "•••• •••• •••• ••••"}
            </Text>
            <Row gap="xs" className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevealed((v) => !v)}
              >
                {revealed ? "Hide" : "Reveal"}
              </Button>
              {revealed && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </Row>
          </Row>
        </Div>
      ) : (
        <Text variant="secondary" className="text-xs">
          Code will appear here once your order is confirmed.
        </Text>
      )}
    </Div>
  );
}

export default function UserDigitalCodesPage() {
  const { user, loading: sessionLoading } = useSession();

  const { data, isLoading } = useQuery<{ items: OrderDoc[] }>({
    queryKey: ["user-digital-codes"],
    queryFn: () =>
      fetch(`${API_ROUTES.USER.ORDERS}?perPage=100`)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 30_000,
  });

  const codeItems = useMemo(() => {
    const result: Array<{ orderId: string; item: OrderItem }> = [];
    for (const order of data?.items ?? []) {
      for (const item of order.items ?? []) {
        if (item.listingType === "digital-code") {
          result.push({ orderId: order.id, item });
        }
      }
    }
    return result;
  }, [data]);

  const loading = sessionLoading || isLoading;

  return (
    <Div className="w-full max-w-3xl space-y-6">
      <Div>
        <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
          My Digital Codes
        </Heading>
        {!loading && (
          <Text variant="secondary" className="text-sm mt-0.5">
            {codeItems.length} code{codeItems.length !== 1 ? "s" : ""}
          </Text>
        )}
      </Div>

      {loading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--appkit-color-border)] p-5 space-y-3"
            >
              <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
              <Div className="h-8 w-full rounded bg-[var(--appkit-color-border)]" />
            </Div>
          ))}
        </Stack>
      ) : codeItems.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">You haven&apos;t purchased any digital codes yet.</Text>
          <Link
            href={String(ROUTES.PUBLIC.DIGITAL_CODES)}
            className="mt-3 inline-block text-sm text-[var(--appkit-color-primary)] hover:underline"
          >
            Browse digital codes
          </Link>
        </Div>
      ) : (
        <Stack gap="sm">
          {codeItems.map(({ orderId, item }, idx) => (
            <CodeRevealRow key={`${orderId}-${idx}`} item={item} orderId={orderId} />
          ))}
        </Stack>
      )}
    </Div>
  );
}
