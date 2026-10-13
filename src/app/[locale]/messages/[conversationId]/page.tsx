import { Suspense } from "react";
import { ConversationThreadView } from "@mohasinac/appkit/client";

export default async function Page({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return (
    <Suspense>
      <ConversationThreadView conversationId={conversationId} />
    </Suspense>
  );
}
