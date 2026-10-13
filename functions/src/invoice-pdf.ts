/**
 * P-8 GST — Rule-46-compliant invoice PDF generator.
 *
 * Consumer-specific HTTPS Function (not appkit-generic — the invoice layout
 * is LetItRip-specific business logic). Called by
 * src/app/api/user/orders/[id]/invoice/route.ts via NEXT_PUBLIC_INVOICE_PDF_FUNCTION_URL.
 *
 * Returns { pdfBase64: string } JSON rather than a raw binary stream — the
 * shared bindHttps adapter (appkit/_internal/server/jobs/runtime/adapters/firebase.ts)
 * always responds with res.json(output), so this stays within that contract
 * instead of requiring a shared-adapter change that would affect every other
 * HTTPS function. The Next.js route decodes the base64 and streams it as
 * application/pdf to the browser.
 */

import PDFDocument from "pdfkit";
import {
  orderRepository,
  siteSettingsRepository,
  type OrderDocument,
  type OrderDocumentItem,
  type CallableHandler,
} from "@mohasinac/appkit/jobs";

export interface InvoicePdfInput {
  orderId: string;
}

export interface InvoicePdfOutput {
  pdfBase64: string;
}

function formatRupees(amount: number | undefined): string {
  return `Rs ${(amount ?? 0).toFixed(2)}`;
}

function buildPdfBuffer(order: OrderDocument, gst: { gstin: string; legalName: string; address: string } | null): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Header — seller legal identity (Rule 46) ──────────────────────────
    doc.fontSize(18).text(gst?.legalName || "LetItRip", { align: "left" });
    doc.fontSize(9).fillColor("#555");
    if (gst?.gstin) doc.text(`GSTIN: ${gst.gstin}`);
    if (gst?.address) doc.text(gst.address, { width: 300 });
    doc.fillColor("#000");
    doc.moveDown(0.5);
    doc.fontSize(14).text("Tax Invoice", { align: "right" });
    doc.fontSize(9).text(`Invoice / Order #: ${order.id}`, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt ?? Date.now()).toLocaleDateString("en-IN")}`, { align: "right" });
    doc.moveDown(1);

    // ── Bill-to ────────────────────────────────────────────────────────────
    doc.fontSize(10).text("Bill To:", { underline: true });
    doc.fontSize(9).text(order.userName || order.userId);
    if (order.userEmail) doc.text(order.userEmail);
    if (order.shippingAddress) doc.text(order.shippingAddress, { width: 300 });
    doc.moveDown(1);

    // ── Line items table ───────────────────────────────────────────────────
    const items: OrderDocumentItem[] = order.items?.length
      ? order.items
      : [{ productId: order.id, productTitle: "Item", quantity: 1, unitPrice: order.totalPrice ?? 0, totalPrice: order.totalPrice ?? 0 }];

    /*
     * 🛑 F1 #24 — HSN and GST% are shown only when a line actually carries
     * one, exactly as the HTML invoice already decides it.
     *
     * Rule 46 wants both per line, but this same document is also the receipt
     * for an order placed before GST was enabled — and an empty HSN column on
     * every row reads as MISSING DATA rather than as "not applicable". The
     * HTML sibling's comment says so and points here as the place it still
     * reads badly; this is that fix, with the same predicate so the two
     * documents cannot disagree about one order.
     */
    const showTaxCols = items.some((i) => i.hsnCode || i.gstRate != null);
    const colX = showTaxCols
      ? { item: 40, hsn: 260, qty: 320, rate: 360, taxable: 420, gst: 480 }
      : { item: 40, hsn: 0, qty: 330, rate: 390, taxable: 470, gst: 0 };
    const tableTop = doc.y;
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Item", colX.item, tableTop, { width: 210 });
    if (showTaxCols) doc.text("HSN", colX.hsn, tableTop, { width: 55 });
    doc.text("Qty", colX.qty, tableTop, { width: 35 });
    doc.text("Rate", colX.rate, tableTop, { width: 55 });
    doc.text(showTaxCols ? "Taxable" : "Amount", colX.taxable, tableTop, { width: 60 });
    if (showTaxCols) doc.text("GST%", colX.gst, tableTop, { width: 50 });
    doc.font("Helvetica").moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#ccc").stroke();
    doc.moveDown(0.3);

    for (const item of items) {
      const rowY = doc.y;
      doc.fontSize(8);
      doc.text(item.productTitle, colX.item, rowY, { width: 210 });
      if (showTaxCols) doc.text(item.hsnCode ?? "—", colX.hsn, rowY, { width: 55 });
      doc.text(String(item.quantity), colX.qty, rowY, { width: 35 });
      doc.text(formatRupees(item.unitPrice), colX.rate, rowY, { width: 55 });
      doc.text(formatRupees(item.totalPrice), colX.taxable, rowY, { width: 60 });
      /*
       * `0%` is a deliberate exemption and must read as one; an ABSENT rate
       * predates the field and is not the same statement. The HTML renders
       * "—" for absent, so this stops saying "Exempt" for both.
       */
      if (showTaxCols) {
        doc.text(item.gstRate == null ? "—" : `${item.gstRate}%`, colX.gst, rowY, { width: 50 });
      }
      doc.moveDown(0.6);
    }
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#ccc").stroke();
    doc.moveDown(0.5);

    // ── Tax breakup + grand total (Rule 46) ────────────────────────────────
    const summaryX = 380;
    const line = (label: string, value: string, bold = false) => {
      if (bold) doc.font("Helvetica-Bold");
      doc.fontSize(9).text(label, summaryX, doc.y, { width: 100, continued: true });
      doc.text(value, { width: 75, align: "right" });
      if (bold) doc.font("Helvetica");
    };
    /*
     * 🛑 F1 #23 — EVERY FEE THE BUYER PAID GETS A LINE, or this invoice does
     * not add up to its own Grand Total.
     *
     * It listed Taxable Amount, CGST/SGST/IGST and COD handling, and nothing
     * else: shipping, the discount, WhatsApp updates, gift wrap, shipment
     * protection and the platform fee were all inside `totalPrice` with no row
     * to explain them. On a real order that left ₹21.80 unaccounted for, which
     * reads as a rounding quirk rather than as missing rows.
     *
     * The HTML sibling was fixed in C0c defect 8 and this one was not, so the
     * two documents for one order disagreed. Same rows, same order, same
     * "render only when the buyer was actually charged it" rule — a fee that is
     * absent or zero still produces a clean invoice.
     *
     * 🛑 A GST document whose lines cannot be reconciled is a compliance
     * problem, not a presentation one.
     */
    const feeLine = (label: string, amount: number | undefined) => {
      if (amount === undefined || amount <= 0) return;
      line(label, formatRupees(amount));
    };

    line("Taxable Amount:", formatRupees(order.taxableAmount ?? order.totalPrice));
    feeLine("Exempt (0% GST):", order.exemptAmount);
    feeLine("Shipping:", order.shippingFee);
    /*
     * Discounts are a REDUCTION, so they carry their own sign and cannot go
     * through `feeLine`. `appliedDiscounts` is authoritative (an order may
     * stack a seller coupon and a platform one); the scalar is the fallback for
     * orders written before that array existed.
     */
    if (order.appliedDiscounts?.length) {
      for (const d of order.appliedDiscounts) {
        if (d.discountAmount > 0) line(`Discount (${d.code}):`, `−${formatRupees(d.discountAmount)}`);
      }
    } else if (order.couponDiscount && order.couponDiscount > 0) {
      line(
        order.couponCode ? `Discount (${order.couponCode}):` : "Discount:",
        `−${formatRupees(order.couponDiscount)}`,
      );
    }
    feeLine("COD Handling Fee:", order.codHandlingFee);
    feeLine("WhatsApp Updates:", order.whatsappNotifyFee);
    feeLine("Gift Wrap:", order.giftWrapFee);
    feeLine("Shipment Protection:", order.shipmentProtectionFee);
    feeLine("Platform Fee:", order.platformFee);
    feeLine("CGST:", order.cgst);
    feeLine("SGST:", order.sgst);
    feeLine("IGST:", order.igst);
    /*
     * `gstAmount` is product GST PLUS the GST charged on our platform fee, so
     * it is LARGER than cgst+sgst+igst and is its own row rather than a
     * substitute for them — which is what makes the column sum to the total.
     * Shown alone when the split was never recorded, so a pre-breakdown order
     * still produces a readable receipt.
     */
    if (order.cgst || order.sgst || order.igst) {
      feeLine("Tax (GST), total:", order.gstAmount);
    } else {
      feeLine("Tax (GST):", order.gstAmount);
    }
    doc.moveDown(0.3);
    line("Grand Total:", formatRupees(order.totalPrice), true);

    doc.moveDown(2);
    doc.fontSize(7).fillColor("#888").text(
      "This is a system-generated tax invoice under Rule 46 of the CGST Rules, 2017.",
      40,
      doc.y,
      { align: "center", width: 515 },
    );

    doc.end();
  });
}

export const invoicePdfHandler: CallableHandler<InvoicePdfInput, InvoicePdfOutput> = async (input) => {
  const order = await orderRepository.findById(input.orderId);
  if (!order) {
    const err = new Error("Order not found") as Error & { httpStatus?: number };
    err.httpStatus = 404;
    throw err;
  }
  const settings = await siteSettingsRepository.getSingleton();
  const gst = settings?.gst?.enabled
    ? { gstin: settings.gst.gstin, legalName: settings.gst.legalName, address: settings.gst.address }
    : null;

  const buffer = await buildPdfBuffer(order, gst);
  return { pdfBase64: buffer.toString("base64") };
};
