import { NextResponse } from "next/server";
import { createSwaggerSpec } from "next-swagger-doc";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api", // scan API folder for JSDoc (optional to expand later)
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Letitrip API",
        version: "1.0.0",
        description:
          "Unified API (role-based) for shops, products, categories, coupons, orders, returns, auctions, media.",
      },
      servers: [
        { url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
      ],
      tags: [
        { name: "Shops" },
        { name: "Products" },
        { name: "Categories" },
        { name: "Coupons" },
        { name: "Orders" },
        { name: "Returns" },
        { name: "Auctions" },
        { name: "Media" },
        { name: "Users" },
        { name: "Analytics" },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "session", // adjust to your auth cookie name if different
          },
        },
      },
      security: [{ cookieAuth: [] }],
    },
  });

  return NextResponse.json(spec);
}
