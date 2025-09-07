import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Database from 'better-sqlite3';

export const runtime = 'nodejs';

// Open or create SQLite DB
const db = new Database('wells.db');

// Drop old table if exists (optional)
db.prepare(`DROP TABLE IF EXISTS wells`).run();

// Create table: one well per row, data stored as JSON
db.prepare(`
  CREATE TABLE IF NOT EXISTS wells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    data TEXT
  )
`).run();

// Define expected schema
const expectedColumns = ["DEPTH","%SH","%SS","%LS","%DOL","%ANH","%Coal","%Salt","DT","GR"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });

    if (workbook.SheetNames.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Excel file has no sheets' },
        { status: 400 }
      );
    }

    const insert = db.prepare(`INSERT INTO wells (name, data) VALUES (?, ?)`);
    const result: { sheet: string; inserted: boolean; reason?: string }[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        result.push({ sheet: sheetName, inserted: false, reason: 'Empty sheet' });
        continue;
      }

      // Check schema
      const invalidRows = rows.filter(row => 
        !expectedColumns.every(col => col in row)
      );

      if (invalidRows.length > 0) {
        result.push({ sheet: sheetName, inserted: false, reason: 'Schema mismatch' });
        continue;
      }

      // Insert valid sheet
      insert.run(sheetName, JSON.stringify(rows));
      result.push({ sheet: sheetName, inserted: true });
    }

    return NextResponse.json({
      success: true,
      message: 'Excel processed',
      details: result,
    });

  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
