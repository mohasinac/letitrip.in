/**
 * Admin Bulk Export API
 * POST /api/admin/bulk/export - Export data to CSV/Excel
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../_lib/auth/admin-auth';
import { AuthorizationError, ValidationError } from '../../../_lib/middleware/error-handler';
import * as XLSX from 'xlsx';

/**
 * Verify admin authentication
 */


  

/**
 * POST /api/admin/bulk/export
 * Export collection data to CSV or Excel
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const body = await request.json();
    const { entity, filters, fields, format = 'csv' } = body;

    if (!entity) {
      throw new ValidationError('Entity is required');
    }

    if (!['csv', 'excel'].includes(format)) {
      throw new ValidationError('Format must be csv or excel');
    }

    const db = getAdminDb();

    // Get collection name
    const collectionName = getCollectionName(entity);

    // Build query
    let query: any = db.collection(collectionName);

    // Apply filters if provided
    if (filters && typeof filters === 'object') {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.where(key, '==', value);
        }
      }
    }

    // Fetch data
    const snapshot = await query.get();
    const data: any[] = [];

    snapshot.forEach((doc: any) => {
      const docData = doc.data();
      
      // Filter fields if specified
      if (fields && Array.isArray(fields) && fields.length > 0) {
        const filteredData: any = { id: doc.id };
        fields.forEach((field: string) => {
          if (docData[field] !== undefined) {
            // Convert dates to ISO strings
            if (docData[field]?.toDate) {
              filteredData[field] = docData[field].toDate().toISOString();
            } else {
              filteredData[field] = docData[field];
            }
          }
        });
        data.push(filteredData);
      } else {
        // Include all fields
        const allData: any = { id: doc.id };
        Object.keys(docData).forEach(key => {
          if (docData[key]?.toDate) {
            allData[key] = docData[key].toDate().toISOString();
          } else {
            allData[key] = docData[key];
          }
        });
        data.push(allData);
      }
    });

    if (data.length === 0) {
      throw new ValidationError('No data found to export');
    }

    // Generate file based on format
    let fileContent: string | Buffer;
    let mimeType: string;
    let fileName: string;

    if (format === 'excel') {
      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, entity);

      // Generate buffer
      fileContent = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName = `${entity}_export_${Date.now()}.xlsx`;
    } else {
      // CSV format
      const worksheet = XLSX.utils.json_to_sheet(data);
      fileContent = XLSX.utils.sheet_to_csv(worksheet);
      mimeType = 'text/csv';
      fileName = `${entity}_export_${Date.now()}.csv`;
    }

    // Return file as response
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/bulk/export:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get collection name from entity type
 */
function getCollectionName(entity: string): string {
  const collectionMap: { [key: string]: string } = {
    products: 'products',
    inventory: 'inventory_items',
    categories: 'categories',
    orders: 'orders',
    users: 'users',
    reviews: 'reviews',
    shipments: 'shipments',
    sales: 'sales',
    coupons: 'coupons',
  };
  return collectionMap[entity] || entity;
}
