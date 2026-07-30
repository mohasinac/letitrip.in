"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ref,
  set,
  onDisconnect,
  serverTimestamp,
  runTransaction,
} from "firebase/database";
import { realtimeDb } from "@/lib/firebase/config";

function getOrCreateClientId(): string {
  const key = "letitrip:cid";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = [Math.random(), Math.random()]
      .map((n) => n.toString(36).slice(2, 9))
      .join("");
    sessionStorage.setItem(key, id);
  }
  return id;
}

/**
 * Tracks user presence in RTDB and increments per-page view counters.
 * Called once in LayoutShellClient — covers all public + dashboard pages.
 *
 * Presence path : presence/{clientId}  → { page, lastSeen, isGuest, uid }
 * Page views    : analytics/pageviews/{YYYY-MM-DD}/{encodedPath} → integer
 */
export function usePresence(uid: string | null) {
  const pathname = usePathname();
  const clientIdRef = useRef<string>("");
  const disconnectArmedRef = useRef(false);

  useEffect(() => {
    if (!realtimeDb || typeof window === "undefined") return;

    if (!clientIdRef.current) {
      try {
        clientIdRef.current = getOrCreateClientId();
      } catch {
        return; // sessionStorage blocked (private mode edge case)
      }
    }
    const clientId = clientIdRef.current;
    if (!clientId) return;

    const presenceRef = ref(realtimeDb, `presence/${clientId}`);

    // Update presence entry — best-effort
    void (async () => {
      try {
        await set(presenceRef, {
          page: pathname,
          lastSeen: serverTimestamp(),
          isGuest: !uid,
          uid: uid ?? null,
        });
        // Only arm the disconnect handler once per session — RTDB holds it
        if (!disconnectArmedRef.current) {
          await onDisconnect(presenceRef).remove();
          disconnectArmedRef.current = true;
        }
      } catch {
        // network offline / RTDB unavailable — silent
      }
    })();

    // Increment page view counter for today
    void (async () => {
      try {
        const encodedPath = pathname.replace(/\//g, "|") || "|root";
        // eslint-disable-next-line lir/no-raw-date
        const date = new Date().toISOString().split("T")[0];
        const pvRef = ref(
          realtimeDb,
          `analytics/pageviews/${date}/${encodedPath}`,
        );
        await runTransaction(pvRef, (current) => (current ?? 0) + 1);
      } catch {
        // best-effort
      }
    })();
  }, [pathname, uid]);
}
