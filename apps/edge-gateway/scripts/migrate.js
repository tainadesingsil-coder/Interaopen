const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { runMigrations: applyMigrations } = require('../src/migrations');

const DB_PATH =
  process.env.DB_PATH ||
  path.join(__dirname, '..', 'data', 'edge-gateway.sqlite');
const MIGRATION_DIR = path.join(__dirname, '..', 'db', 'migrations');

function migrate() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const appliedNow = applyMigrations(db, MIGRATION_DIR);
  if (appliedNow.length === 0) {
    console.log('Nenhuma migration nova para aplicar.');
  } else {
    for (const file of appliedNow) {
      console.log(`Migration aplicada: ${file}`);
    }
  }

  db.close();
  console.log(`Banco pronto em: ${DB_PATH}`);
}

migrate();
