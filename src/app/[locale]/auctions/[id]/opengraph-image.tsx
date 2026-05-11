import { ImageResponse } from "next/og";
import { getAuctionForDetail } from "@mohasinac/appkit";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const auction = await getAuctionForDetail(id).catch(() => null);

  const title = auction?.title ?? "Live Auction";
  const endDate = auction?.auctionEndDate
    ? new Date(auction.auctionEndDate as unknown as string)
    : null;
  const endsLabel = endDate ? `Ends ${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : null;
  const imageUrl = auction?.mainImage || auction?.images?.[0] || null;
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
        }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15 }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.8) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "60px",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              style={{ width: 420, height: 420, objectFit: "contain", borderRadius: 16, flexShrink: 0 }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
            <div style={{ fontSize: 20, color: "#f59e0b", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
              {siteName} · Live Auction
            </div>
            <div
              style={{
                fontSize: imageUrl ? 44 : 56,
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </div>
            {endsLabel && (
              <div style={{ fontSize: 28, fontWeight: 600, color: "#f59e0b" }}>
                {endsLabel}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
