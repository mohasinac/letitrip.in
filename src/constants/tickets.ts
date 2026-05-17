export const TICKET_CATEGORIES = [
  { value: "order_issue",      label: "Order issue (requires order id)" },
  { value: "billing_payment",  label: "Billing & payments" },
  { value: "account",          label: "Account / sign-in" },
  { value: "listing_dispute",  label: "Listing dispute" },
  { value: "scam_report",      label: "Report a scam" },
  { value: "refund_request",   label: "Refund request" },
  { value: "auction_dispute",  label: "Auction dispute" },
  { value: "general",          label: "Other / general" },
] as const;

export const TICKET_STATUSES = [
  { value: "",         label: "All statuses" },
  { value: "open",     label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_on_user", label: "Waiting on you" },
  { value: "resolved", label: "Resolved" },
  { value: "closed",   label: "Closed" },
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number]["value"];
