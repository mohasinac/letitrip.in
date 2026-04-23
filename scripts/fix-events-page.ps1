$p = "d:\proj\letitrip.in\scripts\fix-events-page.ps1"
$content = @'
import { listPublicEventsAction } from "@/actions/event.actions";
import { EventsListView } from "@mohasinac/appkit";
import type { EventItem } from "@mohasinac/appkit";
import type { EventDocument } from "@mohasinac/appkit";

function toEventItem(doc: EventDocument): EventItem {
  return {
    ...doc,
    startsAt: doc.startsAt instanceof Date ? doc.startsAt.toISOString() : String(doc.startsAt),
    endsAt: doc.endsAt instanceof Date ? doc.endsAt.toISOString() : String(doc.endsAt),
    createdAt: (doc as any).createdAt instanceof Date ? (doc as any).createdAt.toISOString() : String((doc as any).createdAt ?? ""),
    updatedAt: (doc as any).updatedAt instanceof Date ? (doc as any).updatedAt.toISOString() : String((doc as any).updatedAt ?? ""),
    stats: doc.stats ?? { totalEntries: 0, approvedEntries: 0, flaggedEntries: 0 },
  } as EventItem;
}

export const revalidate = 60;

export default async function Page() {
  const result = await listPublicEventsAction({ page: 1, pageSize: 20 }).catch(() => ({ items: [], total: 0, totalPages: 1, page: 1, pageSize: 20, hasMore: false }));
  const events = result.items.map(toEventItem);

  return (
    <EventsListView
      events={events}
      totalPages={result.totalPages}
      currentPage={result.page}
      total={result.total}
    />
  );
}
'@

$destPath = Join-Path "d:\proj\letitrip.in\src\app\[locale]" "events\page.tsx"
[System.IO.File]::WriteAllText($destPath, $content, [System.Text.Encoding]::UTF8)
Write-Host "OK: events/page.tsx"
