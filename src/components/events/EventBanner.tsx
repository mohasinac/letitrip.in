"use client";

import {
  DateDisplay,
  EventBanner as LibEventBanner,
  type EventBannerProps as LibEventBannerProps,
} from "@letitrip/react-library";

export type EventBannerProps = Omit<
  LibEventBannerProps,
  "DateDisplayComponent"
>;

export function EventBanner(props: EventBannerProps) {
  return <LibEventBanner {...props} DateDisplayComponent={DateDisplay} />;
}

export default EventBanner;
