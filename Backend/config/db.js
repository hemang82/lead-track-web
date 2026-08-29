const Database = require('better-sqlite3');
const path = require('path');

const defaultDbPath = path.join(__dirname, '..', 'leads.db');
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '..', process.env.DB_PATH) 
  : defaultDbPath;
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

module.exports = db;