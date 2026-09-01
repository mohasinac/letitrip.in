import { FulfillmentView, PageTabs, FULFILLMENT_TABS } from "@mohasinac/appkit/client";
import { safeRead } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { PrintCenterPanel } from "@/components/store/PrintCenterPanel";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. It also hosts tabs,
 * and `useTabParam` reaches `useSearchParams()`, which throws during prerender
 * without a boundary (Root Cause #17). Carried over from the concurrent
 * build-fix work rather than dropped with the rest of that file's version.
 */
export const dynamic = "force-dynamic";


/**
 * The pack-and-dispatch loop: the queue, then the paperwork it needs.
 *
 * Both panels are awaited HERE and handed to the client tab strip as nodes —
 * `PageTabs` cannot fetch, and a Server Component cannot hand it a function.
 * Print Centre's data comes from three independent sources that each degrade on
 * their own, so opening this page with a dead product list still gives you the
 * queue.
 */
export default async function Page() {
  // The RoleGuard layout has already authorised the reader; this only stamps
  // the actor's name onto fulfilment actions, so it degrades rather than errors.
  const user = await safeRead(() => getServerSessionUser(), {
    route: "/store/fulfillment",
    key: "session.getServerSessionUser",
    fallback: null,
  });
  const printPanel = await PrintCenterPanel();
  return (
    <PageTabs
      tabs={FULFILLMENT_TABS}
      panels={{
        queue: (
          <FulfillmentView
            currentUserId={user?.uid}
            currentUserName={user?.displayName ?? undefined}
          />
        ),
        print: printPanel,
      }}
    />
  );
}
