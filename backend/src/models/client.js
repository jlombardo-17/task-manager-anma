const { pool } = require('../config/database');

/**
 * Client model for handling database operations related to clients
 */
class Client {
  /**
   * Create a new client
   * @param {Object} client - Client data
   * @returns {Promise} - Created client
   */
  static async create(client) {
    try {
      const [result] = await pool.query(
        'INSERT INTO clients (name, email, phone, address, notes) VALUES (?, ?, ?, ?, ?)',
        [client.name, client.email, client.phone, client.address, client.notes]
      );
      
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  /**
   * Get all clients
   * @returns {Promise} - List of all clients
   */
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM clients ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  /**
   * Get client by ID
   * @param {number} id - Client ID
   * @returns {Promise} - Client data
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update client
   * @param {number} id - Client ID
   * @param {Object} clientData - New client data
   * @returns {Promise} - Updated client
   */
  static async update(id, clientData) {
    try {
      await pool.query(
        'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, notes = ? WHERE id = ?',
        [clientData.name, clientData.email, clientData.phone, clientData.address, clientData.notes, id]
      );
      
      return this.findById(id);
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete client
   * @param {number} id - Client ID
   * @returns {Promise} - Result of deletion
   */
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Client;