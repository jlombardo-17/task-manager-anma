// Script to check if a user exists in the database
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkUser(email) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log(`User with email ${email} does not exist in the database`);
      return;
    }
    
    const user = rows[0];
    console.log('User found:');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password Hash:', user.password);
    
    // Check if the password matches admin123
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log(`Password 'admin123' matches: ${isMatch}`);
    
    // Generate a new hash for admin123 to see if the hashing is consistent
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    console.log('New hash for admin123:', hashedPassword);
    
    // Compare with known hash from SQL file
    const knownHash = '$2a$10$BLMZFAnCPXX0cVRmdPP3Meu3NR/xDVGZ.YT8xzrxxfLkKiTjRZyia';
    const knownHashMatches = await bcrypt.compare('admin123', knownHash);
    console.log(`Known hash matches with 'admin123': ${knownHashMatches}`);
    
    // Close the database connection
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Check for admin@example.com
checkUser('admin@example.com');
