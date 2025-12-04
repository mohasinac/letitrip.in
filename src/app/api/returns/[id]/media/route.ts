import { getStorageAdmin } from "@/app/api/lib/firebase/admin";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { getCurrentUser } from "@/app/api/lib/session";
import { withRateLimit } from "@/app/api/middleware/ratelimiter";
import { logError } from "@/lib/firebase-error-logger";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILES_PER_CONFIRM = 8;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "mp4", "webm"];

// GET: Generate signed URLs for client-side direct upload (batch)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRateLimit(
    req,
    async (r) => {
      try {
        const user = await getCurrentUser(r);
        if (!user?.id)
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
          );

        const { id } = await params;
        const retRef = Collections.returns().doc(id);
        const retSnap = await retRef.get();
        if (!retSnap.exists)
          return NextResponse.json(
            { success: false, error: "Return not found" },
            { status: 404 },
          );
        const ret = retSnap.data() as any;

        const role = user.role;
        let authorized = false;
        if (role === "admin") authorized = true;
        else if (ret.user_id === user.id) authorized = true;
        else if (
          role === "seller" &&
          (await userOwnsShop(ret.shop_id, user.id))
        )
          authorized = true;
        if (!authorized)
          return NextResponse.json(
            { success: false, error: "Forbidden" },
            { status: 403 },
          );

        const storage = getStorageAdmin();
        const bucket = storage.bucket();

        const count = parseInt(r.nextUrl.searchParams.get("count") || "1", 10);
        const safeCount = Math.min(Math.max(count, 1), MAX_FILES_PER_CONFIRM);

        const uploads: { uploadUrl: string; path: string }[] = [];
        for (let i = 0; i < safeCount; i++) {
          const key = `${randomUUID()}`;
          const path = `returns/media/${id}/${key}`;
          const file = bucket.file(path);
          const [url] = await file.getSignedUrl({
            version: "v4",
            action: "write",
            expires: Date.now() + 10 * 60 * 1000,
            contentType: "application/octet-stream",
          });
          uploads.push({ uploadUrl: url, path });
        }

        return NextResponse.json({ success: true, data: { uploads } });
      } catch (error) {
        logError(error as Error, {
          component: "API.returns.media.getSignedUrls",
          returnId: id,
        });
        return NextResponse.json(
          { success: false, error: "Failed to create signed URLs" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 60, windowMs: 60 * 1000 },
  );
}

// POST: Confirm uploaded file paths (client performed direct upload). Append to document if valid.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRateLimit(
    req,
    async (r) => {
      try {
        const user = await getCurrentUser(r);
        if (!user?.id)
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
          );

        const { id } = await params;
        const retRef = Collections.returns().doc(id);
        const retSnap = await retRef.get();
        if (!retSnap.exists)
          return NextResponse.json(
            { success: false, error: "Return not found" },
            { status: 404 },
          );
        const ret = retSnap.data() as any;

        const role = user.role;
        let authorized = false;
        if (role === "admin") authorized = true;
        else if (ret.user_id === user.id) authorized = true;
        else if (
          role === "seller" &&
          (await userOwnsShop(ret.shop_id, user.id))
        )
          authorized = true;
        if (!authorized)
          return NextResponse.json(
            { success: false, error: "Forbidden" },
            { status: 403 },
          );

        const body = await r.json();
        const paths: string[] = Array.isArray(body.paths) ? body.paths : [];
        if (!paths.length)
          return NextResponse.json(
            { success: false, error: "No paths provided" },
            { status: 400 },
          );
        if (paths.length > MAX_FILES_PER_CONFIRM) {
          return NextResponse.json(
            { success: false, error: "Too many files in single confirm" },
            { status: 400 },
          );
        }

        // Basic validation: ensure paths start with returns/media/id and have allowed extension
        const valid: string[] = [];
        for (const p of paths) {
          if (!p.startsWith(`returns/media/${id}/`)) continue;
          const ext = p.split(".").pop()?.toLowerCase() || "";
          if (!ALLOWED_EXTENSIONS.includes(ext)) continue;
          valid.push(p);
        }
        if (!valid.length)
          return NextResponse.json(
            { success: false, error: "No valid file paths" },
            { status: 400 },
          );

        // Convert to public URLs (assuming GCS bucket public or served via CDN)
        const storage = getStorageAdmin();
        const bucket = storage.bucket();
        const urls = valid.map(
          (v) => `https://storage.googleapis.com/${bucket.name}/${v}`,
        );

        await retRef.update({
          media: [...(ret.media || []), ...urls],
          updated_at: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, data: { urls } });
      } catch (error) {
        logError(error as Error, {
          component: "API.returns.media.confirmUpload",
          returnId: id,
        });
        return NextResponse.json(
          { success: false, error: "Failed to confirm media" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 30, windowMs: 60 * 1000 },
  );
}
