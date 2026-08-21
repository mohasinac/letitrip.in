"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  ADMIN_ENDPOINTS,
  AdminPayoutMarkPaidModal,
  apiClient,
  Badge,
  Button,
  Code,
  Container,
  Div,
  Divider,
  formatCurrency,
  Heading,
  Row,
  Section,
  Stack,
  Text,
  type JsonValue,
} from "@mohasinac/appkit/client";

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  paid: "success",
  processing: "info",
  pending: "warning",
  failed: "danger",
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [payout, setPayout] = useState<Record<string, JsonValue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);

  const reload = () => {
    setIsLoading(true);
    apiClient
      .get<{ data?: Record<string, JsonValue> } | Record<string, JsonValue>>(ADMIN_ENDPOINTS.PAYOUT_BY_ID(id))
      .then((res) => setPayout((res as { data?: Record<string, JsonValue> })?.data ?? (res as Record<string, JsonValue>)))
      .catch(() => setPayout(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (id) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const status = ((payout?.status as string) ?? "pending").toLowerCase();
  const currency = (payout?.currency as string) ?? "INR";
  const orderIds = Array.isArray(payout?.orderIds) ? (payout!.orderIds as string[]) : [];
  const refundDeductions = Array.isArray(payout?.refundDeductions)
    ? (payout!.refundDeductions as Record<string, JsonValue>[])
    : [];
  const bankAccount = payout?.bankAccount as Record<string, JsonValue> | undefined;

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          {isLoading && !payout && <Text color="muted" size="sm">Loading payout…</Text>}
          {!isLoading && !payout && <Text color="muted" size="sm">Payout not found.</Text>}

          {payout && (
            <>
              <Row gap="md" align="start" justify="between" wrap>
                <Stack gap="xs">
                  <Row gap="sm" align="center" wrap>
                    <Heading level={1}>{formatCurrency(Number(payout.amount ?? 0), currency)}</Heading>
                    <Badge variant={STATUS_BADGE_VARIANT[status] ?? "default"}>{status}</Badge>
                  </Row>
                  <Text size="xs" color="muted">
                    {(payout.sellerName as string) ?? "—"} · store{" "}
                    <Link href={`/admin/stores/${payout.storeId as string}/view`} className="underline">
                      {(payout.storeId as string) ?? "—"}
                    </Link>{" "}
                    · id <Code className="font-mono">{id}</Code>
                  </Text>
                  {payout.sellerEmail != null && (
                    <Text size="xs" color="muted">{payout.sellerEmail as string}</Text>
                  )}
                </Stack>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={status === "paid"}
                  onClick={() => setMarkPaidOpen(true)}
                >
                  Mark as paid
                </Button>
              </Row>

              <Divider />

              <Stack gap="lg">
                <Stack gap="sm">
                  <Text size="sm" weight="semibold" color="muted">Amount breakdown</Text>
                  <Stack gap="xs" textSize="sm">
                    <Row justify="between">
                      <Text size="sm" color="muted">Gross amount</Text>
                      <Text size="sm" weight="medium">{formatCurrency(Number(payout.grossAmount ?? 0), currency)}</Text>
                    </Row>
                    <Row justify="between">
                      <Text size="sm" color="muted">Platform fee ({Number(payout.platformFeeRate ?? 0)}%)</Text>
                      <Text size="sm" weight="medium">-{formatCurrency(Number(payout.platformFee ?? 0), currency)}</Text>
                    </Row>
                    {payout.gatewayFee != null && (
                      <Row justify="between">
                        <Text size="sm" color="muted">Gateway fee</Text>
                        <Text size="sm" weight="medium">-{formatCurrency(Number(payout.gatewayFee ?? 0), currency)}</Text>
                      </Row>
                    )}
                    {payout.gstAmount != null && (
                      <Row justify="between">
                        <Text size="sm" color="muted">GST ({Number(payout.gstRate ?? 0)}%)</Text>
                        <Text size="sm" weight="medium">-{formatCurrency(Number(payout.gstAmount ?? 0), currency)}</Text>
                      </Row>
                    )}
                    {refundDeductions.length > 0 && (
                      <Row justify="between">
                        <Text size="sm" color="muted">Refund deductions</Text>
                        <Text size="sm" weight="medium" className="text-error">
                          -{formatCurrency(
                            refundDeductions.reduce((sum, d) => sum + Number(d.deductedAmount ?? 0), 0),
                            currency,
                          )}
                        </Text>
                      </Row>
                    )}
                    <Row justify="between" surface="muted" padding="sm" rounded="lg">
                      <Text size="sm" weight="bold">Net amount</Text>
                      <Text size="sm" weight="bold">
                        {formatCurrency(Number(payout.netAmount ?? payout.amount ?? 0), currency)}
                      </Text>
                    </Row>
                  </Stack>
                </Stack>

                {refundDeductions.length > 0 && (
                  <Stack gap="sm">
                    <Text size="sm" weight="semibold" color="muted">Refund deductions ({refundDeductions.length})</Text>
                    <Stack gap="xs">
                      {refundDeductions.map((d, i) => (
                        <Div key={`${d.orderId as string}-${i}`} rounded="lg" padding="sm" surface="muted" border="default">
                          <Row justify="between">
                            <Text size="sm" weight="medium">
                              <Link href={`/admin/orders/${d.orderId as string}/view`} className="underline">
                                {d.orderId as string}
                              </Link>
                            </Text>
                            <Text size="sm" weight="medium" className="text-error">
                              -{formatCurrency(Number(d.deductedAmount ?? 0), currency)}
                            </Text>
                          </Row>
                          <Text size="xs" color="muted">{d.reason as string}</Text>
                        </Div>
                      ))}
                    </Stack>
                  </Stack>
                )}

                <Stack gap="sm">
                  <Text size="sm" weight="semibold" color="muted">Orders included ({orderIds.length})</Text>
                  <Row gap="xs" wrap>
                    {orderIds.map((orderId) => (
                      <Link key={orderId} href={`/admin/orders/${orderId}/view`}>
                        <Badge variant="default">{orderId}</Badge>
                      </Link>
                    ))}
                  </Row>
                </Stack>

                <Stack gap="sm">
                  <Text size="sm" weight="semibold" color="muted">Payment method</Text>
                  <Text size="sm" className="capitalize">{(payout.paymentMethod as string) ?? "—"}</Text>
                  {payout.upiId != null && <Text size="sm" color="muted">UPI: {payout.upiId as string}</Text>}
                  {bankAccount && (
                    <Text size="sm" color="muted">
                      {bankAccount.accountHolderName as string} · {bankAccount.bankName as string} ·{" "}
                      {bankAccount.accountNumberMasked as string} · {bankAccount.ifscCode as string}
                    </Text>
                  )}
                  {payout.transactionId != null && (
                    <Text size="sm" color="muted">Transaction ref: {payout.transactionId as string}</Text>
                  )}
                </Stack>

                {payout.adminNote != null && (
                  <Div surface="muted" padding="sm" rounded="lg">
                    <Text size="xs" weight="semibold" color="muted">Admin note</Text>
                    <Text size="sm">{payout.adminNote as string}</Text>
                  </Div>
                )}

                <Text size="xs" color="muted">
                  Requested {payout.requestedAt ? new Date(payout.requestedAt as string).toLocaleString() : "—"}
                  {payout.processedAt != null && ` · Processed ${new Date(payout.processedAt as string).toLocaleString()}`}
                </Text>
              </Stack>

              <AdminPayoutMarkPaidModal
                isOpen={markPaidOpen}
                payoutId={id}
                onClose={() => {
                  setMarkPaidOpen(false);
                  reload();
                }}
              />
            </>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
