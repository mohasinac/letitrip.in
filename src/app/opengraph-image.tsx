import { ImageResponse } from "next/og";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";

export const alt = SEO_CONFIG.siteName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, white 1px, transparent 0), radial-gradient(circle at 75% 75%, white 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Logo / Brand mark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 120,
          height: 120,
          borderRadius: 24,
          background: "rgba(255,255,255,0.15)",
          marginBottom: 32,
          fontSize: 64,
        }}
      >
        🛍️
      </div>

      {/* Site name */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: "white",
          letterSpacing: "-2px",
          marginBottom: 16,
          textShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {SEO_CONFIG.siteName}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 32,
          color: "rgba(255,255,255,0.85)",
          fontWeight: 400,
          letterSpacing: "0.5px",
        }}
      >
        {SEO_CONFIG.defaultDescription}
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          fontSize: 22,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: "1px",
        }}
      >
        letitrip.in
      </div>
    </div>,
    {
      ...size,
    },
  );
}
