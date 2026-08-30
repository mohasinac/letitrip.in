"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  useOrder,
  useToast,
  useMediaUpload,
  ROUTES,
  Div,
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
  applyZodIssues,
  FormShellContext,
  useFormShellState,
  buildSectionsFromSchema,
  visibleValues,
  SectionForm,
  useSectionFormNav,
} from "@mohasinac/appkit/client";
import { attachPaymentProof } from "@/lib/api/payment-client";
import { paymentProofSchema, FormErrorSummary } from "@mohasinac/appkit/client";

const CONTAINER_CLS = "w-full max-w-lg";

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** The draft this form edits — flat, matching `paymentProofSchema`. */
interface ProofValues {
  [key: string]: unknown;
  proofUrl: string;
  transactionId: string;
  buyerReportedUpiId: string;
  buyerMarkedPaid: boolean;
  buyerFraudAgreementAccepted: boolean;
}

const EMPTY_PROOF: ProofValues = {
  proofUrl: "",
  transactionId: "",
  buyerReportedUpiId: "",
  buyerMarkedPaid: false,
  buyerFraudAgreementAccepted: false,
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { order, isLoading } = useOrder(id);
  const { upload } = useMediaUpload();
  const { data: settings } = useSiteSettings<{ contact?: { whatsappNumber?: string } }>();

  const [form, setForm] = useState<ProofValues>(EMPTY_PROOF);
  const patch = (partial: Partial<ProofValues>) =>
    setForm((prev) => Object.assign({}, prev, partial));
  const [isPending, setIsPending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const displayedUpiId = order?.displayedUpiId ?? "";
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

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<ProofValues>(paymentProofSchema, {
        renderers: {
          proofUrl: ({ values, onChange }) => (
            <MediaUploadField
              label="Payment screenshot (JPG/PNG/PDF)"
              value={values.proofUrl}
              onChange={(v: string) => onChange({ proofUrl: v })}
              onUpload={handleUpload}
              kind="image"
              accept="image/*,application/pdf"
              helperText="Upload a screenshot of the payment confirmation from your UPI app."
            />
          ),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, order?.userId],
  );
  const nav = useSectionFormNav(sections, form, { scope: "user:payment-proof" });
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(paymentProofSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const handleSubmit = async () => {
    clearErrors();
    /*
     * Three toasts became three field errors.
     *
     * The screenshot, "I have sent the payment" and the fraud agreement were
     * each gated by a hand-written `if` that fired a toast — a banner that
     * names a control the user then has to go find, on a form with a running
     * 15-minute countdown. The schema states all three (`proofUrl` newly, both
     * declarations as `z.literal(true)`) and reports them on the fields.
     */
    const parsed = paymentProofSchema.safeParse(
      visibleValues(paymentProofSchema, form),
    );
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }
    setIsPending(true);
    try {
      const result = await attachPaymentProof(id, {
        proofUrl: parsed.data.proofUrl,
        transactionId: parsed.data.transactionId?.trim() || undefined,
        buyerMarkedPaid: parsed.data.buyerMarkedPaid,
        buyerFraudAgreementAccepted: parsed.data.buyerFraudAgreementAccepted,
        buyerReportedUpiId: parsed.data.buyerReportedUpiId?.trim() || undefined,
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
      showToast("Submission failed.", "error");
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
        <FormShellContext.Provider value={shellCtx}>
          <FormErrorSummary />
          <SectionForm<ProofValues>
            sections={sections}
            values={form}
            onChange={patch}
            onSubmit={() => void handleSubmit()}
            schema={paymentProofSchema}
            openIds={nav.openIds}
            onOpenChange={nav.setOpenIds}
            isLoading={isPending}
            submitLabel="Submit proof"
            onCancel={() => router.push(String(ROUTES.USER.ORDER_DETAIL(id)))}
            cancelLabel="Cancel"
          />
        </FormShellContext.Provider>
      </Stack>
    </Stack>
  );
}
