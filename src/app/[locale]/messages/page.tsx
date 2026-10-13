import { Suspense } from "react";
import { ConversationsInboxView } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <Suspense>
      <ConversationsInboxView />
    </Suspense>
  );
}
