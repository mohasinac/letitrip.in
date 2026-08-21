"use client";

// Shareable full-page URL for the same order-review UI that AdminOrdersView
// opens as a SideDrawer from the row action menu. AdminOrderEditorView is a
// drawer-hard-coded appkit component (renders <SideDrawer> internally with
// no "headless" mode), so per the reuse-over-reimplementation call for this
// page, we keep it permanently `open` here instead of forking a bespoke
// layout — the drawer becomes the page's content, and `onClose` navigates
// back to the Orders list instead of just toggling local state.
import { AdminOrderEditorView } from "@mohasinac/appkit/client";
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
