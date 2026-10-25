
const Database = require("better-sqlite3");

const db = new Database("lab.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password)
  VALUES (?, ?)
`);

insertUser.run("admin", "LabAdmin123!");
insertUser.run("Pal", "PalTest@123");

module.exports = db;
