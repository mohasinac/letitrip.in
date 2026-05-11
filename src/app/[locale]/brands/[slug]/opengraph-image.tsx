import { ImageResponse } from "next/og";
import { getBrandForDetail } from "@mohasinac/appkit";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandForDetail(slug).catch(() => null);

  const name = brand?.name ?? "Brand";
  const description = brand?.description?.slice(0, 120) ?? `Shop ${name} collectibles on LetItRip India.`;
  const logoUrl = brand?.logoURL || null;
  const siteName = SEO_CONFIG.siteName ?? "LetItRip";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0f172a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            padding: "60px",
            textAlign: "center",
          }}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={name}
              style={{ width: 160, height: 160, objectFit: "contain", borderRadius: 16 }}
            />
          )}
          <div style={{ fontSize: 18, color: "#94a3b8", fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>
            {siteName}
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.1 }}>
            {name}
          </div>
          <div style={{ fontSize: 24, color: "#94a3b8", maxWidth: 800, lineHeight: 1.5 }}>
            {description}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
