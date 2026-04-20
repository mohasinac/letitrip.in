import { EventsListView, type EventItem } from "@mohasinac/appkit/features/events";

export default function Page() {
  return <EventsListView events={[] as EventItem[]} />;
}