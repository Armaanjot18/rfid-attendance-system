#!/usr/bin/env node
/**
 * Automated MySQL database initialization: schema + seed
 * Usage: npm run initdb
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const SCHEMA_FILE = path.join(__dirname, '..', 'database', 'schema.sql');
const SEED_FILE = path.join(__dirname, '..', 'database', 'seed.sql');

async function readSqlFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Remove line comments that start with --
  const cleaned = raw
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
  // Split on semicolons that terminate a statement
  // Keep simple: statements end with ; followed by newline.
  const statements = cleaned
    .split(/;\s*(\n|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return statements;
}

async function runStatements(connection, statements, label) {
  const errors = [];
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    try {
      await connection.query(sql);
      if (i % 10 === 0) {
        process.stdout.write(`\n[${label}] Executed ${i + 1}/${statements.length}`);
      }
    } catch (err) {
      errors.push({ index: i + 1, message: err.message, sql: sql.substring(0, 200) });
      console.error(`\n[${label} ERROR] (#${i + 1}) ${err.message}`);
      console.error(`SQL: ${sql.substring(0, 300)}${sql.length > 300 ? '...' : ''}`);
      // Stop for schema errors (likely structural). For seed we can continue.
      if (label === 'SCHEMA') {
        throw err;
      }
    }
  }
  process.stdout.write(`\n[${label}] Completed ${statements.length} statements. Errors: ${errors.length}\n`);
  return errors;
}

async function main() {
  const { DB_HOST='localhost', DB_PORT=3306, DB_USER='root', DB_PASSWORD='', DB_NAME='access_control_portal' } = process.env;

  console.log('🔧 Starting database initialization');
  console.log(`Host: ${DB_HOST}  Port: ${DB_PORT}`);

  let rootConn;
  try {
    rootConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });
  } catch (connErr) {
    console.error('❌ Could not connect to MySQL (root phase).');
    console.error('   Code:', connErr.code);
    console.error('   Message:', connErr.message || '<no message>');
    console.error('   Stack:', connErr.stack?.split('\n').slice(0,4).join('\n'));
    process.exit(1);
  }

  try {
    const schemaStatements = await readSqlFile(SCHEMA_FILE);
    console.log(`📄 Running schema file (${schemaStatements.length} statements)`);
    await runStatements(rootConn, schemaStatements, 'SCHEMA');
  } catch (err) {
    console.error('\n❌ Schema phase failed. Aborting initialization.');
    await rootConn.end();
    process.exit(1);
  } finally {
    await rootConn.end();
  }

  // Second connection with database selected for seed
  let dbConn;
  try {
    dbConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true
    });
  } catch (connErr2) {
    console.error('❌ Could not connect to MySQL (seed phase).');
    console.error('   Code:', connErr2.code);
    console.error('   Message:', connErr2.message || '<no message>');
    console.error('   Stack:', connErr2.stack?.split('\n').slice(0,4).join('\n'));
    process.exit(1);
  }

  let seedErrors = [];
  try {
    const seedStatements = await readSqlFile(SEED_FILE);
    console.log(`📄 Running seed file (${seedStatements.length} statements)`);
    seedErrors = await runStatements(dbConn, seedStatements, 'SEED');
  } finally {
    await dbConn.end();
  }

  if (seedErrors.length) {
    console.warn(`\n⚠️  Seed completed with ${seedErrors.length} errors. Review above logs.`);
  }

  console.log('\n✅ Database initialization complete');
}

main().catch(err => {
  console.error('\n❌ Initialization failed:', err.message);
  process.exit(1);
});
