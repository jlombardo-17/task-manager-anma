const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User model for handling database operations related to users
 */
class User {
  /**
   * Create a new user
   * @param {Object} user - User data
   * @returns {Promise} - Created user (without password)
   */
  static async create(user) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [user.username, user.email, hashedPassword, user.role || 'user']
      );
      
      const newUser = await this.findById(result.insertId);
      delete newUser.password;
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise} - User data
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise} - User data
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise} - User data
   */
  static async findByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching user with username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - New user data
   * @returns {Promise} - Updated user (without password)
   */
  static async update(id, userData) {
    try {
      const updateFields = [];
      const queryParams = [];
      
      // Build dynamic update query based on provided fields
      if (userData.username) {
        updateFields.push('username = ?');
        queryParams.push(userData.username);
      }
      
      if (userData.email) {
        updateFields.push('email = ?');
        queryParams.push(userData.email);
      }
      
      if (userData.password) {
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updateFields.push('password = ?');
        queryParams.push(hashedPassword);
      }
      
      if (userData.role) {
        updateFields.push('role = ?');
        queryParams.push(userData.role);
      }
      
      // Add the id as the last parameter
      queryParams.push(id);
      
      // If no fields to update, return the current user
      if (updateFields.length === 0) {
        return this.findById(id);
      }
      
      // Update user in database
      await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );
      
      // Return updated user without password
      const updatedUser = await this.findById(id);
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise} - Result of deletion
   */
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password to check
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise} - Boolean indicating if passwords match
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
}

module.exports = User;
