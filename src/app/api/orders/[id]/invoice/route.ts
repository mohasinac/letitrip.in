import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { withRateLimit } from "@/app/api/middleware/ratelimiter";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

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
        const ref = Collections.orders().doc(id);
        const snap = await ref.get();
        if (!snap.exists)
          return NextResponse.json(
            { success: false, error: "Not found" },
            { status: 404 },
          );
        const order = snap.data() as any;

        if (
          order.user_id !== user.id &&
          user.role !== "admin" &&
          user.role !== "seller"
        ) {
          return NextResponse.json(
            { success: false, error: "Forbidden" },
            { status: 403 },
          );
        }

        const total = order.amount || 0;
        const tax = Math.round(total * 0.18 * 100) / 100;
        const grand = Math.round((total + tax) * 100) / 100;

        // Build PDF in memory
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const chunks: Uint8Array[] = [];
        const stream = doc.on("data", (chunk: Uint8Array) =>
          chunks.push(chunk),
        );

        // Header
        doc.fontSize(18).text("Tax Invoice", { align: "center" }).moveDown();
        doc.fontSize(12).text(`Invoice ID: INV-${id}`);
        doc.text(`Order ID: ${id}`);
        doc.text(`Date: ${new Date().toLocaleString("en-IN")}`);
        doc.moveDown();

        // Bill To
        const billing = order.billing_address || order.shipping_address || {};
        doc.fontSize(14).text("Bill To").moveDown(0.2);
        doc
          .fontSize(12)
          .text(billing.name || "")
          .text(billing.line1 || "")
          .text(billing.line2 || "")
          .text(
            `${billing.city || ""} ${billing.state || ""} ${
              billing.pincode || ""
            }`,
          )
          .text(billing.country || "")
          .moveDown();

        // Items table (simple)
        doc.fontSize(14).text("Items").moveDown(0.2);
        doc.fontSize(12);
        const items = order.items || [];
        if (items.length === 0) {
          doc.text("No items recorded");
        } else {
          items.forEach((it: any, idx: number) => {
            const qty = it.quantity || 1;
            const price = it.price || 0;
            const lineTotal = qty * price;
            doc.text(
              `${idx + 1}. ${
                it.name || it.product_name || "Item"
              }  x${qty}  -  ₹${lineTotal.toFixed(2)}`,
            );
          });
        }

        doc.moveDown();
        doc.text(`Subtotal: ₹${total.toFixed(2)}`);
        doc.text(`GST (18%): ₹${tax.toFixed(2)}`);
        doc.text(`Grand Total: ₹${grand.toFixed(2)}`);

        doc.moveDown();
        doc
          .fontSize(10)
          .fillColor("gray")
          .text(
            "This is a system generated invoice and does not require a signature.",
          );

        doc.end();

        // Collect buffer
        await new Promise<void>((resolve) => stream.on("end", () => resolve()));
        const buffer = Buffer.concat(chunks as any);

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "no-store",
          },
        });
      } catch (error) {
        logError(error as Error, {
          component: "API.orders.invoice",
          orderId: id,
        });
        return NextResponse.json(
          { success: false, error: "Failed to generate invoice" },
          { status: 500 },
        );
      }
    },
    { maxRequests: 20, windowMs: 60 * 1000 },
  );
}
