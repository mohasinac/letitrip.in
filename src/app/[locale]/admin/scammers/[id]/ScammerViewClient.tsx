"use client";

// Shareable full-page URL for the review UI AdminScammersView opens as a
// SideDrawer. AdminScammerEditorView hard-renders <SideDrawer> internally
// (no headless mode), so — matching the same reuse call as the Orders full
// page — it stays permanently `open` here and `onClose` navigates back to
// the Scammers list instead of toggling local drawer state.
import { AdminScammerEditorView, toScammerStatus } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/client";

export interface ScammerViewClientProps {
  scammerId: string;
  displayNames: string[];
  scamType?: string;
  description?: string;
  phones: string[];
  upiIds: string[];
  currentStatus: string;
  verificationNote?: string;
  reportedBy: string;
  reportedByAnon: boolean;
}

export function ScammerViewClient(props: ScammerViewClientProps) {
  const router = useRouter();
  return (
    <AdminScammerEditorView
      {...props}
      // The page passes whatever the server document holds, so it is narrowed
      // here rather than asserted — an unrecognised status becomes
      // `pending_review` explicitly instead of styling itself as one by
      // falling through a lookup.
      currentStatus={toScammerStatus(props.currentStatus)}
      open
      onClose={() => router.push(String(ROUTES.ADMIN.SCAMMERS))}
    />
  );
}
