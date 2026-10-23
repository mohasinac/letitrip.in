"use client";

// Shareable full-page URL for the same order-review UI that AdminOrdersView
// opens as a SideDrawer from the row action menu. AdminOrderEditorView is a
// drawer-hard-coded appkit component (renders <SideDrawer> internally with
// no "headless" mode), so per the reuse-over-reimplementation call for this
// page, we keep it permanently `open` here instead of forking a bespoke
// layout — the drawer becomes the page's content, and `onClose` navigates
// back to the Orders list instead of just toggling local state.
import { AdminOrderEditorView } from "@mohasinac/appkit/client";
import type { AdminOrderEditorViewProps } from "@mohasinac/appkit/client";
import type { OrderSourceContext } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/client";

export interface OrderViewClientProps {
  orderId: string;
  orderLabel: string;
  currentStatus: string;
  items?: {
    productId: string;
    title: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  paymentProofUrl?: string;
  paymentTransactionId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  displayedUpiId?: string;
  buyerReportedUpiId?: string;
  paymentUpiMismatch?: boolean;
  buyerMarkedPaid?: boolean;
  buyerFraudAgreementAccepted?: boolean;
  /** Without this the full-page variant behaved differently from the drawer:
   *  an already-rejected or re-upload-requested order still rendered live
   *  Verify/Reject buttons. */
  paymentReviewOutcome?: string;
  /*
   * Provenance — the won auction / buyout / agreed offer behind this price.
   *
   * The declared type is honest on THIS path: a Server Component hands the
   * value straight to a Client Component, and RSC serialisation preserves
   * Date. The seller's drawer reaches the same card over a JSON fetch where
   * those Dates arrive as strings, which is why the card normalises both
   * rather than trusting either.
   */
  sourceContext?: OrderSourceContext;
  /**
   * D55 — the pre-order balance review block. Passing it is what makes the
   * full-page variant behave like the drawer; the same omission on
   * `paymentReviewOutcome` once left this page offering live Verify/Reject
   * buttons on an order that had already been decided.
   */
  balance?: AdminOrderEditorViewProps["balance"];
  currency?: string;
}

export function OrderViewClient(props: OrderViewClientProps) {
  const router = useRouter();
  return (
    <AdminOrderEditorView
      {...props}
      open
      onClose={() => router.push(String(ROUTES.ADMIN.ORDERS))}
    />
  );
}
