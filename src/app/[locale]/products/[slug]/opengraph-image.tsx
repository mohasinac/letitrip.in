import { ImageResponse } from "next/og";
import { getProductForDetail } from "@mohasinac/appkit";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const product = await getProductForDetail(slug).catch(() => null);

  const title = product?.title ?? "Product";
  const price = product?.price
    ? `₹${(product.price / 100).toLocaleString("en-IN")}`
    : null;
  const imageUrl = product?.mainImage || product?.images?.[0] || null;
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
        {/* Background product image (blurred, low-opacity) */}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.15,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.8) 100%)",
          }}
        />

        {/* Content */}
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
          {/* Product image */}
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: 420,
                height: 420,
                objectFit: "contain",
                borderRadius: 16,
                flexShrink: 0,
              }}
            />
          )}

          {/* Text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: "#84e122",
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {siteName}
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
            {price && (
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#84e122",
                }}
              >
                {price}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
