"use client";

// Shareable full-page URL for the ticket UI AdminSupportTicketsView opens as
// a SideDrawer. AdminSupportTicketDetailView hard-renders <SideDrawer>
// internally (no headless mode) — same reuse call as Orders/Scammers: stays
// permanently `open` here, and `onClose` navigates back to the ticket list
// instead of toggling local drawer state.
import { AdminSupportTicketDetailView } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/client";
import type { SerialisedStatusChangeEntry } from "@mohasinac/appkit/client";

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
  /**
   * The ticket's own timeline. Serialised to ISO on the server — a Date
   * crossing the RSC boundary into a `"use client"` component is fine today
   * but the drawer's other date props are all strings, and mixing the two is
   * how a `toLocaleString` on a string ends up rendering "Invalid Date".
   */
  statusHistory?: SerialisedStatusChangeEntry[];
  statusHistoryTruncated?: number;
}


export function SupportTicketViewClient(props: SupportTicketViewClientProps) {
  const router = useRouter();
  return (
    <AdminSupportTicketDetailView
      {...props}
      statusHistory={props.statusHistory as never}
      open
      onClose={() => router.push(String(ROUTES.ADMIN.SUPPORT_TICKETS))}
    />
  );
}
