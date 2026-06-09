"use client";

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
import { Button, Div, Span } from "@mohasinac/appkit/client";

const BORDER_SLATE = "1px solid var(--appkit-color-slate-700)";

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
    <Div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
      <Button
        type="button"
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
      </Button>
      <>
        <Div style={{ fontSize: 12, fontWeight: 600, color: "var(--appkit-color-slate-50)", lineHeight: 1.3 }}>{label}</Div>
        <Div style={{ fontSize: 11, color: "var(--appkit-color-slate-400)", lineHeight: 1.4 }}>{description}</Div>
      </>
    </Div>
  );
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderToolbarHeader(collapsed: boolean, onToggle: () => void) {
  return (
    <Div
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: BORDER_SLATE, background: "var(--appkit-color-slate-950)", cursor: "pointer" }}
      onClick={onToggle}
    >
      <Span style={{ fontSize: 12, fontWeight: 700, color: "var(--appkit-color-purple-400)" }}>⚙ DEV TOOLBAR</Span>
      <Span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "var(--appkit-color-cobalt-800)", color: "var(--appkit-color-cobalt-200)" }}>localhost</Span>
        <Span style={{ fontSize: 12, color: "var(--appkit-color-slate-500)" }}>{collapsed ? "▸" : "▾"}</Span>
      </Span>
    </Div>
  );
}

function renderMockIndicator(prefs: DevPrefs) {
  if (!prefs.mockRazorpay && !prefs.mockShiprocket) return null;
  return (
    <Div style={{ marginBottom: 10, padding: "4px 8px", background: "var(--appkit-color-amber-800)", borderRadius: 6, fontSize: 11, color: "var(--appkit-color-amber-100)" }}>
      ⚠ Mock services active — payment/shipping calls go to local routes
    </Div>
  );
}

function renderToolbarFooter(onHide: () => void) {
  return (
    <Div style={{ borderTop: BORDER_SLATE, paddingTop: 8, display: "flex", gap: 8 }}>
      <Button type="button" variant="ghost" onClick={() => window.open("/api/dev/mock-razorpay", "_blank")} style={{ fontSize: 10, color: "var(--appkit-color-cobalt-300)", padding: 0, background: "none", border: "none" }}>Razorpay Docs ↗</Button>
      <Button type="button" variant="ghost" onClick={() => window.open("/api/dev/mock-shiprocket?action=status", "_blank")} style={{ fontSize: 10, color: "var(--appkit-color-cobalt-300)", padding: 0, background: "none", border: "none" }}>Shiprocket Status ↗</Button>
      <Button type="button" variant="ghost" onClick={onHide} style={{ marginLeft: "auto", fontSize: 10, color: "var(--appkit-color-slate-500)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Hide</Button>
    </Div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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

  if (!mounted || !IS_DEV) return null;

  if (!prefs.showToolbar) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => update({ showToolbar: true })}
        style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999, background: "var(--appkit-color-slate-900)", border: BORDER_SLATE, borderRadius: 8, color: "var(--appkit-color-slate-400)", fontSize: 11, padding: "4px 8px", cursor: "pointer" }}
        title="Show Dev Toolbar"
      >
        DEV
      </Button>
    );
  }

  return (
    <Div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999, background: "var(--appkit-color-slate-900)", border: BORDER_SLATE, borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", color: "var(--appkit-color-slate-50)", fontFamily: "monospace", minWidth: 240, overflow: "hidden" }}>
      {renderToolbarHeader(collapsed, () => setCollapsed((c) => !c))}
      {!collapsed && (
        <Div style={{ padding: 12 }}>
          {renderMockIndicator(prefs)}
          <Toggle
            label="Mock Razorpay"
            description={prefs.mockRazorpay ? "→ /api/dev/mock-razorpay (active)" : "Use mock Razorpay instead of live keys"}
            enabled={prefs.mockRazorpay}
            onChange={(v) => update({ mockRazorpay: v })}
            color="var(--appkit-color-amber-500)"
          />
          <Toggle
            label="Mock Shiprocket"
            description={prefs.mockShiprocket ? "→ /api/dev/mock-shiprocket (active)" : "Use mock Shiprocket for shipping flows"}
            enabled={prefs.mockShiprocket}
            onChange={(v) => update({ mockShiprocket: v })}
            color="var(--appkit-color-emerald-500)"
          />
          {renderToolbarFooter(() => update({ showToolbar: false }))}
        </Div>
      )}
    </Div>
  );
}
