"use client";

/**
 * WHY: the feed route is useless if no seller knows it exists. This is the page
 *      that hands a seller their own URL and the five Commerce Manager steps
 *      that turn it into a live WhatsApp catalogue.
 *
 *      Root Cause #37 — a built feature with no nav entry is exactly as
 *      incomplete as a feature with no backend. The nav entry for this page
 *      ships in the same commit (`STORE_NAV_GROUPS`, Selling group).
 *
 * WHAT: the seller-facing half of the WhatsApp catalogue sync.
 *
 * 🛑 It deliberately explains that the seller connects their OWN WhatsApp
 * Business Account. LetItRip never holds a seller's Meta access token — that
 * was the removed Cloud API design, and the single sentence most worth keeping
 * in front of a seller is that nothing here asks them for a credential.
 *
 * EXPORTS: WhatsAppFeedPanel
 *
 * @tag domain:whatsapp
 * @tag layer:component
 * @tag access:client
 * @tag consumers:app/[locale]/store/whatsapp
 */

import React, { useCallback, useState } from "react";
import {
  Button,
  Div,
  Heading,
  Row,
  Span,
  Stack,
  Text,
  normalizeError,
} from "@mohasinac/appkit/client";
import { WHATSAPP_FEED_PATH, WHATSAPP_CATALOGUE_LINK_BASE } from "@/constants/whatsapp-feed";

/**
 * 🛑 A NAMED definition, not an inline `{ id, label, variant }` at the call
 * site — which is the shape Rule #7 and Root Cause #16 actually ban.
 *
 * It lives here rather than in `ACTIONS` because `action-registry.ts` is in
 * appkit and this app is pinned to a published version, so an action added
 * there does not exist for this app until appkit is rebuilt, published and the
 * pin moved (Rule #10). Same reasoning, and the same follow-up, as
 * `src/constants/authenticity-routes.ts`.
 *
 * `ACTIONS.MEDIA["copy-url"]` was the alternative and is wrong: its ariaLabel
 * is "Copy media URL to clipboard", which a screen reader would read out over a
 * product feed.
 *
 * 🛑 FOLLOW-UP: move to `ACTIONS.STORE["copy-feed-url"]` at the next appkit
 * publish and delete this constant.
 */
const COPY_FEED_URL_ACTION = {
  iconKey: "duplicate",
  id: "store.copy-feed-url",
  label: "Copy feed URL",
  ariaLabel: "Copy your WhatsApp product feed URL to the clipboard",
  description: "Copy the catalogue feed URL for this store.",
  kind: "secondary",
} as const;

export interface WhatsAppFeedPanelProps {
  /** The store's public slug. The feed URL is derived from it. */
  storeSlug: string | null;
  /** Absolute origin, resolved server-side so the URL shown is the real one. */
  siteOrigin: string;
}

const STEPS: readonly { title: string; body: string }[] = [
  {
    title: "Open Commerce Manager",
    body: "Go to business.facebook.com/commerce and select the catalogue your WhatsApp number uses. If you have more than one, check Settings → Connected assets and pick the catalogue your WhatsApp Business Account is listed on — feeding the wrong one leaves WhatsApp empty.",
  },
  {
    title: "Catalogue → Data sources → Add products",
    body: "Choose Data File, then Next. The scheduled-URL option is on the following screen, not this one.",
  },
  {
    title: 'Pick "Use a URL or Google Sheets"',
    body: "Leave the platform dropdown as Commerce Manager, then paste the feed URL above.",
  },
  {
    title: "Set the schedule to Daily",
    body: "Hourly adds nothing — the feed is rebuilt from your live listings and cached for a day. Set the default currency to INR.",
  },
  {
    title: "Connect your WhatsApp Business Account",
    body: "In the same catalogue, open Settings → Connected assets and add your WhatsApp Business Account. Until this is done the products load into the catalogue but never appear in WhatsApp.",
  },
];

export function WhatsAppFeedPanel({ storeSlug, siteOrigin }: WhatsAppFeedPanelProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const feedUrl = storeSlug
    ? `${siteOrigin.replace(/\/$/, "")}${WHATSAPP_FEED_PATH(storeSlug)}`
    : null;

  const handleCopy = useCallback(async () => {
    if (!feedUrl) return;
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      /*
       * Not swallowed: clipboard access is refused outright in some browsers
       * and over plain HTTP. A button that silently does nothing reads as a
       * broken page, so say so and leave the URL selectable above.
       */
      void normalizeError(err);
      setCopyFailed(true);
    }
  }, [feedUrl]);

  return (
    <Div className="mx-auto max-w-2xl">
      <Heading level={1} className="mb-1" color="primary" size="2xl" weight="bold">
        WhatsApp catalogue
      </Heading>
      <Text variant="secondary" className="mb-6" size="sm">
        Keep your WhatsApp catalogue in step with your LetItRip listings automatically. You
        connect your own WhatsApp Business Account — LetItRip never asks for, and never
        stores, your Meta password or access token.
      </Text>

      <Stack gap="md" surface="card" padding="md">
        <Div>
          <Text className="tracking-wider mb-1" color="muted" size="xs" weight="medium" transform="uppercase">
            Your feed URL
          </Text>
          {feedUrl ? (
            <Text className="font-mono break-all" color="primary" size="sm" weight="semibold">
              {feedUrl}
            </Text>
          ) : (
            <Text color="muted" size="sm">
              Set your store URL first — the feed address is built from your store slug.
            </Text>
          )}
        </Div>

        {copyFailed && (
          <Div textSize="sm" className="border border-error/20" color="error" surface="danger-surface" padding="inlineSm" rounded="lg">
            Your browser blocked clipboard access. Select the URL above and copy it manually.
          </Div>
        )}

        {copied && (
          <Div textSize="sm" className="border border-success/20" color="success" surface="success-surface" padding="inlineSm" rounded="lg">
            Copied. Paste it into Commerce Manager at step 3.
          </Div>
        )}

        <Row justify="end">
          <Button
            size="sm"
            disabled={!feedUrl}
            onClick={handleCopy}
            action={COPY_FEED_URL_ACTION as never}
          />
        </Row>
      </Stack>

      <Heading level={2} className="mt-8 mb-3" size="lg" weight="semibold">
        Connecting it
      </Heading>

      <Stack gap="sm">
        {STEPS.map((step, i) => (
          <Row key={step.title} gap="sm" align="start" surface="card" padding="md" rounded="lg">
            {/*
              A Row rather than a Span: centring is `align`/`justify`, which are
              real variant props on the layout primitives and absent from
              SpanProps — so a Span could only express it as a className, which
              is what `audit-variant-prop-coverage` exists to stop.

              `subtle` rather than a brand tint for the same reason the Span had
              it: SpanBg carries none, and hand-pairing ink to a brand surface
              for a step number is Root Cause #67's trap for no gain.
            */}
            <Row
              className="shrink-0 w-6 h-6"
              align="center"
              justify="center"
              rounded="full"
              surface="subtle"
            >
              <Text size="xs" weight="bold">{i + 1}</Text>
            </Row>
            <Div className="flex-1 min-w-0">
              <Text size="sm" weight="semibold">{step.title}</Text>
              <Text color="muted" size="sm">{step.body}</Text>
            </Div>
          </Row>
        ))}
      </Stack>

      <Heading level={2} className="mt-8 mb-3" size="lg" weight="semibold">
        What goes into the feed
      </Heading>

      <Stack gap="sm" surface="card" padding="md">
        <Text color="muted" size="sm">
          Every <Span weight="semibold">published</Span> listing of a type that can be bought
          outright — and nothing else. Auctions are left out because their price moves, and
          classified listings because they are contact-only; a catalogue card promises a fixed
          price and a buy button, so a listing that cannot honour that is better absent than
          wrong.
        </Text>
        <Text color="muted" size="sm">
          <Span weight="semibold">A listing with no image is skipped.</Span> Meta rejects any
          catalogue row without a working image, so a listing missing one would fail on their
          side with an error only you would see. Add a photo and it appears on the next daily
          fetch.
        </Text>
        <Text color="muted" size="sm">
          Drafts, archived listings and sold-out stock are handled for you — sold-out items stay
          in the catalogue marked out of stock rather than vanishing, which is what keeps their
          WhatsApp links alive.
        </Text>
      </Stack>

      <Heading level={2} className="mt-8 mb-3" size="lg" weight="semibold">
        Sharing your catalogue
      </Heading>

      <Stack gap="sm" surface="card" padding="md">
        <Text color="muted" size="sm">
          Once products are in, WhatsApp gives you a public link that anyone can open to browse
          them — find it in the WhatsApp Business app under Catalogue → the menu → Share. It
          looks like{" "}
          <Span className="font-mono" weight="semibold">{WHATSAPP_CATALOGUE_LINK_BASE}&lt;your number&gt;</Span>.
        </Text>
        <Text color="muted" size="sm">
          That link contains your phone number even if you have set a WhatsApp username, so treat
          it as public the moment you share it.
        </Text>
      </Stack>

      <Div textSize="xs" className="mt-6 border border-warning/20" color="warning" surface="warning-surface" padding="inlineSm" rounded="lg">
        Changing your store URL changes your feed URL. If you do, update the data source in
        Commerce Manager — Meta will keep fetching the old address, and your catalogue will
        quietly stop updating with nothing to tell you why.
      </Div>
    </Div>
  );
}
