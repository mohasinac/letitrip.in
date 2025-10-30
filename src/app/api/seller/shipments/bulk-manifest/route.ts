import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/database/config";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";

/**
 * Generate bulk manifest for multiple shipments
 * POST /api/seller/shipments/bulk-manifest
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    const body = await req.json();
    const { shipmentIds = [] } = body;

    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No shipment IDs provided" },
        { status: 400 },
      );
    }

    // Get all shipments
    const shipments: any[] = [];
    for (const shipmentId of shipmentIds) {
      const shipmentRef = doc(db, "seller_shipments", shipmentId);
      const shipmentSnap = await getDoc(shipmentRef);

      if (!shipmentSnap.exists()) {
        continue;
      }

      const shipmentData = shipmentSnap.data();

      // Verify ownership (unless admin)
      if (userRole !== "admin" && shipmentData.sellerId !== userId) {
        continue;
      }

      shipments.push({
        id: shipmentSnap.id,
        ...shipmentData,
      });
    }

    if (shipments.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid shipments found" },
        { status: 404 },
      );
    }

    // Generate manifest HTML
    const manifestHtml = generateManifestHtml(shipments);

    // In a real application, you would:
    // 1. Generate PDF using puppeteer/playwright
    // 2. Upload to Firebase Storage
    // 3. Return download URL
    //
    // For now, return HTML that can be printed

    return NextResponse.json({
      success: true,
      data: {
        manifestHtml,
        shipmentCount: shipments.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating manifest:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate manifest",
      },
      { status: 500 },
    );
  }
}

/**
 * Generate HTML for bulk manifest
 */
function generateManifestHtml(shipments: any[]): string {
  const now = new Date();
  const manifestDate = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bulk Shipment Manifest - ${manifestDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      font-size: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .header p {
      color: #64748b;
    }
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
    }
    .summary div {
      text-align: center;
    }
    .summary strong {
      display: block;
      font-size: 24px;
      color: #2563eb;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px;
      text-align: left;
    }
    th {
      background: #2563eb;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BULK SHIPMENT MANIFEST</h1>
    <p>Generated on ${manifestDate}</p>
    <p>JUSTFORVIEW.IN</p>
  </div>

  <div class="summary">
    <div>
      <strong>${shipments.length}</strong>
      <span>Total Shipments</span>
    </div>
    <div>
      <strong>${shipments.filter((s) => s.status === "pending").length}</strong>
      <span>Pending</span>
    </div>
    <div>
      <strong>${shipments.filter((s) => s.status === "pickup_scheduled").length}</strong>
      <span>Pickup Scheduled</span>
    </div>
    <div>
      <strong>${shipments.filter((s) => s.status === "in_transit").length}</strong>
      <span>In Transit</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>S.No</th>
        <th>Order #</th>
        <th>Tracking #</th>
        <th>Carrier</th>
        <th>Customer Name</th>
        <th>Destination</th>
        <th>Weight</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${shipments
        .map(
          (shipment, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${shipment.orderId || "N/A"}</td>
          <td>${shipment.trackingNumber || "N/A"}</td>
          <td>${shipment.carrier || "N/A"}</td>
          <td>${shipment.toAddress?.name || "N/A"}</td>
          <td>${shipment.toAddress?.city || "N/A"}, ${shipment.toAddress?.state || "N/A"}</td>
          <td>${shipment.weight || 0} kg</td>
          <td>${(shipment.status || "pending").replace(/_/g, " ").toUpperCase()}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>This is a computer-generated manifest. No signature required.</p>
    <p>© ${now.getFullYear()} justforview.in - All rights reserved</p>
  </div>
</body>
</html>
  `.trim();
}
