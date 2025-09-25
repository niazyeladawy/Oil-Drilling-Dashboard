// // /app/api/wells/route.ts
// import { NextResponse } from 'next/server';
// import db from '../db';
// import type { Well } from '../../../types/well';

// export async function GET() {
//   const wells = db.prepare('SELECT * FROM wells').all() as Well[];
//   return NextResponse.json(wells);
// }
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export const runtime = "nodejs";

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: "/tmp/wells.db", // same DB used by upload
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

export async function GET() {
  try {
    const db = await getDb();
    const wells = await db.all("SELECT * FROM wells");
    return NextResponse.json(wells);
  } catch (err) {
    console.error("GET /api/wells Error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
