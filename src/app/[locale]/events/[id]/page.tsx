import { notFound } from "next/navigation";
import { Div, Heading, RichText } from "@mohasinac/appkit/ui";
import { EVENT_LABELS } from "./_constants";
import { eventIsActive } from "./_helpers";
import { getEventCached } from "./_data";
import { PollInlineClient } from "./PollInlineClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type PollConfig = {
  options: { id: string; label: string }[];
  allowMultiSelect: boolean;
  allowComment: boolean;
  requireLogin?: boolean;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const event = await getEventCached(id);
  if (!event) notFound();

  const description =
    typeof event.description === "string" ? event.description : "";
  const isActive = eventIsActive(event);
  const pollConfig = (event as { pollConfig?: PollConfig }).pollConfig;

  return (
    <Div className="space-y-6">
      {description ? <RichText html={description} /> : null}
      {pollConfig?.options?.length ? (
        <Div className="space-y-3">
          <Heading
            level={2}
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {EVENT_LABELS.OVERVIEW_POLL_HEADING}
          </Heading>
          <PollInlineClient
            eventId={id}
            pollConfig={pollConfig}
            isActive={isActive}
          />
        </Div>
      ) : null}
    </Div>
  );
}
