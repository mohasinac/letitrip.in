"use client";

import { use, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  useOrder,
  useToast,
  useMediaUpload,
  ROUTES,
  Form,
  FieldInput,
  Button,
  Div,
  Row,
  Stack,
  Heading,
  Text,
  Span,
} from "@mohasinac/appkit/client";
import { normalizeError, useSiteSettings, MediaUploadField } from "@mohasinac/appkit";
import { attachPaymentProof } from "@/lib/api/payment-client";

const CONTAINER_CLS = "w-full max-w-lg";

interface SiteSettingsPayment {
  contact?: { upiVpa?: string };
  payment?: { upiManualEnabled?: boolean };
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { order, isLoading } = useOrder(id);
  const { upload } = useMediaUpload();
  const { data: settings } = useSiteSettings<SiteSettingsPayment>();

  const [proofUrl, setProofUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isPending, setIsPending] = useState(false);

  const upiVpa = settings?.contact?.upiVpa ?? "";

  const handleUpload = async (file: File): Promise<string> => {
    const displayName = (order as any)?.buyerName ?? (order as any)?.userId ?? "buyer";
    const namePart = String(displayName).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 20);
    return upload(file, "payment-proofs", false, {
      type: "payment-proof",
      orderId: id,
      buyerName: namePart,
    });
  };

  const handleSubmit = async () => {
    if (!proofUrl) {
      showToast("Please upload your payment screenshot.", "error");
      return;
    }
    setIsPending(true);
    try {
      const result = await attachPaymentProof(id, {
        proofUrl,
        transactionId: transactionId.trim() || undefined,
      });
      if (!result.ok) {
        if (result.code === "PROOF_ALREADY_ATTACHED") {
          showToast("Proof already submitted for this order.", "error");
          router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
          return;
        }
        throw new Error(result.error ?? "Failed to submit payment proof.");
      }
      showToast("Proof submitted. We'll verify within 24 hours.", "success");
      router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
    } catch (err) {
      void normalizeError(err);
      showToast(err instanceof Error ? err.message : "Submission failed.", "error");
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <Stack className="w-full max-w-lg animate-pulse" gap="md">
        <Div className="h-6 w-1/2" surface="subtle" rounded="default" />
        <Div className="h-4 w-3/4" surface="subtle" rounded="default" />
        <Div className="h-32" surface="subtle" rounded="default" />
      </Stack>
    );
  }

  if (!order) {
    return <Text size="sm" color="muted">Order not found.</Text>;
  }

  const pm = (order as any)?.paymentMethod ?? "";
  const isCashOrUpi = pm === "cash" || pm === "upi_manual";
  const alreadyPaid = (order as any)?.paymentStatus === "paid";

  if (!isCashOrUpi) {
    return (
      <Stack className={CONTAINER_CLS} gap="md">
        <Text color="muted" size="sm">This order does not require manual payment upload.</Text>
        <Link href={String(ROUTES.USER.ORDER_DETAIL(id))} className="text-[length:var(--appkit-text-sm)] font-medium text-primary hover:underline">
          ← Back to order
        </Link>
      </Stack>
    );
  }

  if (alreadyPaid) {
    return (
      <Stack className={CONTAINER_CLS} gap="md">
        <Stack padding="md" className="border border-success/20" surface="success-surface" gap="3" rounded="xl">
          <Text className="text-success" size="sm" weight="medium">Payment already verified for this order.</Text>
        </Stack>
        <Link href={String(ROUTES.USER.ORDER_DETAIL(id))} className="text-[length:var(--appkit-text-sm)] font-medium text-primary hover:underline">
          ← Back to order
        </Link>
      </Stack>
    );
  }

  return (
    <Stack className={CONTAINER_CLS} gap="lg">
      <Heading level={1} size="2xl" weight="bold" color="primary">Complete Payment</Heading>
      <Text className="mt-1" color="muted" size="sm">Order #{id}</Text>

      {/* UPI instructions */}
      <Stack padding="md" className="border border-primary/20" surface="default" gap="3" rounded="xl">
        <Text size="sm" weight="semibold" color="primary">Step 1 — Transfer payment via UPI</Text>
        {upiVpa ? (
          <>
            <Text size="sm" color="muted">Open any UPI app (GPay, PhonePe, Paytm) and pay to:</Text>
            <Div surface="inset" border="default" rounded="lg" padding="inline" className="select-all">
              <Span size="lg" weight="bold" color="primary">{upiVpa}</Span>
            </Div>
            <Text size="xs" color="faint">Note the UTR / transaction reference — you'll enter it below.</Text>
          </>
        ) : (
          <Text size="sm" color="muted">
            Please use the UPI ID shared with you by our team, or contact us at{" "}
            <Link href="mailto:support@letitrip.in" className="text-primary hover:underline">support@letitrip.in</Link>.
          </Text>
        )}
      </Stack>

      {/* Upload proof */}
      <Stack border="default" padding="md" surface="default" gap="md" rounded="xl">
        <Text size="sm" weight="semibold" color="primary">Step 2 — Upload payment screenshot</Text>
        <Form onSubmit={(e) => e.preventDefault()}>
          {() => (
            <Stack gap="md">
              <MediaUploadField
                label="Payment screenshot (JPG/PNG/PDF)"
                value={proofUrl}
                onChange={setProofUrl}
                onUpload={handleUpload}
                kind="image"
                accept="image/*,application/pdf"
                helperText="Upload a screenshot of the payment confirmation from your UPI app."
              />
              <FieldInput
                name="transactionId"
                label="UTR / Transaction ID (optional)"
                value={transactionId}
                onChange={(value: string) => setTransactionId(value)}
                placeholder="e.g. 123456789012"
                hint="Enter the 12-digit UTR number shown in your UPI app."
              />
              <Row gap="3">
                <Button
                  type="button"
                  variant="primary"
                  disabled={isPending || !proofUrl}
                  onClick={handleSubmit}
                  paddingX="md"
                  paddingY="sm"
                  textSize="sm"
                  weight="semibold"
                >
                  {isPending ? "Submitting…" : "Submit Proof"}
                </Button>
                <Link
                  href={String(ROUTES.USER.ORDER_DETAIL(id))}
                  className="rounded-xl border border-[var(--appkit-color-border)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text-muted)] hover:bg-zinc-50 hover:bg-[var(--appkit-color-surface-elevated)] transition-colors"
                >
                  Cancel
                </Link>
              </Row>
            </Stack>
          )}
        </Form>
      </Stack>
    </Stack>
  );
}
