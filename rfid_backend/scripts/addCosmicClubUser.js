const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function ensureCosmicClub() {
  try {
    await db.testConnection();

    // Ensure Cosmic Club exists
    const existingClub = await db.queryOne('SELECT id FROM clubs WHERE club_code = ? OR club_name = ?', ['COSMIC', 'Cosmic Club']);
    let clubId = existingClub?.id;
    if (!clubId) {
      const result = await db.query('INSERT INTO clubs (club_name, club_code, description) VALUES (?, ?, ?)', [
        'Cosmic Club',
        'COSMIC',
        'Space and astronomy enthusiasts'
      ]);
      clubId = result.insertId;
      console.log(`Created club Cosmic Club (ID: ${clubId})`);
    } else {
      console.log('Cosmic Club already exists');
    }

    // Ensure user exists with admin role
    const existingUser = await db.queryOne('SELECT id, role FROM users WHERE username = ?', ['cosmic-club']);
    if (existingUser) {
      console.log(`User 'cosmic-club' already exists with role '${existingUser.role}'.`);
    } else {
      const password = 'cosmic123';
      const hash = await bcrypt.hash(password, 10);
      const insert = await db.query(
        'INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)',
        ['cosmic-club', hash, 'admin', 'Cosmic Club Admin', 'cosmic@club.local']
      );
      console.log(`Created user 'cosmic-club' (ID: ${insert.insertId}) with role 'admin'.`);
      console.log('Credentials -> username: cosmic-club, password: cosmic123');
    }
  } catch (err) {
    console.error('Error creating Cosmic Club user:', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

ensureCosmicClub();
