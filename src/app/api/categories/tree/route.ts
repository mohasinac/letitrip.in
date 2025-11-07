import { NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';

// GET /api/categories/tree - Full category tree (public)
export async function GET() {
  try {
    const snapshot = await Collections.categories().limit(1000).get();
    const nodes = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
    const byId: Record<string, any> = {};
    nodes.forEach(n => { byId[n.id] = { ...n, children: [] }; });
    const roots: any[] = [];
    nodes.forEach(n => {
      if (n.parent_id) {
        const parent = byId[n.parent_id];
        if (parent) parent.children.push(byId[n.id]); else roots.push(byId[n.id]);
      } else {
        roots.push(byId[n.id]);
      }
    });
    return NextResponse.json({ success: true, data: roots });
  } catch (error) {
    console.error('Error building category tree:', error);
    return NextResponse.json({ success: false, error: 'Failed to load category tree' }, { status: 500 });
  }
}
