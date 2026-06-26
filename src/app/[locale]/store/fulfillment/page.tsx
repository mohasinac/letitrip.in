import { FulfillmentView } from "@mohasinac/appkit/client";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function Page() {
  const user = await getServerSessionUser().catch(() => null);
  return (
    <FulfillmentView
      currentUserId={user?.uid}
      currentUserName={user?.displayName ?? undefined}
    />
  );
}
