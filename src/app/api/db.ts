// /app/api/db.ts
import Database from 'better-sqlite3';

const db = new Database('wells.db'); // use same file for all APIs

// ensure table exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS wells (
    DEPTH REAL,
    "%SH" REAL,
    "%SS" REAL,
    "%LS" REAL,
    "%DOL" REAL,
    "%ANH" REAL,
    "%Coal" REAL,
    "%Salt" REAL,
    DT REAL,
    GR REAL
  )
`).run();

export default db;
