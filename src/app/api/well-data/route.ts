// /app/api/well-data/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

export const runtime = 'nodejs';

// Open SQLite DB
const db = new Database('wells.db');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing well id' }, { status: 400 });
    }

    const row = db
      .prepare('SELECT * FROM wells WHERE id = ?')
      .get(Number(id));

    if (!row) {
      return NextResponse.json({ success: false, message: 'Well not found' }, { status: 404 });
    }

    // Return the stored JSON data
    return NextResponse.json({
      success: true,
      data: row.data, // this is the JSON string we stored
    });
  } catch (err: any) {
    console.error('Well Data Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
