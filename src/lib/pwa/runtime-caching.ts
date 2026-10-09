import type { RuntimeCaching } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  RangeRequestsPlugin,
  StaleWhileRevalidate,
} from "serwist";
import {
  isSameOriginApiRequest,
  isSameOriginHtmlRequest,
  isSameOriginRscRequest,
} from "./runtime-caching-rules";

const ONE_DAY = 24 * 60 * 60;
const ONE_WEEK = 7 * ONE_DAY;
const THIRTY_DAYS = 30 * ONE_DAY;

/**
 * Conservative runtime caching.
 * We intentionally avoid caching Next.js app scripts, RSC payloads, HTML, and
 * same-origin API GET responses to prevent stale deploys from serving old
 * routing or base-URL logic after production releases.
 */
export const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    handler: new CacheFirst({
      cacheName: "google-fonts-webfonts",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 365 * ONE_DAY,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    handler: new StaleWhileRevalidate({
      cacheName: "google-fonts-stylesheets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: ONE_WEEK,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
    handler: new StaleWhileRevalidate({
      cacheName: "static-font-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 8,
          maxAgeSeconds: ONE_WEEK,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /\/_next\/image\?url=.+$/i,
    handler: new StaleWhileRevalidate({
      cacheName: "next-image",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: ONE_DAY,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    /*
     * 🛑 This rule must NOT be end-anchored.
     *
     * It was `/\.(?:jpg|…|avif)$/i`, which requires the URL to END in an image
     * extension — and essentially no image URL on this site does. They are
     * `/api/media/ext?url=…png?text=Dranzer`, `/media/<slug>` (extensionless by
     * design, the short-id scheme hides the real extension) and
     * `/images/seed-tiles/<hex>.svg`. So the rule matched **zero** site images
     * for its entire life, and the PWA cached none of them. Found 2026-10-09
     * while tracing why 160 images per homepage view were all reaching origin.
     *
     * Matching the extension anywhere in the path, OR our two known image
     * prefixes, is what makes it actually fire. The `[?&#/]|$` tail keeps it
     * from matching a path segment that merely begins with those letters.
     */
    matcher: /(?:\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)(?:[?&#/]|$))|\/images\/|\/media\//i,
    handler: new StaleWhileRevalidate({
      cacheName: "static-image-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: THIRTY_DAYS,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: /\.(?:mp3|wav|ogg)$/i,
    handler: new CacheFirst({
      cacheName: "static-audio-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: ONE_DAY,
          maxAgeFrom: "last-used",
        }),
        new RangeRequestsPlugin(),
      ],
    }),
  },
  {
    matcher: /\.(?:mp4|webm)$/i,
    handler: new CacheFirst({
      cacheName: "static-video-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: ONE_DAY,
          maxAgeFrom: "last-used",
        }),
        new RangeRequestsPlugin(),
      ],
    }),
  },
  {
    matcher: isSameOriginApiRequest,
    method: "GET",
    handler: new NetworkOnly({
      networkTimeoutSeconds: 30, // Increased from 10s to prevent premature timeouts in dev
    }),
  },
  {
    matcher: isSameOriginRscRequest,
    handler: new NetworkOnly(),
  },
  {
    matcher: isSameOriginHtmlRequest,
    handler: new NetworkOnly(),
  },
  {
    matcher: /.*/i,
    method: "GET",
    handler: new NetworkOnly(),
  },
];

