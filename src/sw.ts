/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { runtimeCaching } from "./lib/pwa/runtime-caching";
import { LEGACY_RUNTIME_CACHE_NAMES } from "./lib/pwa/runtime-caching-rules";

// Type augmentation for serwist's injected precache manifest
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) =>
              LEGACY_RUNTIME_CACHE_NAMES.includes(cacheName),
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      ),
  );
});
