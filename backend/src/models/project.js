const { pool } = require('../config/database');

/**
 * Project model for handling database operations related to projects
 */
class Project {
  /**
   * Create a new project
   * @param {Object} project - Project data
   * @returns {Promise} - Created project
   */  static async create(project) {
    try {
      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();      try {
        // Insert project
        const [result] = await connection.query(
          `INSERT INTO projects 
          (name, client_id, start_date, end_date, estimated_hours, estimated_cost, budgeted_cost, actual_cost, description, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            project.name,
            project.client_id,
            project.start_date,
            project.end_date,
            project.estimated_hours,
            project.estimated_cost,
            project.budgeted_cost === null || project.budgeted_cost === undefined ? null : project.budgeted_cost,
            project.actual_cost || 0,
            project.description,
            project.status || 'pending'
          ]
        );

        const projectId = result.insertId;

        // If resources are provided, assign them to the project
        if (project.resources && Array.isArray(project.resources) && project.resources.length > 0) {
          for (const resource of project.resources) {
            await connection.query(
              'INSERT INTO project_resources (project_id, resource_id, assigned_hours) VALUES (?, ?, ?)',
              [projectId, resource.id, resource.assigned_hours || 0]
            );
          }
        }

        await connection.commit();
        connection.release();
        
        return this.findById(projectId);
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
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
      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Update project
        await connection.query(
          `UPDATE projects SET 
           name = ?, client_id = ?, start_date = ?, end_date = ?, 
           estimated_hours = ?, estimated_cost = ?, budgeted_cost = ?, 
           actual_cost = ?, description = ?, status = ? 
           WHERE id = ?`,
          [
            projectData.name,
            projectData.client_id,
            projectData.start_date,
            projectData.end_date,
            projectData.estimated_hours,
            projectData.estimated_cost,
            projectData.budgeted_cost === null || projectData.budgeted_cost === undefined ? null : projectData.budgeted_cost,
            projectData.actual_cost || 0,
            projectData.description,
            projectData.status || 'pending',
            id
          ]
        );

        // If resources are provided, update project resources
        if (projectData.resources && Array.isArray(projectData.resources)) {
          // First, remove existing resource assignments
          await connection.query('DELETE FROM project_resources WHERE project_id = ?', [id]);
          
          // Then, add new resource assignments
          for (const resource of projectData.resources) {
            await connection.query(
              'INSERT INTO project_resources (project_id, resource_id, assigned_hours) VALUES (?, ?, ?)',
              [id, resource.id, resource.assigned_hours || 0]
            );
          }
        }

        await connection.commit();
        connection.release();
        
        return this.findById(id);
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
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

  /**
   * Get resources assigned to a project
   * @param {number} id - Project ID
   * @returns {Promise} - List of resources assigned to the project
   */
  static async getProjectResources(id) {
    try {
      const [rows] = await pool.query(`
        SELECT r.*, pr.assigned_hours 
        FROM resources r
        JOIN project_resources pr ON r.id = pr.resource_id
        WHERE pr.project_id = ?
      `, [id]);
      return rows;
    } catch (error) {
      console.error(`Error fetching resources for project ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate project cost based on assigned resources
   * @param {number} id - Project ID
   * @returns {Promise} - Calculated cost
   */
  static async calculateProjectCost(id) {
    try {
      const [rows] = await pool.query(`
        SELECT SUM(r.hourly_rate * pr.assigned_hours) as calculated_cost 
        FROM resources r
        JOIN project_resources pr ON r.id = pr.resource_id
        WHERE pr.project_id = ?
      `, [id]);
      return rows[0].calculated_cost || 0;
    } catch (error) {
      console.error(`Error calculating cost for project ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update actual cost of a project
   * @param {number} id - Project ID
   * @param {number} cost - Actual cost
   * @returns {Promise} - Updated project
   */
  static async updateActualCost(id, cost) {
    try {
      await pool.query(
        'UPDATE projects SET actual_cost = ? WHERE id = ?',
        [cost, id]
      );
      return this.findById(id);
    } catch (error) {
      console.error(`Error updating actual cost for project ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Project;
