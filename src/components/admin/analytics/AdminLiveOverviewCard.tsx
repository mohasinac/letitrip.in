"use client";
import { useEffect, useState } from "react";
import {
  ADMIN_ENDPOINTS,
  apiClient,
  normalizeError,
} from "@mohasinac/appkit/client";
import { Div, Heading, Row, Span, Stack, Text } from "@mohasinac/appkit/client";

/**
 * Today's traffic, read from the Firestore-backed pageViews counter.
 *
 * 🛑 This card used to subscribe to two RTDB paths — `presence` and
 * `analytics/pageviews/{date}` — written by a `usePresence` hook. None of it
 * ever worked in production, in four independent ways:
 *
 *   - the writes used the CLIENT SDK against rules that are `.write: false`
 *     on every node (the RTDB architecture is backend-writes-only);
 *   - the presence key was a random sessionStorage nonce, so the
 *     `auth.uid == $uid` read rule could never match it;
 *   - the rule's `.validate` required an `online` field the writer never sent;
 *   - `analytics/pageviews/**` had no rule at ANY level, so it fell through to
 *     the root `.read/.write: false`.
 *
 * Both `onValue` calls also passed no error callback, so a denial fired nothing
 * at all and the tiles rendered `—` forever rather than `0`. And the card used
 * the DEFAULT Firebase app, whose `auth.currentUser` is null for Google-OAuth
 * admins entirely — so no rule change could have fixed it for them.
 *
 * Meanwhile a complete Firestore pageview counter already existed and was
 * wired end to end, with `AdminPageViewsReportView` rendered in the same tab
 * strip as this card. This now reads that same source, so the two surfaces
 * cannot disagree.
 *
 * "Active users now" is gone: presence was its only source, and reviving it
 * would mean either a per-navigation write for every visitor (Rule #6) or
 * legalising client writes the rules architecture forbids.
 */

interface PageViewItem {
  entityType: string;
  entityId: string;
  url: string;
  count: number;
}

interface PageViewsResponse {
  totalViews: number;
  items: PageViewItem[];
}

const TOP_N = 5;

export function AdminLiveOverviewCard() {
  const [todayViews, setTodayViews] = useState<number | null>(null);
  const [topPages, setTopPages] = useState<PageViewItem[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        // eslint-disable-next-line lir/no-raw-date
        const today = new Date().toISOString().slice(0, 10);
        const data = await apiClient.get<PageViewsResponse>(
          `${ADMIN_ENDPOINTS.ANALYTICS_PAGE_VIEWS}?startDate=${today}&endDate=${today}&pageSize=${TOP_N}`,
        );
        if (cancelled) return;
        setTodayViews(data.totalViews);
        setTopPages(data.items ?? []);
      } catch (err) {
        if (cancelled) return;
        // Surfaced, not swallowed. The previous implementation's silence is
        // exactly why nobody noticed the card had never worked.
        void normalizeError(err);
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Div rounded="xl" border="default" padding="md" surface="default" className="mb-6">
      <Heading level={3} size="base" weight="semibold" className="mb-3">
        Traffic today
      </Heading>
      <Row gap="lg" wrap className="mb-3">
        <Stack gap="xs">
          <Text size="xs" color="muted">
            Page views today
          </Text>
          <Span size="2xl" weight="bold" className="text-primary">
            {failed ? "—" : (todayViews ?? "…")}
          </Span>
        </Stack>
      </Row>
      {failed && (
        <Text size="xs" color="error" role="alert">
          Could not load today&apos;s traffic. Try refreshing.
        </Text>
      )}
      {!failed && topPages.length > 0 && (
        <Stack gap="xs">
          <Text size="xs" color="muted" weight="medium">
            Top tracked pages today
          </Text>
          {topPages.map((item) => (
            <Row
              key={`${item.entityType}:${item.entityId}`}
              justify="between"
              align="center"
            >
              <Text size="xs" color="muted" className="flex-1 min-w-0 truncate">
                {item.url || item.entityId}
              </Text>
              <Span size="xs" weight="semibold" className="ml-2 flex-shrink-0">
                {item.count}
              </Span>
            </Row>
          ))}
        </Stack>
      )}
      {!failed && todayViews !== null && topPages.length === 0 && (
        <Text size="xs" color="muted">
          No tracked page views yet today.
        </Text>
      )}
    </Div>
  );
}
