const { pool } = require('../config/database');

/**
 * Resource model for handling database operations related to resources (people)
 */
class Resource {
  /**
   * Create a new resource
   * @param {Object} resource - Resource data
   * @returns {Promise} - Created resource
   */
  static async create(resource) {
    try {
      const [result] = await pool.query(
        'INSERT INTO resources (name, role, hourly_rate, email, phone, availability) VALUES (?, ?, ?, ?, ?, ?)',
        [
          resource.name,
          resource.role,
          resource.hourly_rate,
          resource.email,
          resource.phone,
          resource.availability || 100  // Default to 100% availability
        ]
      );
      
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  /**
   * Get all resources
   * @returns {Promise} - List of all resources
   */
  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM resources ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  /**
   * Get resource by ID
   * @param {number} id - Resource ID
   * @returns {Promise} - Resource data
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM resources WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error fetching resource with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update resource
   * @param {number} id - Resource ID
   * @param {Object} resourceData - New resource data
   * @returns {Promise} - Updated resource
   */
  static async update(id, resourceData) {
    try {
      await pool.query(
        'UPDATE resources SET name = ?, role = ?, hourly_rate = ?, email = ?, phone = ?, availability = ? WHERE id = ?',
        [
          resourceData.name,
          resourceData.role,
          resourceData.hourly_rate,
          resourceData.email,
          resourceData.phone,
          resourceData.availability,
          id
        ]
      );
      
      return this.findById(id);
    } catch (error) {
      console.error(`Error updating resource with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete resource
   * @param {number} id - Resource ID
   * @returns {Promise} - Result of deletion
   */
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM resources WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting resource with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get resources assigned to a task
   * @param {number} taskId - Task ID
   * @returns {Promise} - List of resources assigned to the task
   */
  static async findByTaskId(taskId) {
    try {
      const [rows] = await pool.query(`
        SELECT r.* 
        FROM resources r
        JOIN task_resources tr ON r.id = tr.resource_id
        WHERE tr.task_id = ?
      `, [taskId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching resources for task ID ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get resources by role
   * @param {string} role - Role name
   * @returns {Promise} - List of resources with the specified role
   */
  static async findByRole(role) {
    try {
      const [rows] = await pool.query('SELECT * FROM resources WHERE role = ?', [role]);
      return rows;
    } catch (error) {
      console.error(`Error fetching resources with role ${role}:`, error);
      throw error;
    }
  }
}

module.exports = Resource;
