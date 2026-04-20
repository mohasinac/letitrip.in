import { EventDetailView } from "@mohasinac/appkit/features/events";
import { Div, Heading, Text } from "@mohasinac/appkit/ui";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <EventDetailView
      renderHeader={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Heading level={2} className="mb-2 text-lg font-semibold text-zinc-900">
            Event Overview
          </Heading>
          <Text className="text-zinc-600">Event details and metadata are being integrated.</Text>
        </Div>
      )}
      renderContent={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">Interactive event content will appear here.</Text>
        </Div>
      )}
    />
  );
}