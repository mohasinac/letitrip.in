"use client";

import { Heading, Stack, Text, TextLink, isAdminUser, useSession } from "@mohasinac/appkit/client";

export interface ToolEntry {
  readonly href: string;
  readonly title: string;
  readonly body: string;
  /**
   * Shown to admins only.
   *
   * 🛑 A PRESENTATION filter, not a security boundary — the same shape and the
   * same posture as the navbar's `adminOnly` children
   * (`LayoutShellClient.tsx`). The guard that matters is the route's own
   * server layout: `/tools/sticker-tracer` is wrapped in
   * `makeAdminSectionLayout("admin:products:write")`, which redirects before
   * any HTML is produced. This only stops a non-admin being shown a link that
   * would bounce them, so the entry's title and href do ship in the payload —
   * exactly as the whole admin nav tree already does.
   */
  readonly adminOnly?: boolean;
}

/**
 * The tools index list.
 *
 * 🛑 This is a Client Component for ONE reason — the `adminOnly` filter needs
 * the viewer — and that does not cost the page its caching or its SEO. A
 * `"use client"` component is still server-rendered into the first HTML
 * response, so the card copy is in the document a crawler receives, and
 * `/tools` itself stays static with no session read and no function
 * invocation. Reading the session in the PAGE would have made the whole route
 * dynamic (Root Cause #82's mechanism, one level down from the root layout).
 *
 * An admin-only card appearing a beat after hydration is benign in a way a
 * price gate is not: it is additive. Nothing is hidden from an admin and then
 * revealed — a card simply arrives, so there is no wrong state to flash and no
 * three-state dance needed (Root Cause #93).
 */
export function ToolList({ tools }: { readonly tools: readonly ToolEntry[] }) {
  const { user } = useSession();
  const isAdmin = isAdminUser(user);

  return (
    <Stack gap="md" className="min-w-0">
      {tools
        .filter((t) => !t.adminOnly || isAdmin)
        .map((t) => (
          <Stack
            key={t.href}
            gap="xs"
            padding="card"
            rounded="lg"
            surface="card"
            border="subtle"
            className="min-w-0"
          >
            {/*
              * The "sign-in needed" chip and the `requiresAccount` flag
              * behind it were deleted with the authenticity gate rather
              * than left in place with nothing setting them: a badge no
              * entry can carry is a promise the list silently stopped
              * being able to keep, and the next tool that needs one would
              * inherit a mechanism nobody had seen render.
              */}
            <Heading level={2}>
              <TextLink href={t.href}>{t.title}</TextLink>
            </Heading>
            <Text color="muted">{t.body}</Text>
          </Stack>
        ))}
    </Stack>
  );
}
