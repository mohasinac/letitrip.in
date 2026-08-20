"use client";

// Shareable full-page URL for the ticket UI AdminSupportTicketsView opens as
// a SideDrawer. AdminSupportTicketDetailView hard-renders <SideDrawer>
// internally (no headless mode) — same reuse call as Orders/Scammers: stays
// permanently `open` here, and `onClose` navigates back to the ticket list
// instead of toggling local drawer state.
import { AdminSupportTicketDetailView } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/client";

interface TicketMessageClient {
  id?: string;
  authorId?: string;
  authorRole?: string;
  body?: string;
  createdAt?: string;
}

interface RelatedPartiesClient {
  userId?: string;
  storeId?: string;
  orderId?: string;
  productId?: string;
  bidId?: string;
}

export interface SupportTicketViewClientProps {
  ticketId: string;
  subject: string;
  userDisplayName: string;
  category: string;
  currentStatus: string;
  currentPriority: string;
  description: string;
  messages: TicketMessageClient[];
  internalNotes?: string;
  orderId?: string;
  relatedParties?: RelatedPartiesClient;
}

export function SupportTicketViewClient(props: SupportTicketViewClientProps) {
  const router = useRouter();
  return (
    <AdminSupportTicketDetailView
      {...props}
      open
      onClose={() => router.push(String(ROUTES.ADMIN.SUPPORT_TICKETS))}
    />
  );
}
