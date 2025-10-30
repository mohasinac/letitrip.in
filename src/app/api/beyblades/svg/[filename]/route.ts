import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: Serve Beyblade SVG images
 * GET /api/beyblades/svg/[filename]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    // Ensure it's an SVG file
    if (!filename.endsWith('.svg')) {
      return new NextResponse('Only SVG files are allowed', { status: 400 });
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), 'src', 'assets', 'svg', 'beyblades', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the SVG file
    const svgContent = fs.readFileSync(filePath, 'utf8');

    // Return the SVG with proper headers
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error serving SVG:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
