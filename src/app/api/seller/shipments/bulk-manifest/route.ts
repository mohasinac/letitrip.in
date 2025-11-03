import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';

/**
 * Helper function to verify seller authentication
 */
async function verifySellerAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'seller' && role !== 'admin') {
      throw new AuthorizationError('Seller access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'seller' | 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * Generate HTML for bulk manifest
 */
function generateManifestHtml(shipments: any[]): string {
  const now = new Date();
  const manifestDate = now.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
    <p>HOBBIESSPOT.COM</p>
  </div>

  <div class="summary">
    <div>
      <strong>${shipments.length}</strong>
      <span>Total Shipments</span>
    </div>
    <div>
      <strong>${shipments.filter((s) => s.status === 'pending').length}</strong>
      <span>Pending</span>
    </div>
    <div>
      <strong>${shipments.filter((s) => s.status === 'pickup_scheduled').length}</strong>
      <span>Pickup Scheduled</span>
    </div>
    <div>
      <strong>${shipments.filter((s) => s.status === 'in_transit').length}</strong>
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
          <td>${shipment.orderId || 'N/A'}</td>
          <td>${shipment.trackingNumber || 'N/A'}</td>
          <td>${shipment.carrier || 'N/A'}</td>
          <td>${shipment.toAddress?.name || 'N/A'}</td>
          <td>${shipment.toAddress?.city || 'N/A'}, ${shipment.toAddress?.state || 'N/A'}</td>
          <td>${shipment.weight || 0} kg</td>
          <td>${(shipment.status || 'pending').replace(/_/g, ' ').toUpperCase()}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This is a computer-generated manifest. No signature required.</p>
    <p>© ${now.getFullYear()} hobbiesspot.com - All rights reserved</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate bulk manifest for multiple shipments
 * POST /api/seller/shipments/bulk-manifest
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const db = getAdminDb();

    // Parse request body
    const body = await request.json();
    const { shipmentIds = [] } = body;

    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      throw new ValidationError('No shipment IDs provided');
    }

    // Get all shipments
    const shipments: any[] = [];
    for (const shipmentId of shipmentIds) {
      const shipmentSnap = await db.collection('shipments').doc(shipmentId).get();

      if (!shipmentSnap.exists) {
        continue;
      }

      const shipmentData = shipmentSnap.data()!;

      // Verify ownership (unless admin)
      if (seller.role !== 'admin' && shipmentData.sellerId !== seller.uid) {
        continue;
      }

      shipments.push({
        id: shipmentSnap.id,
        ...shipmentData,
      });
    }

    if (shipments.length === 0) {
      throw new NotFoundError('No valid shipments found');
    }

    // Generate manifest HTML
    const manifestHtml = generateManifestHtml(shipments);

    return NextResponse.json({
      success: true,
      data: {
        manifestHtml,
        shipmentCount: shipments.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error generating manifest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate manifest' },
      { status: 500 }
    );
  }
}
