import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { safeRead } from "@mohasinac/appkit/server";
import { isIntegrationEnabled } from "@/lib/integration-gate";

/**
 * Route guard for the buyer's ticket surface.
 *
 * One server layout over all three `/user/support/*` routes — the list, `new`,
 * and `[id]`. All three are `"use client"` pages with no server wrapper of
 * their own, so a layout is the only place a server-side check can sit, and
 * one file covers the whole subtree instead of three copies that could drift.
 *
 * ## Why a page guard as well as the API guard
 *
 * Hiding the nav entry is decorative: a bookmarked `/user/support` still
 * loads. With the API gated the page would render its chrome and then an empty
 * list — which reads as "you have no tickets", a lie, rather than "support is
 * off". 404 is the honest answer and it matches what the switch claims to do.
 *
 * ## 🛑 The public Help Centre at `/support` is deliberately NOT gated
 *
 * Two reasons, and the second is the better one:
 *
 * 1. It carries `revalidate = 3600` and no per-request data. A settings read
 *    there would make a public, cacheable page dynamic — a standing function
 *    invocation on every visit, which is the cost pattern Root Cause #104 is
 *    about.
 * 2. Self-service help is what REDUCES tickets. Switching tickets off and
 *    simultaneously deleting the FAQs that answer the questions is the wrong
 *    product answer: the owner asked to hide the ticket surface, and the FAQs
 *    are not it.
 *
 * ## 🛑 `safeRead`, not a bare await
 *
 * `/user/*` prerenders (the user layout reads nothing server-side, so the
 * subtree renders to a signed-out shell and hydrates), and Next still ATTEMPTS
 * the prerender of a page under a layout like this one. An unguarded throw
 * during that attempt is fatal to the production build — the rule CLAUDE.md
 * states as "server-side reads on dashboard pages belong in `safeRead`".
 *
 * The fallback is `true` (reachable), matching the support descriptor's
 * `failClosed: false`: a settings read that fails must not take support away.
 * `isIntegrationEnabled` already fails open internally, so this is the second
 * of two independent reasons the answer is `true` — belt and braces on the
 * direction that matters.
 */
export default async function UserSupportLayout({ children }: { children: ReactNode }) {
  const enabled = await safeRead(() => isIntegrationEnabled("support"), {
    route: "/user/support",
    key: "integration.support",
    fallback: true,
  });

  if (!enabled) notFound();

  return <>{children}</>;
}
