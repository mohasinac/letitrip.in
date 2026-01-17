import type { EventCountdownProps } from "@letitrip/react-library";
import { EventCountdown as EventCountdownBase } from "@letitrip/react-library";
import { Calendar, Clock } from "lucide-react";

/**
 * EventCountdown wrapper with lucide-react icons
 *
 * This wrapper provides the default icons using lucide-react.
 * The library component is framework-agnostic.
 */
export function EventCountdown({
  icons,
  ...props
}: Omit<EventCountdownProps, "icons"> & {
  icons?: EventCountdownProps["icons"];
}) {
  const defaultIcons = {
    calendar: <Calendar className="w-5 h-5" />,
    clock: <Clock className="w-5 h-5" />,
  };

  return <EventCountdownBase icons={icons || defaultIcons} {...props} />;
}

export default EventCountdown;
