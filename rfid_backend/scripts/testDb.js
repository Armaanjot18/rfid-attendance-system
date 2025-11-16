#!/usr/bin/env node
// Quick DB diagnostics
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const { DB_HOST='localhost', DB_PORT=3306, DB_USER='root', DB_PASSWORD='', DB_NAME='access_control_portal' } = process.env;
  try {
    const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD });
    const [rows] = await conn.query('SHOW DATABASES');
    console.log('Databases:', rows.map(r => r.Database).join(', '));
    await conn.changeUser({ database: DB_NAME });
    const [tables] = await conn.query('SHOW TABLES');
    console.log(`Tables in ${DB_NAME}:`, tables.map(t => Object.values(t)[0]).join(', '));
    const [usersCount] = await conn.query('SELECT COUNT(*) AS c FROM users');
    console.log('Users count:', usersCount[0].c);
    await conn.end();
    console.log('✅ DB diagnostic completed');
  } catch (e) {
    console.error('❌ DB diagnostic error');
    console.error('   Code:', e.code);
    console.error('   Message:', e.message || '<no message>');
    if (e.stack) console.error('   Stack:', e.stack.split('\n').slice(0,4).join('\n'));
    process.exit(1);
  }
})();
