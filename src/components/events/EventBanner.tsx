"use client";

import {
  EventBanner as LibEventBanner,
  type EventBannerProps as LibEventBannerProps,
  DateDisplay,
} from "@letitrip/react-library";

export type EventBannerProps = Omit<
  LibEventBannerProps,
  "DateDisplayComponent"
>;

export function EventBanner(props: EventBannerProps) {
  return (
    <LibEventBanner
      {...props}
      DateDisplayComponent={DateDisplay}
    />
  );
}

export default EventBanner;
