import { FulfillmentView } from "@mohasinac/appkit/client";
import { safeRead } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function Page() {
  // The RoleGuard layout has already authorised the reader; this only stamps
  // the actor's name onto fulfilment actions, so it degrades rather than errors.
  const user = await safeRead(() => getServerSessionUser(), {
    route: "/store/fulfillment",
    key: "session.getServerSessionUser",
    fallback: null,
  });
  return (
    <FulfillmentView
      currentUserId={user?.uid}
      currentUserName={user?.displayName ?? undefined}
    />
  );
}
