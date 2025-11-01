import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

// Interface definitions
interface InvoiceData {
  orderNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  seller: {
    name: string;
    email: string;
    phone: string;
    address: string;
    gstin?: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
    billingAddress: string;
  };
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    price: number;
    tax: number;
    total: number;
  }>;
  subtotal: number;
  couponDiscount: number;
  saleDiscount: number;
  shippingCharges: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}

/**
 * Generate invoice for an order
 * POST /api/seller/orders/[id]/invoice
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.uid;
    const userRole = (decoded as any).role || "user";

    // Get order using Admin SDK
    const db = getAdminDb();
    const orderSnap = await db.collection("orders").doc(params.id).get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const orderData = orderSnap.data()!;

    // Verify seller owns this order (unless admin)
    if (userRole !== "admin" && orderData.sellerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get seller information
    const sellerSnap = await db.collection("users").doc(orderData.sellerId).get();
    const sellerData = sellerSnap.exists ? sellerSnap.data() : null;

    // Generate invoice number (format: INV-YYYYMMDD-XXXXX)
    const invoiceDate = new Date();
    const dateStr = invoiceDate.toISOString().split("T")[0].replace(/-/g, "");
    const randomId = Math.random().toString(36).substr(2, 5).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomId}`;

    // Calculate due date (30 days from invoice date)
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // Format addresses
    const formatAddress = (addr: any) => {
      if (!addr) return "N/A";
      return `${addr.line1 || ""}${addr.line2 ? ", " + addr.line2 : ""}, ${
        addr.city || ""
      }, ${addr.state || ""} ${addr.postalCode || ""}, ${addr.country || ""}`;
    };

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderNumber: orderData.orderNumber,
      invoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      seller: {
        name: sellerData?.shopName || sellerData?.displayName || "N/A",
        email: sellerData?.email || "N/A",
        phone: sellerData?.phone || "N/A",
        address:
          sellerData?.shopAddress ||
          formatAddress(sellerData?.address) ||
          "N/A",
        gstin: sellerData?.gstin,
      },
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone || "N/A",
        shippingAddress: formatAddress(orderData.shippingAddress),
        billingAddress: formatAddress(
          orderData.billingAddress || orderData.shippingAddress,
        ),
      },
      items: (orderData.items || []).map((item: any) => ({
        name: item.name,
        sku: item.sku || "N/A",
        quantity: item.quantity,
        price: item.price,
        tax: item.tax || 0,
        total: item.quantity * item.price,
      })),
      subtotal: orderData.subtotal,
      couponDiscount: orderData.couponDiscount || 0,
      saleDiscount: orderData.saleDiscount || 0,
      shippingCharges: orderData.shippingCharges || 0,
      tax: orderData.tax || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      notes: `Payment via ${orderData.paymentMethod}. Order placed on ${new Date(
        orderData.createdAt,
      ).toLocaleDateString()}.`,
    };

    // Generate HTML invoice
    const invoiceHtml = generateInvoiceHtml(invoiceData);

    // In a real application, you would:
    // 1. Use a library like puppeteer to convert HTML to PDF
    // 2. Upload the PDF to Firebase Storage
    // 3. Return the download URL
    //
    // For now, we return the HTML and invoice data
    // The frontend can either display it or use a client-side PDF library

    return NextResponse.json({
      success: true,
      data: {
        invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        invoiceHtml,
        invoiceData,
      },
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate invoice",
      },
      { status: 500 },
    );
  }
}

/**
 * Generate HTML for invoice
 */
function generateInvoiceHtml(data: InvoiceData): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 36px;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .invoice-title p {
      color: #64748b;
      font-size: 14px;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .party {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
    }
    .party h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .party p {
      margin-bottom: 6px;
      font-size: 14px;
    }
    .party strong {
      color: #1e293b;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table thead {
      background: #2563eb;
      color: white;
    }
    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .items-table tbody tr:hover {
      background: #f8fafc;
    }
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      width: 350px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }
    .totals-row.subtotal {
      border-top: 1px solid #e2e8f0;
    }
    .totals-row.discount {
      color: #16a34a;
    }
    .totals-row.total {
      border-top: 2px solid #2563eb;
      border-bottom: 3px double #2563eb;
      font-size: 18px;
      font-weight: bold;
      color: #1e293b;
      margin-top: 10px;
      padding-top: 15px;
    }
    .payment-info {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .payment-info h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 12px;
    }
    .payment-info p {
      font-size: 14px;
      margin-bottom: 6px;
    }
    .payment-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .payment-status.paid {
      background: #dcfce7;
      color: #166534;
    }
    .payment-status.pending {
      background: #fef3c7;
      color: #854d0e;
    }
    .payment-status.failed {
      background: #fee2e2;
      color: #991b1b;
    }
    .notes {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 13px;
      color: #64748b;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="logo">HOBBIESSPOT.COM</div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <p>${data.invoiceNumber}</p>
      <p>Order: ${data.orderNumber}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Seller Details</h3>
      <p><strong>${data.seller.name}</strong></p>
      <p>${data.seller.email}</p>
      <p>${data.seller.phone}</p>
      <p>${data.seller.address}</p>
      ${data.seller.gstin ? `<p>GSTIN: ${data.seller.gstin}</p>` : ""}
    </div>
    <div class="party">
      <h3>Bill To</h3>
      <p><strong>${data.customer.name}</strong></p>
      <p>${data.customer.email}</p>
      <p>${data.customer.phone}</p>
      <p><strong>Shipping Address:</strong></p>
      <p>${data.customer.shippingAddress}</p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>SKU</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${data.items
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.sku}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.price)}</td>
          <td style="text-align: right;">${formatCurrency(item.total)}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row subtotal">
      <span>Subtotal:</span>
      <span>${formatCurrency(data.subtotal)}</span>
    </div>
    ${
      data.couponDiscount > 0
        ? `
    <div class="totals-row discount">
      <span>Coupon Discount:</span>
      <span>-${formatCurrency(data.couponDiscount)}</span>
    </div>
    `
        : ""
    }
    ${
      data.saleDiscount > 0
        ? `
    <div class="totals-row discount">
      <span>Sale Discount:</span>
      <span>-${formatCurrency(data.saleDiscount)}</span>
    </div>
    `
        : ""
    }
    <div class="totals-row">
      <span>Shipping Charges:</span>
      <span>${formatCurrency(data.shippingCharges)}</span>
    </div>
    <div class="totals-row">
      <span>Tax (GST):</span>
      <span>${formatCurrency(data.tax)}</span>
    </div>
    <div class="totals-row total">
      <span>Total Amount:</span>
      <span>${formatCurrency(data.total)}</span>
    </div>
  </div>

  <div class="payment-info">
    <h3>Payment Information</h3>
    <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
    <p><strong>Payment Status:</strong> 
      <span class="payment-status ${data.paymentStatus.toLowerCase()}">
        ${data.paymentStatus}
      </span>
    </p>
    <p><strong>Invoice Date:</strong> ${formatDate(data.invoiceDate)}</p>
    <p><strong>Due Date:</strong> ${formatDate(data.dueDate)}</p>
  </div>

  ${
    data.notes
      ? `
  <div class="notes">
    <strong>Notes:</strong><br>
    ${data.notes}
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>This is a computer-generated invoice and does not require a signature.</p>
    <p>© ${new Date().getFullYear()} hobbiesspot.com - All rights reserved</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Get invoice details (if previously generated)
 * GET /api/seller/orders/[id]/invoice
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.uid;
    const userRole = (decoded as any).role || "user";

    // Get order using Admin SDK
    const db = getAdminDb();
    const orderSnap = await db.collection("orders").doc(params.id).get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const orderData = orderSnap.data()!;

    // Verify seller owns this order (unless admin)
    if (userRole !== "admin" && orderData.sellerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Check if invoice exists in order metadata
    if (orderData.invoiceNumber) {
      return NextResponse.json({
        success: true,
        data: {
          invoiceNumber: orderData.invoiceNumber,
          invoiceDate: orderData.invoiceDate,
          invoiceUrl: orderData.invoiceUrl,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invoice not yet generated for this order",
    });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch invoice",
      },
      { status: 500 },
    );
  }
}
