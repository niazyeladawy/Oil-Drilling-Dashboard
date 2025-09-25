
// type WellRow = {
//   DEPTH: number | string;
//   "%SH": number | string;
//   "%SS": number | string;
//   "%LS": number | string;
//   "%DOL": number | string;
//   "%ANH": number | string;
//   "%Coal": number | string;
//   "%Salt": number | string;
//   DT: number | string;
//   GR: number | string;
// };
// import { NextResponse } from 'next/server';
// import * as XLSX from 'xlsx';
// import Database from 'better-sqlite3';
// import path from 'path';

// export const runtime = 'nodejs';

// // Open DB in project root
// const dbPath = path.join(process.cwd(), 'wells.db');
// const db = new Database(dbPath);

// // Create table if not exists
// db.prepare(`
//   CREATE TABLE IF NOT EXISTS wells (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT,
//     data TEXT
//   )
// `).run();

// const expectedColumns = ["DEPTH","%SH","%SS","%LS","%DOL","%ANH","%Coal","%Salt","DT","GR"];

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file') as File | null;

//     if (!file) {
//       return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
//     }

//     const arrayBuffer = await file.arrayBuffer();
//     const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

//     if (workbook.SheetNames.length === 0) {
//       return NextResponse.json({ success: false, message: 'Excel file has no sheets' }, { status: 400 });
//     }

//     const insert = db.prepare(`INSERT INTO wells (name, data) VALUES (?, ?)`);
//     const results: { sheet: string; inserted: boolean; reason?: string }[] = [];

//     for (const sheetName of workbook.SheetNames) {
//       const sheet = workbook.Sheets[sheetName];
//       const rows: WellRow[] = XLSX.utils.sheet_to_json(sheet);

//       if (rows.length === 0) {
//         results.push({ sheet: sheetName, inserted: false, reason: 'Empty sheet' });
//         continue;
//       }

//       const invalidRows = rows.filter(row => !expectedColumns.every(col => col in row));
//       if (invalidRows.length > 0) {
//         results.push({ sheet: sheetName, inserted: false, reason: 'Schema mismatch' });
//         continue;
//       }

//       insert.run(sheetName, JSON.stringify(rows));
//       results.push({ sheet: sheetName, inserted: true });
//     }

//     return NextResponse.json({ success: true, message: 'Excel processed', details: results });
//   } catch (err) {
//     console.error('Upload Error:', err);
//     const message = err instanceof Error ? err.message : 'Server error';
//     return NextResponse.json({ success: false, message }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export const runtime = 'nodejs';

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: '/tmp/wells.db', // only writable path on Vercel
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

type WellRow = {
  DEPTH: number | string;
  "%SH": number | string;
  "%SS": number | string;
  "%LS": number | string;
  "%DOL": number | string;
  "%ANH": number | string;
  "%Coal": number | string;
  "%Salt": number | string;
  DT: number | string;
  GR: number | string;
};

const expectedColumns = ["DEPTH","%SH","%SS","%LS","%DOL","%ANH","%Coal","%Salt","DT","GR"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    if (workbook.SheetNames.length === 0) {
      return NextResponse.json({ success: false, message: 'Excel file has no sheets' }, { status: 400 });
    }

    const db = await getDb();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS wells (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        data TEXT
      )
    `);

    const insert = await db.prepare('INSERT INTO wells (name, data) VALUES (?, ?)');
    const results: { sheet: string; inserted: boolean; reason?: string }[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: WellRow[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        results.push({ sheet: sheetName, inserted: false, reason: 'Empty sheet' });
        continue;
      }

      const invalidRows = rows.filter(row => !expectedColumns.every(col => col in row));
      if (invalidRows.length > 0) {
        results.push({ sheet: sheetName, inserted: false, reason: 'Schema mismatch' });
        continue;
      }

      await insert.run(sheetName, JSON.stringify(rows));
      results.push({ sheet: sheetName, inserted: true });
    }

    await insert.finalize();

    return NextResponse.json({ success: true, message: 'Excel processed', details: results });

  } catch (err) {
    console.error('Upload Error:', err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
