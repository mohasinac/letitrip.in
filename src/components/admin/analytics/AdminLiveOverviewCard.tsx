"use client";
import { useEffect, useState } from "react";
import { ref, onValue, type DataSnapshot } from "firebase/database";
import { realtimeDb } from "@/lib/firebase/config";
import { Div, Heading, Row, Span, Stack, Text } from "@mohasinac/appkit";

interface PresenceEntry {
  page: string;
  isGuest: boolean;
  uid: string | null;
}

interface LiveState {
  auth: number;
  guests: number;
}

export function AdminLiveOverviewCard() {
  const [active, setActive] = useState<LiveState | null>(null);
  const [todayViews, setTodayViews] = useState<number | null>(null);
  const [topPages, setTopPages] = useState<{ path: string; count: number }[]>(
    [],
  );

  useEffect(() => {
    if (!realtimeDb) return;

    const presenceRef = ref(realtimeDb, "presence");
    const unsubPresence = onValue(presenceRef, (snap: DataSnapshot) => {
      if (!snap.exists()) {
        setActive({ auth: 0, guests: 0 });
        return;
      }
      const data = snap.val() as Record<string, PresenceEntry>;
      let auth = 0;
      let guests = 0;
      Object.values(data).forEach((e) => {
        if (e.isGuest) guests++;
        else auth++;
      });
      setActive({ auth, guests });
    });

    // eslint-disable-next-line lir/no-raw-date
    const date = new Date().toISOString().split("T")[0];
    const pvRef = ref(realtimeDb, `analytics/pageviews/${date}`);
    const unsubPv = onValue(pvRef, (snap: DataSnapshot) => {
      if (!snap.exists()) {
        setTodayViews(0);
        setTopPages([]);
        return;
      }
      const data = snap.val() as Record<string, number>;
      const total = Object.values(data).reduce((s, v) => s + v, 0);
      setTodayViews(total);
      const sorted = Object.entries(data)
        .map(([encoded, count]) => ({
          path: encoded.replace(/\|/g, "/"),
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopPages(sorted);
    });

    return () => {
      unsubPresence();
      unsubPv();
    };
  }, []);

  const totalActive = active ? active.auth + active.guests : null;

  return (
    <Div rounded="xl" border="default" padding="md" surface="default" className="mb-6">
      <Heading level={3} size="base" weight="semibold" className="mb-3">
        Live Overview
      </Heading>
      <Row gap="lg" wrap className="mb-3">
        <Stack gap="xs">
          <Text size="xs" color="muted">
            Active users now
          </Text>
          <Row gap="sm" align="baseline">
            <Span size="2xl" weight="bold" className="text-primary">
              {totalActive ?? "—"}
            </Span>
            {active && (
              <Span size="xs" color="muted">
                {active.auth} logged in · {active.guests} guests
              </Span>
            )}
          </Row>
        </Stack>
        <Stack gap="xs">
          <Text size="xs" color="muted">
            Page views today
          </Text>
          <Span size="2xl" weight="bold" className="text-primary">
            {todayViews ?? "—"}
          </Span>
        </Stack>
      </Row>
      {topPages.length > 0 && (
        <Stack gap="xs">
          <Text size="xs" color="muted" weight="medium">
            Top pages today
          </Text>
          {topPages.map(({ path, count }) => (
            <Row key={path} justify="between" align="center">
              <Text size="xs" color="muted" className="flex-1 min-w-0 truncate">
                {path || "/"}
              </Text>
              <Span size="xs" weight="semibold" className="ml-2 flex-shrink-0">
                {count}
              </Span>
            </Row>
          ))}
        </Stack>
      )}
    </Div>
  );
}
