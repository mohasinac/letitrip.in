import { NextRequest, NextResponse } from "next/server";
import {
  siteSettingsRepository,
  fetchInstagramPosts,
  fetchFacebookPosts,
  fetchTikTokPosts,
  fetchDeviantArtPosts,
} from "@mohasinac/appkit/server";
import type { SocialPlatform, SocialPostType } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

const CACHE_HEADER = "public, max-age=300, s-maxage=300, stale-while-revalidate=60";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const platform = searchParams.get("platform") as SocialPlatform | null;
  const handle = searchParams.get("handle") ?? "";
  const postType = (searchParams.get("postType") ?? "all") as SocialPostType;
  const count = clamp(Number(searchParams.get("count") ?? "9"), 1, 12);

  if (!platform || !handle) {
    return NextResponse.json({ error: "platform and handle are required" }, { status: 400 });
  }

  const credentials = await siteSettingsRepository.getDecryptedCredentials().catch(() => null);

  try {
    switch (platform) {
      case "instagram": {
        const token = credentials?.metaPageAccessToken;
        if (!token)
          return NextResponse.json({ error: "Instagram access token not configured" }, { status: 503 });
        const posts = await fetchInstagramPosts(handle, postType, count, token);
        return NextResponse.json({ posts }, { headers: { "Cache-Control": CACHE_HEADER } });
      }
      case "facebook": {
        const token = credentials?.metaPageAccessToken;
        if (!token)
          return NextResponse.json({ error: "Facebook access token not configured" }, { status: 503 });
        const posts = await fetchFacebookPosts(handle, postType, count, token);
        return NextResponse.json({ posts }, { headers: { "Cache-Control": CACHE_HEADER } });
      }
      case "tiktok": {
        const token = credentials?.tiktokAccessToken;
        if (!token)
          return NextResponse.json({ error: "TikTok access token not configured" }, { status: 503 });
        const posts = await fetchTikTokPosts(handle, postType, count, token);
        return NextResponse.json({ posts }, { headers: { "Cache-Control": CACHE_HEADER } });
      }
      case "deviantart": {
        const clientId = credentials?.deviantartClientId;
        const clientSecret = credentials?.deviantartClientSecret;
        if (!clientId || !clientSecret)
          return NextResponse.json({ error: "DeviantArt credentials not configured" }, { status: 503 });
        const posts = await fetchDeviantArtPosts(handle, postType, count, clientId, clientSecret);
        return NextResponse.json({ posts }, { headers: { "Cache-Control": CACHE_HEADER } });
      }
      default:
        return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[social-feed] ${platform} fetch failed:`, message);
    return NextResponse.json({ error: `Failed to fetch ${platform} posts` }, { status: 502 });
  }
}
