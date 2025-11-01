import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import * as XLSX from "xlsx";

const adminDb = getAdminDb();

// POST /api/admin/bulk/export - Export data to CSV/Excel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entity, filters, fields, format = "csv" } = body;

    if (!entity) {
      return NextResponse.json(
        { success: false, error: "Entity is required" },
        { status: 400 }
      );
    }

    // Get collection name
    const collectionName = getCollectionName(entity);

    // Build query
    let query = adminDb.collection(collectionName);

    // Apply filters if provided
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== "") {
          query = query.where(key, "==", value) as any;
        }
      }
    }

    // Fetch data
    const snapshot = await query.get();
    const data: any[] = [];

    snapshot.forEach((doc: any) => {
      const docData = doc.data();
      // Filter fields if specified
      if (fields && fields.length > 0) {
        const filteredData: any = { id: doc.id };
        fields.forEach((field: string) => {
          if (docData[field] !== undefined) {
            filteredData[field] = docData[field];
          }
        });
        data.push(filteredData);
      } else {
        data.push({ id: doc.id, ...docData });
      }
    });

    // Generate file based on format
    let fileContent: string | Buffer;
    let mimeType: string;
    let fileName: string;

    if (format === "excel") {
      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, entity);

      // Generate buffer
      fileContent = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      mimeType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileName = `${entity}_export_${Date.now()}.xlsx`;
    } else {
      // CSV format
      const worksheet = XLSX.utils.json_to_sheet(data);
      fileContent = XLSX.utils.sheet_to_csv(worksheet);
      mimeType = "text/csv";
      fileName = `${entity}_export_${Date.now()}.csv`;
    }

    // Return file as response
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export data" },
      { status: 500 }
    );
  }
}

// Helper: Get collection name
function getCollectionName(entity: string): string {
  const collectionMap: { [key: string]: string } = {
    products: "products",
    inventory: "inventory_items",
    categories: "categories",
    orders: "orders",
    users: "users",
  };
  return collectionMap[entity] || entity;
}
