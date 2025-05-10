const { pool } = require('../config/database');

/**
 * Project model for handling database operations related to projects
 */
class Project {
  /**
   * Create a new project
   * @param {Object} project - Project data
   * @returns {Promise} - Created project
   */
  static async create(project) {
    try {
      const [result] = await pool.query(
        `INSERT INTO projects 
        (name, client_id, start_date, end_date, estimated_hours, total_cost, description, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.name,
          project.client_id,
          project.start_date,
          project.end_date,
          project.estimated_hours,
          project.total_cost,
          project.description,
          project.status || 'pending'
        ]
      );
      
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get all projects
   * @returns {Promise} - List of all projects
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.name as client_name 
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        ORDER BY p.start_date
      `);
      return rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get projects by client ID
   * @param {number} clientId - Client ID
   * @returns {Promise} - List of projects for the client
   */
  static async findByClientId(clientId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM projects WHERE client_id = ? ORDER BY start_date',
        [clientId]
      );
      return rows;
    } catch (error) {
      console.error(`Error fetching projects for client ID ${clientId}:`, error);
      throw error;
    }
  }

  /**
   * Get project by ID
   * @param {number} id - Project ID
   * @returns {Promise} - Project data
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.name as client_name 
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        WHERE p.id = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update project
   * @param {number} id - Project ID
   * @param {Object} projectData - New project data
   * @returns {Promise} - Updated project
   */
  static async update(id, projectData) {
    try {
      await pool.query(
        `UPDATE projects SET 
         name = ?, client_id = ?, start_date = ?, end_date = ?, 
         estimated_hours = ?, total_cost = ?, description = ?, status = ? 
         WHERE id = ?`,
        [
          projectData.name,
          projectData.client_id,
          projectData.start_date,
          projectData.end_date,
          projectData.estimated_hours,
          projectData.total_cost,
          projectData.description,
          projectData.status,
          id
        ]
      );
      
      return this.findById(id);
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete project
   * @param {number} id - Project ID
   * @returns {Promise} - Result of deletion
   */
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate actual hours spent on a project
   * @param {number} id - Project ID
   * @returns {Promise} - Total hours spent
   */
  static async calculateActualHours(id) {
    try {
      const [rows] = await pool.query(
        'SELECT SUM(hours_spent) as total_hours FROM tasks WHERE project_id = ?',
        [id]
      );
      return rows[0].total_hours || 0;
    } catch (error) {
      console.error(`Error calculating hours for project ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Project;
