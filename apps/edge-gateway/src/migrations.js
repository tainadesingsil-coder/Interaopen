const fs = require('fs');
const path = require('path');

function nowIso() {
  return new Date().toISOString();
}

function ensureSchemaMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);
}

function runMigrations(db, migrationDir) {
  ensureSchemaMigrations(db);

  if (!fs.existsSync(migrationDir)) {
    return [];
  }

  const files = fs
    .readdirSync(migrationDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const getAppliedStmt = db.prepare(
    `
    SELECT name
    FROM schema_migrations
`
  );
  const applied = new Set(getAppliedStmt.all().map((row) => row.name));

  const insertAppliedStmt = db.prepare(
    `
    INSERT INTO schema_migrations (name, applied_at)
    VALUES (?, ?)
`
  );
  const applyMigration = db.transaction((file, sql) => {
    db.exec(sql);
    insertAppliedStmt.run(file, nowIso());
  });

  const appliedNow = [];
  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    applyMigration(file, sql);
    appliedNow.push(file);
  }
  return appliedNow;
}

module.exports = {
  runMigrations,
};
