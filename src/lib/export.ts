/**
 * Export Utilities
 *
 * Utilities for exporting data to CSV, PDF, and other formats
 * Used for reports, invoices, and data exports
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  options: {
    headers?: string[]; // Custom header names
    columns?: (keyof T)[]; // Specific columns to include
    delimiter?: string;
    includeHeaders?: boolean;
  } = {},
): string {
  const { headers, columns, delimiter = ",", includeHeaders = true } = options;

  if (data.length === 0) return "";

  // Determine columns to export
  const cols = columns || (Object.keys(data[0]) as (keyof T)[]);

  // Generate header row
  const headerRow = headers || cols.map(String);

  // Generate data rows
  const rows = data.map((item) =>
    cols
      .map((col) => {
        const value = item[col];

        // Handle different types
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        if (
          typeof value === "string" &&
          (value.includes(delimiter) ||
            value.includes("\n") ||
            value.includes('"'))
        ) {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        }

        return String(value);
      })
      .join(delimiter),
  );

  // Combine header and rows
  const lines = includeHeaders ? [headerRow.join(delimiter), ...rows] : rows;

  return lines.join("\n");
}

/**
 * Download CSV file in browser
 */
export function downloadCSV(
  data: any[],
  filename: string,
  options?: Parameters<typeof arrayToCSV>[1],
): void {
  const csv = arrayToCSV(data, options);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export products to CSV
 */
export function exportProductsToCSV(
  products: Array<{
    id: string;
    name: string;
    sku?: string;
    price: number;
    originalPrice?: number;
    stockCount: number;
    category?: string;
    status: string;
    createdAt: Date | string;
  }>,
  filename: string = "products-export",
): void {
  const formatted = products.map((p) => ({
    "Product ID": p.id,
    "Product Name": p.name,
    SKU: p.sku || "",
    "Price (₹)": p.price,
    "Original Price (₹)": p.originalPrice || "",
    Stock: p.stockCount,
    Category: p.category || "",
    Status: p.status,
    "Created At":
      typeof p.createdAt === "string" ? p.createdAt : p.createdAt.toISOString(),
  }));

  downloadCSV(formatted, filename);
}

/**
 * Export orders to CSV
 */
export function exportOrdersToCSV(
  orders: Array<{
    id: string;
    orderNumber?: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    paymentStatus?: string;
    createdAt: Date | string;
  }>,
  filename: string = "orders-export",
): void {
  const formatted = orders.map((o) => ({
    "Order ID": o.id,
    "Order Number": o.orderNumber || o.id.slice(-8).toUpperCase(),
    "Customer Name": o.customerName,
    "Customer Email": o.customerEmail,
    "Total Amount (₹)": o.totalAmount,
    "Order Status": o.status,
    "Payment Status": o.paymentStatus || "",
    "Order Date":
      typeof o.createdAt === "string" ? o.createdAt : o.createdAt.toISOString(),
  }));

  downloadCSV(formatted, filename);
}

/**
 * Export revenue report to CSV
 */
export function exportRevenueToCSV(
  revenueData: Array<{
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }>,
  filename: string = "revenue-report",
): void {
  const formatted = revenueData.map((r) => ({
    Date: r.date,
    "Revenue (₹)": r.revenue,
    Orders: r.orders,
    "Average Order Value (₹)": r.averageOrderValue,
  }));

  downloadCSV(formatted, filename);
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(
  customers: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    totalOrders: number;
    totalSpent: number;
    createdAt: Date | string;
  }>,
  filename: string = "customers-export",
): void {
  const formatted = customers.map((c) => ({
    "Customer ID": c.id,
    Name: c.name,
    Email: c.email,
    Phone: c.phone || "",
    "Total Orders": c.totalOrders,
    "Total Spent (₹)": c.totalSpent,
    "Registered On":
      typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString(),
  }));

  downloadCSV(formatted, filename);
}

/**
 * Generate invoice HTML (for PDF conversion)
 */
export function generateInvoiceHTML(invoice: {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;

  // Seller info
  sellerName: string;
  sellerAddress: string;
  sellerGST?: string;
  sellerPAN?: string;

  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;

  // Items
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;

  // Totals
  subtotal: number;
  tax?: number;
  taxRate?: number;
  shipping?: number;
  discount?: number;
  total: number;

  // Notes
  notes?: string;
  terms?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin: 0;
    }
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .invoice-meta div {
      flex: 1;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .totals table {
      margin-left: auto;
      width: 300px;
    }
    .totals td {
      border: none;
      padding: 8px 12px;
    }
    .total-row {
      font-size: 18px;
      font-weight: bold;
      background: #f3f4f6;
    }
    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #f9fafb;
      border-left: 4px solid #2563eb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="invoice-title">INVOICE</h1>
    <p>Invoice #${invoice.invoiceNumber}</p>
  </div>

  <div class="invoice-meta">
    <div>
      <p class="section-title">From</p>
      <p><strong>${invoice.sellerName}</strong></p>
      <p>${invoice.sellerAddress.replace(/\n/g, "<br>")}</p>
      ${invoice.sellerGST ? `<p>GST: ${invoice.sellerGST}</p>` : ""}
      ${invoice.sellerPAN ? `<p>PAN: ${invoice.sellerPAN}</p>` : ""}
    </div>
    <div>
      <p class="section-title">To</p>
      <p><strong>${invoice.customerName}</strong></p>
      <p>${invoice.customerEmail}</p>
      ${invoice.customerPhone ? `<p>${invoice.customerPhone}</p>` : ""}
      <p>${invoice.customerAddress.replace(/\n/g, "<br>")}</p>
    </div>
    <div>
      <p class="section-title">Invoice Details</p>
      <p><strong>Date:</strong> ${invoice.invoiceDate}</p>
      ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${invoice.dueDate}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">₹${item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td class="text-right">₹${item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">₹${invoice.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
      ${
        invoice.discount
          ? `
        <tr>
          <td>Discount:</td>
          <td class="text-right">-₹${invoice.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `
          : ""
      }
      ${
        invoice.shipping
          ? `
        <tr>
          <td>Shipping:</td>
          <td class="text-right">₹${invoice.shipping.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `
          : ""
      }
      ${
        invoice.tax
          ? `
        <tr>
          <td>Tax (${invoice.taxRate || 18}%):</td>
          <td class="text-right">₹${invoice.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `
          : ""
      }
      <tr class="total-row">
        <td>Total:</td>
        <td class="text-right">₹${invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  ${
    invoice.notes
      ? `
    <div class="notes">
      <p class="section-title">Notes</p>
      <p>${invoice.notes}</p>
    </div>
  `
      : ""
  }

  ${
    invoice.terms
      ? `
    <div class="notes">
      <p class="section-title">Terms & Conditions</p>
      <p>${invoice.terms}</p>
    </div>
  `
      : ""
  }

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Generated on ${new Date().toLocaleDateString("en-IN")}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Print HTML content (for invoices)
 */
export function printHTML(html: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Download HTML as file
 */
export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".html") ? filename : `${filename}.html`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate date range filename suffix
 */
export function generateDateRangeFilename(
  startDate?: Date,
  endDate?: Date,
): string {
  if (!startDate && !endDate) {
    return new Date().toISOString().split("T")[0];
  }

  const start = startDate ? startDate.toISOString().split("T")[0] : "start";
  const end = endDate ? endDate.toISOString().split("T")[0] : "end";

  return `${start}_to_${end}`;
}

/**
 * Export JSON data
 */
export function exportJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".json") ? filename : `${filename}.json`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
