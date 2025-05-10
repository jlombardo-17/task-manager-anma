// Script to create a new user in the database
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUser() {
  try {
    // Create user data
    const username = 'testuser';
    const email = 'test@example.com';
    const password = 'test123';
    const role = 'admin';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      console.log(`User with email ${email} already exists, skipping creation`);
    } else {
      // Insert user into database
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role]
      );
      
      console.log(`User created with ID: ${result.insertId}`);
    }
    
    // Print all users in the database
    const [users] = await pool.query('SELECT id, username, email, role FROM users');
    console.log('All users in database:');
    console.table(users);
    
    // Close the database connection
    await pool.end();
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

// Create a new test user
createUser();
