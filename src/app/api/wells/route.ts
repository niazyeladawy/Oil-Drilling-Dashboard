// /app/api/wells/route.ts
import { NextResponse } from 'next/server';
import db from '../db';
import type { Well } from '../../../types/well';

export async function GET() {
  const wells = db.prepare('SELECT * FROM wells').all() as Well[];
  return NextResponse.json(wells);
}
