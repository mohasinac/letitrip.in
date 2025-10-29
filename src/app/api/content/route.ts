import { NextRequest, NextResponse } from 'next/server';
import { parseMarkdownFile } from '@/lib/utils/markdown';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('file');

  if (!filePath) {
    return NextResponse.json({ error: 'File path is required' }, { status: 400 });
  }

  try {
    const content = await parseMarkdownFile(filePath);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
