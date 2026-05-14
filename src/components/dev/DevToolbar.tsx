"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-10: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-10) */

/**
 * Dev Toolbar — development environment only.
 * Renders a floating panel with dev-mode toggles.
 * Does NOT render in production (guarded by NEXT_PUBLIC_APP_ENV and a runtime check).
 *
 * Toggles:
 *   - Mock Razorpay: routes payment API calls to /api/dev/mock-razorpay
 *   - Mock Shiprocket: routes shipping API calls to /api/dev/mock-shiprocket
 *
 * State is persisted in localStorage under the key "letitrip_dev_prefs".
 */

import React, { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "letitrip_dev_prefs";
const IS_DEV = false &&
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    process.env.NEXT_PUBLIC_APP_ENV === "development");

interface DevPrefs {
  mockRazorpay: boolean;
  mockShiprocket: boolean;
  showToolbar: boolean;
}

const DEFAULT_PREFS: DevPrefs = {
  mockRazorpay: false,
  mockShiprocket: false,
  showToolbar: true,
};

function loadPrefs(): DevPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: DevPrefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function getDevPrefs(): DevPrefs {
  return loadPrefs();
}

export function isMockRazorpayEnabled(): boolean {
  return IS_DEV && loadPrefs().mockRazorpay;
}

export function isMockShiprocketEnabled(): boolean {
  return IS_DEV && loadPrefs().mockShiprocket;
}

interface ToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}

function Toggle({ label, description, enabled, onChange, color = "var(--appkit-color-cobalt)" }: ToggleProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
      <button
        onClick={() => onChange(!enabled)}
        style={{
          flexShrink: 0,
          width: 40,
          height: 22,
          borderRadius: 11,
          border: "none",
          cursor: "pointer",
          background: enabled ? color : "var(--appkit-color-slate-700)",
          position: "relative",
          transition: "background 0.2s",
          padding: 0,
        }}
        aria-pressed={enabled}
        aria-label={`Toggle ${label}`}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: enabled ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--appkit-color-text-on-dark)",
            transition: "left 0.2s",
            display: "block",
          }}
        />
      </button>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--appkit-color-slate-50)", lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--appkit-color-slate-400)", lineHeight: 1.4 }}>{description}</div>
      </div>
    </div>
  );
}

export function DevToolbar() {
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<DevPrefs>(DEFAULT_PREFS);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setMounted(true);
    setPrefs(loadPrefs());
  }, []);

  const update = useCallback((patch: Partial<DevPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
  }, [prefs]);

  // Don't render in production or before hydration
  if (!mounted || !IS_DEV) return null;

  if (!prefs.showToolbar) {
    return (
      <button
        onClick={() => update({ showToolbar: true })}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          background: "var(--appkit-color-slate-900)",
          border: "1px solid var(--appkit-color-slate-700)",
          borderRadius: 8,
          color: "var(--appkit-color-slate-400)",
          fontSize: 11,
          padding: "4px 8px",
          cursor: "pointer",
        }}
        title="Show Dev Toolbar"
      >
        DEV
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: "var(--appkit-color-slate-900)",
        border: "1px solid var(--appkit-color-slate-700)",
        borderRadius: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        color: "var(--appkit-color-slate-50)",
        fontFamily: "monospace",
        minWidth: 240,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid var(--appkit-color-slate-700)",
          background: "var(--appkit-color-slate-950)",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--appkit-color-purple-400)" }}>
          ⚙ DEV TOOLBAR
        </span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span
            style={{
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 4,
              background: "var(--appkit-color-cobalt-800)",
              color: "var(--appkit-color-cobalt-200)",
            }}
          >
            localhost
          </span>
          <span style={{ fontSize: 12, color: "var(--appkit-color-slate-500)" }}>
            {collapsed ? "▸" : "▾"}
          </span>
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: 12 }}>
          {/* Active mocks indicator */}
          {(prefs.mockRazorpay || prefs.mockShiprocket) && (
            <div
              style={{
                marginBottom: 10,
                padding: "4px 8px",
                background: "var(--appkit-color-amber-800)",
                borderRadius: 6,
                fontSize: 11,
                color: "var(--appkit-color-amber-100)",
              }}
            >
              ⚠ Mock services active — payment/shipping calls go to local routes
            </div>
          )}

          <Toggle
            label="Mock Razorpay"
            description={
              prefs.mockRazorpay
                ? "→ /api/dev/mock-razorpay (active)"
                : "Use mock Razorpay instead of live keys"
            }
            enabled={prefs.mockRazorpay}
            onChange={(v) => update({ mockRazorpay: v })}
            color="var(--appkit-color-amber-500)"
          />

          <Toggle
            label="Mock Shiprocket"
            description={
              prefs.mockShiprocket
                ? "→ /api/dev/mock-shiprocket (active)"
                : "Use mock Shiprocket for shipping flows"
            }
            enabled={prefs.mockShiprocket}
            onChange={(v) => update({ mockShiprocket: v })}
            color="var(--appkit-color-emerald-500)"
          />

          <div
            style={{
              borderTop: "1px solid var(--appkit-color-slate-700)",
              paddingTop: 8,
              display: "flex",
              gap: 8,
            }}
          >
            <a
              href="/api/dev/mock-razorpay"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10, color: "var(--appkit-color-cobalt-300)", textDecoration: "none" }}
            >
              Razorpay Docs ↗
            </a>
            <a
              href="/api/dev/mock-shiprocket?action=status"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10, color: "var(--appkit-color-cobalt-300)", textDecoration: "none" }}
            >
              Shiprocket Status ↗
            </a>
            <button
              onClick={() => update({ showToolbar: false })}
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "var(--appkit-color-slate-500)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Hide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
