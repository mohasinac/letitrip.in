import { EventParticipateView } from "@mohasinac/appkit";
import { Button, Div, Heading, Input, Text } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <EventParticipateView
      renderEventInfo={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Heading level={1} className="mb-2 text-xl font-semibold text-zinc-900">
            Participate in Event {id}
          </Heading>
          <Text className="text-zinc-600">Submit your participation details below.</Text>
        </Div>
      )}
      renderForm={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Input placeholder="Your response" />
        </Div>
      )}
      renderAction={() => (
        <Button type="button" className="w-full sm:w-auto">
          Submit Participation
        </Button>
      )}
    />
  );
}