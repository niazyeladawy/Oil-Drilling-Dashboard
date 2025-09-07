const Database = require('better-sqlite3');
const db = new Database('wells.db'); // Make sure this is the correct DB file

// Optional: check existing tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
console.log('Tables in DB:', tables);

// Delete all rows in wells table
db.prepare('DELETE FROM wells').run();

console.log('All well data cleared!');