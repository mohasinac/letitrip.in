/**
 * Order Invoice
 *
 * GET /api/orders/[id]/invoice
 *
 * Returns a printable HTML invoice for the authenticated user's order.
 * The response is an HTML page with print-optimised styles; the user can
 * print or save as PDF via the browser's native print dialog.
 *
 * Access control: user must own the order, or be an admin.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@mohasinac/appkit/providers/db-firebase";
import { orderRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { formatCurrency, formatDate } from "@/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Authenticate via session cookie (same as middleware)
  const sessionCookie = req.cookies.get("__session")?.value;
  if (!sessionCookie) {
    return new NextResponse("Unauthorised", { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    uid = decoded.uid;
  } catch {
    return new NextResponse("Unauthorised", { status: 401 });
  }

  const order = await orderRepository.findById(id).catch(() => null);
  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  // Verify ownership (admins have a separate admin role check not needed here
  // — regular users can only fetch their own invoices)
  if (order.userId !== uid) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const orderIdDisplay = order.id.slice(0, 8).toUpperCase();
  const orderedDate = formatDate(order.orderDate);
  const paymentMethod = order.paymentMethod ?? "—";
  const paymentStatus =
    order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1);
  const total = formatCurrency(order.totalPrice, order.currency);

  serverLogger.info(`Invoice generated for order ${id} by user ${uid}`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice — Order #${orderIdDisplay}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand { font-size: 24px; font-weight: 800; color: #6d28d9; letter-spacing: -0.5px; }
    .brand span { color: #1a1a1a; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #1a1a1a; }
    .invoice-meta { color: #6b7280; font-size: 13px; margin-top: 4px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 4px; }
    .value { font-size: 14px; color: #1a1a1a; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .totals { margin-top: 16px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #4b5563; }
    .total-row.final { font-size: 16px; font-weight: 700; color: #1a1a1a; padding-top: 12px; border-top: 2px solid #1a1a1a; margin-top: 8px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-failed { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.6; }
    .print-btn { display: block; margin: 0 auto 32px; padding: 10px 28px; background: #6d28d9; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    @media print {
      .print-btn { display: none; }
      body { padding: 24px; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="header">
    <div>
      <div class="brand">Let<span>It</span>Rip</div>
      <div style="color:#6b7280;font-size:13px;margin-top:4px;">letitrip.in</div>
    </div>
    <div style="text-align:right;">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">#${orderIdDisplay}</div>
      <div class="invoice-meta">Date: ${orderedDate}</div>
    </div>
  </div>

  <hr class="divider" />

  <div class="grid-2">
    <div>
      <div class="label">Billed To</div>
      <div class="value">${escapeHtml(order.userName ?? "Customer")}</div>
      <div class="value" style="color:#6b7280;">${escapeHtml(order.userEmail ?? "")}</div>
    </div>
    <div>
      <div class="label">Shipping Address</div>
      <div class="value">${escapeHtml(order.shippingAddress ?? "—")}</div>
    </div>
  </div>

  <div class="grid-2">
    <div>
      <div class="label">Payment Method</div>
      <div class="value">${escapeHtml(paymentMethod)}</div>
    </div>
    <div>
      <div class="label">Payment Status</div>
      <span class="badge badge-${order.paymentStatus === "paid" ? "paid" : order.paymentStatus === "failed" ? "failed" : "pending"}">${escapeHtml(paymentStatus)}</span>
    </div>
  </div>

  <hr class="divider" />

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items && order.items.length > 0
        ? order.items
        : [
            {
              productTitle: order.productTitle,
              quantity: order.quantity,
              unitPrice: order.unitPrice,
              totalPrice: order.totalPrice,
            },
          ]
      )
        .map(
          (item) =>
            `<tr>
              <td>${escapeHtml(item.productTitle)}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice, order.currency)}</td>
              <td class="text-right">${formatCurrency(item.totalPrice ?? item.unitPrice * item.quantity, order.currency)}</td>
            </tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    ${order.depositAmount != null ? `<div class="total-row"><span>Deposit Paid</span><span>${formatCurrency(order.depositAmount, order.currency)}</span></div>` : ""}
    ${order.codRemainingAmount != null ? `<div class="total-row"><span>Remaining on Delivery</span><span>${formatCurrency(order.codRemainingAmount, order.currency)}</span></div>` : ""}
    ${order.shippingFee != null ? `<div class="total-row"><span>Shipping</span><span>${formatCurrency(order.shippingFee, order.currency)}</span></div>` : ""}
    ${order.platformFee != null && order.platformFee > 0 ? `<div class="total-row"><span>Platform Fee</span><span>${formatCurrency(order.platformFee, order.currency)}</span></div>` : ""}
    <div class="total-row final"><span>Total</span><span>${total}</span></div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with LetItRip!</p>
    <p>For support, contact us at support@letitrip.in</p>
    <p style="margin-top:8px;color:#d1d5db;">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
