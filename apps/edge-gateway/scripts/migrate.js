const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH =
  process.env.DB_PATH ||
  path.join(__dirname, '..', 'data', 'edge-gateway.sqlite');
const MIGRATION_DIR = path.join(__dirname, '..', 'db', 'migrations');

function runMigrations() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const files = fs
    .readdirSync(MIGRATION_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATION_DIR, file), 'utf8');
    db.exec(sql);
    console.log(`Migration aplicada: ${file}`);
  }

  db.close();
  console.log(`Banco pronto em: ${DB_PATH}`);
}

runMigrations();
