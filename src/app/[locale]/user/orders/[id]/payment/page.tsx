"use client";

import {use, useEffect, useState, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  useOrder,
  useToast,
  useMediaUpload,
  ROUTES,
  Form,
  FieldInput,
  FieldCheckbox,
  Button,
  Div,
  Row,
  Stack,
  Heading,
  Text,
  Span,
} from "@mohasinac/appkit/client";
import {
  normalizeError,
  MediaUploadField,
  Anchor,
  useSiteSettings,
  buildPaymentProofReviewMessage,
  isManualPaymentMethod,
} from "@mohasinac/appkit/client";
import { attachPaymentProof } from "@/lib/api/payment-client";
import { paymentProofSchema, FormErrorSummary } from "@mohasinac/appkit/client";
import { toUserMessage } from "@mohasinac/appkit/client";
import { MediaImage } from "@mohasinac/appkit/client";
import { BUSINESS } from "@/constants/business";



const CONTAINER_CLS = "w-full max-w-lg";

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function PageInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { order, isLoading } = useOrder(id);
  const { upload } = useMediaUpload();
  const { data: settings } = useSiteSettings<{ contact?: { whatsappNumber?: string } }>();

  const [proofUrl, setProofUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [buyerReportedUpiId, setBuyerReportedUpiId] = useState("");
  const [buyerMarkedPaid, setBuyerMarkedPaid] = useState(false);
  const [fraudAgreementAccepted, setFraudAgreementAccepted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const displayedUpiId = order?.displayedUpiId ?? "";
  /*
   * From the ONE owner of the business identity, not a literal.
   *
   * This page hardcoded "support@letitrip.in" two lines below a correct
   * read of settings.contact.whatsappNumber — so the same page quoted one
   * channel from config and another from a string.
   *
   * Safe in a client bundle: both values are PUBLIC and both are literals
   * in appkit.config.js rather than env-derived. Anything env-derived
   * (the bank account number, the IFSC) is deliberately NOT read here —
   * process.env.* without NEXT_PUBLIC_ is undefined in this bundle, so it
   * would render blank while looking implemented. See the note further
   * down for why bank transfer needs the server-side stamping pattern.
   */
  const supportEmail = BUSINESS.support?.email ?? null;
  const paymentQrPath = BUSINESS.bank?.qrImagePath ?? null;
  const paymentDeadline = order?.paymentDeadline
    ? new Date(order.paymentDeadline).getTime()
    : null;
  const windowExpired = paymentDeadline != null && now >= paymentDeadline;

  useEffect(() => {
    if (paymentDeadline == null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [paymentDeadline]);

  const handleUpload = async (file: File): Promise<string> => {
    const displayName = order?.userId ?? "buyer";
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
    if (!fraudAgreementAccepted) {
      showToast("Please confirm this payment is genuine before submitting.", "error");
      return;
    }
    setIsPending(true);
    try {
      const result = await attachPaymentProof(id, {
        proofUrl,
        transactionId: transactionId.trim() || undefined,
        buyerMarkedPaid,
        buyerFraudAgreementAccepted: fraudAgreementAccepted,
        buyerReportedUpiId: buyerReportedUpiId.trim() || undefined,
      });
      if (!result.ok) {
        if (result.code === "PROOF_ALREADY_ATTACHED") {
          showToast("Proof already submitted for this order.", "error");
          router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
          return;
        }
        if (result.code === "PAYMENT_WINDOW_EXPIRED") {
          showToast("The 15-minute payment window for this order has expired.", "error");
          router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
          return;
        }
        throw new Error(result.error ?? "Failed to submit payment proof.");
      }
      showToast("Proof submitted. We'll verify within 2 hours, or your order auto-confirms.", "success");
      router.push(String(ROUTES.USER.ORDER_DETAIL(id)));
    } catch (err) {
      void normalizeError(err);
      showToast(toUserMessage(undefined, undefined, { fallback: "Submission failed." }), "error");
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

  const isCashOrUpi = isManualPaymentMethod(order?.paymentMethod);
  const alreadyPaid = order?.paymentStatus === "paid";
  const cancellationReason = order?.cancellationReason;
  const orderStatus = order?.orderStatus;

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

  if (orderStatus === "cancelled" && cancellationReason === "payment_window_expired") {
    return (
      <Stack className={CONTAINER_CLS} gap="md">
        <Stack padding="md" className="border border-error/20" surface="danger-surface" gap="3" rounded="xl">
          <Text className="text-error" size="sm" weight="medium">
            This order was cancelled because the 15-minute payment window expired without proof. The item has been returned to stock.
          </Text>
        </Stack>
        <Link href={String(ROUTES.USER.ORDER_DETAIL(id))} className="text-[length:var(--appkit-text-sm)] font-medium text-primary hover:underline">
          ← Back to order
        </Link>
      </Stack>
    );
  }

  if (windowExpired) {
    return (
      <Stack className={CONTAINER_CLS} gap="md">
        <Stack padding="md" className="border border-warning/20" surface="warning-surface" gap="3" rounded="xl">
          <Text className="text-warning" size="sm" weight="medium">
            Your 15-minute payment window has expired. This order will be cancelled shortly and the item returned to stock.
          </Text>
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

      {paymentDeadline != null && (
        <Stack padding="md" className="border border-warning/20" surface="warning-surface" gap="xs" rounded="xl">
          <Text size="sm" weight="semibold" className="text-warning">
            Time remaining: {formatCountdown(paymentDeadline - now)}
          </Text>
          <Text size="xs" color="muted">
            Pay and upload proof before the window closes, or the item returns to stock and your order is cancelled.
          </Text>
        </Stack>
      )}

      {settings?.contact?.whatsappNumber && order.items[0]?.title && (
        <Anchor
          href={`https://wa.me/${settings.contact.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
            buildPaymentProofReviewMessage({
              orderId: id,
              buyerName: order.userId,
              productTitle: order.items[0].title,
              totalAmount: order.total,
              reviewUrl: typeof window !== "undefined" ? window.location.href : "",
            }),
          )}`}
          tone="brand"
          underline="hover"
          size="xs"
        >
          Share this order for faster review on WhatsApp →
        </Anchor>
      )}

      {/* UPI instructions */}
      <Stack padding="md" className="border border-primary/20" surface="default" gap="3" rounded="xl">
        <Text size="sm" weight="semibold" color="primary">Step 1 — Transfer payment via UPI</Text>
        {displayedUpiId ? (
          <>
            <Text size="sm" color="muted">Open any UPI app (GPay, PhonePe, Paytm) and pay to:</Text>
            <Div surface="inset" border="default" rounded="lg" padding="inline" className="select-all">
              <Span size="lg" weight="bold" color="primary">{displayedUpiId}</Span>
            </Div>
            {/*
              The payment QR, scanned instead of typing the VPA.

              🛑 A plain <MediaImage src="/business/payment-qr.jpg">, i.e. a
              STATIC asset. It must never be routed through /api/media — that
              proxy composites a watermark onto every image it serves and has
              no skip mechanism, and a mark over a QR can corrupt enough
              modules to break the scan. `resolveMediaUrl` returns a relative
              path untouched (its `new URL()` throws and the catch returns the
              input), which is exactly what keeps this safe.
            */}
            {paymentQrPath ? (
              <Stack gap="sm" align="center" paddingY="y-xs">
                {/*
                  MediaImage renders via `fill`, which sizes itself off an
                  ancestor's explicit box — a `max-w-[…]` on this Stack would
                  constrain nothing (Root Cause #68). A fixed-size <Div> is the
                  established wrapper (see CartDrawer's thumbnail rows).
                */}
                <Div className="relative h-28 w-28">
                  <MediaImage
                    src={paymentQrPath}
                    alt={`UPI payment QR for ${BUSINESS.legalName}`}
                    size="thumbnail"
                    objectFit="contain"
                  />
                </Div>
                <Text size="xs" color="faint">Or scan this QR in any UPI app.</Text>
              </Stack>
            ) : null}
            <Text size="xs" color="faint">Note the UTR / transaction reference — you'll enter it below.</Text>
          </>
        ) : (
          <Text size="sm" color="muted">
            Please use the UPI ID shared with you by our team, or contact us
            {supportEmail ? (
              <>
                {" "}at{" "}
                <Link href={`mailto:${supportEmail}`} className="text-primary hover:underline">
                  {supportEmail}
                </Link>
              </>
            ) : null}
            .
          </Text>
        )}

        {/*
          ── Bank transfer (Slice) is NOT rendered here, deliberately ───────
          ──────────────────────────────────────────────────────────────────
          This page is a `"use client"` component, and the account number and
          IFSC are private — they may reach a signed-in buyer with an order
          awaiting payment, and nobody else.

          Reading them from `appkit.config.js` here would be wrong twice: it
          pulls the config into the CLIENT bundle, and `process.env.*` without
          a NEXT_PUBLIC_ prefix is replaced with `undefined` in that bundle
          anyway — so the panel would render blank fields while looking
          implemented, which is worse than its absence.

          The correct shape is the one `displayedUpiId` already uses: stamp
          the destination onto the ORDER at creation, server-side, where
          `upi-resolution.ts` explains why — "resolving server-side makes the
          value immutable and un-spoofable, which is what the buyer-reported
          cross-check depends on". A bank transfer needs exactly that same
          property. Add `displayedBankAccount` alongside it rather than
          fetching settings from the client.
        */}
      </Stack>

      {/* Upload proof */}
      <Stack border="default" padding="md" surface="default" gap="md" rounded="xl">
        <Text size="sm" weight="semibold" color="primary">Step 2 — Upload payment screenshot</Text>
        <Form schema={paymentProofSchema} onSubmit={(e) => e.preventDefault()}>
          {() => (
            <Stack gap="md">
              <FormErrorSummary />
              {/*
               * 🛑 `showYoutube` and `showExternal` default to TRUE, so this field
               * offered "YouTube" and "External URL" as ways to supply proof of
               * payment until they were turned off here.
               *
               * `accept` does NOT close that: it constrains the file picker only,
               * so the attribute above reads like a guarantee and is not one. A
               * buyer could submit a YouTube link as their payment proof, and the
               * admin reviewing it — who approves real money against this artefact
               * — would get a video URL where a screenshot belongs. An external URL
               * is the same hazard slower: proof has to be something we hold, not a
               * link that can change or 404 after it was approved.
               */}
              <MediaUploadField
                label="Payment screenshot (JPG/PNG/PDF)"
                value={proofUrl}
                onChange={setProofUrl}
                onUpload={handleUpload}
                kind="image"
                accept="image/*,application/pdf"
                showYoutube={false}
                showExternal={false}
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
              <FieldInput
                name="buyerReportedUpiId"
                label="UPI ID you paid from (optional)"
                value={buyerReportedUpiId}
                onChange={(value: string) => setBuyerReportedUpiId(value)}
                placeholder="e.g. yourname@upi"
                hint="Shown in your UPI app's payment confirmation — helps us verify faster."
              />
              <FieldCheckbox
                name="buyerMarkedPaid"
                label="I confirm I have already made this payment"
                checked={buyerMarkedPaid}
                onChange={setBuyerMarkedPaid}
              />
              <FieldCheckbox
                name="buyerFraudAgreementAccepted"
                label="I confirm this payment is genuine — I will not attempt fraudulent chargebacks or submit fake proof"
                checked={fraudAgreementAccepted}
                onChange={setFraudAgreementAccepted}
              />
              <Row gap="3">
                <Button
                  type="button"
                  variant="primary"
                  disabled={isPending || !proofUrl || !fraudAgreementAccepted}
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
                  className="rounded-xl border border-[var(--appkit-color-border)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text-muted)] hover:bg-surface-hover transition-colors"
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

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <PageInner {...props} />
    </Suspense>
  );
}
