const { pool } = require('../config/database');

/**
 * Task model for handling database operations related to tasks
 */
class Task {
  /**
   * Create a new task
   * @param {Object} task - Task data
   * @returns {Promise} - Created task
   */  static async create(task) {
    try {
      // Debug log to help identify issues with incoming data
      console.log('Creating task with data:', {
        project_id: task.project_id,
        title: task.title,
        start_date: task.start_date,
        end_date: task.end_date,
        estimated_hours: task.estimated_hours,
        hours_spent: task.hours_spent,
        resources: task.resources
      });
      
      // Begin transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Insert task
        const [result] = await connection.query(
          `INSERT INTO tasks 
          (project_id, title, description, start_date, end_date, estimated_hours, 
           hours_spent, priority, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            task.project_id,
            task.title,
            task.description,
            task.start_date,
            task.end_date,
            task.estimated_hours,
            task.hours_spent || 0, // Default to 0 hours spent
            task.priority || 'medium', // Default to medium priority
            task.status || 'pending' // Default to pending status
          ]
        );
        
        const taskId = result.insertId;
          // Assign resources if provided
        if (task.resources && task.resources.length > 0) {
          try {
            console.log('Assigning resources:', task.resources);
            const values = task.resources.map(resourceId => [taskId, resourceId, 0]); // Adding default assigned_hours
            
            await connection.query(
              'INSERT INTO task_resources (task_id, resource_id, assigned_hours) VALUES ?',
              [values]
            );
          } catch (resourceError) {
            console.error('Error assigning resources to task:', resourceError);
            throw new Error(`Failed to assign resources: ${resourceError.message}`);
          }
        }
        
        await connection.commit();
        connection.release();
        
        return this.findById(taskId);
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get all tasks
   * @returns {Promise} - List of all tasks
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        ORDER BY t.start_date
      `);
      return rows;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get tasks by project ID
   * @param {number} projectId - Project ID
   * @returns {Promise} - List of tasks for the project
   */
  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY start_date',
        [projectId]
      );
      return rows;
    } catch (error) {
      console.error(`Error fetching tasks for project ID ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get task by ID
   * @param {number} id - Task ID
   * @returns {Promise} - Task data
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.id = ?
      `, [id]);
      
      if (!rows[0]) return null;
      
      // Get assigned resources
      const task = rows[0];
      task.resources = await this.getTaskResources(id);
      
      return task;
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get resources assigned to a task
   * @param {number} taskId - Task ID
   * @returns {Promise} - List of resources assigned to the task
   */
  static async getTaskResources(taskId) {
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
      return [];
    }
  }

  /**
   * Update task
   * @param {number} id - Task ID
   * @param {Object} taskData - New task data
   * @returns {Promise} - Updated task
   */
  static async update(id, taskData) {
    try {
      // Begin transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Update task details
        await connection.query(
          `UPDATE tasks SET 
           project_id = ?, title = ?, description = ?, start_date = ?, 
           end_date = ?, estimated_hours = ?, hours_spent = ?, priority = ?, status = ? 
           WHERE id = ?`,
          [
            taskData.project_id,
            taskData.title,
            taskData.description,
            taskData.start_date,
            taskData.end_date,
            taskData.estimated_hours,
            taskData.hours_spent,
            taskData.priority,
            taskData.status,
            id
          ]
        );
        
        // Update resources if provided
        if (taskData.resources) {
          // Remove existing resource assignments
          await connection.query('DELETE FROM task_resources WHERE task_id = ?', [id]);
          
          // Add new resource assignments
          if (taskData.resources.length > 0) {
            const values = taskData.resources.map(resourceId => [id, resourceId]);
            
            await connection.query(
              'INSERT INTO task_resources (task_id, resource_id) VALUES ?',
              [values]
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
      console.error(`Error updating task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete task
   * @param {number} id - Task ID
   * @returns {Promise} - Result of deletion
   */
  static async delete(id) {
    try {
      // Begin transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Delete resource assignments
        await connection.query('DELETE FROM task_resources WHERE task_id = ?', [id]);
        
        // Delete task
        const [result] = await connection.query('DELETE FROM tasks WHERE id = ?', [id]);
        
        await connection.commit();
        connection.release();
        
        return result.affectedRows > 0;
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get tasks by resource ID
   * @param {number} resourceId - Resource ID
   * @returns {Promise} - List of tasks assigned to the resource
   */
  static async findByResourceId(resourceId) {
    try {
      const [rows] = await pool.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        JOIN task_resources tr ON t.id = tr.task_id
        WHERE tr.resource_id = ?
        ORDER BY t.start_date
      `, [resourceId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching tasks for resource ID ${resourceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get tasks by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise} - List of tasks in the date range
   */
  static async findByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.query(`
        SELECT t.*, p.name as project_name 
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE (t.start_date BETWEEN ? AND ?) OR 
              (t.end_date BETWEEN ? AND ?) OR
              (t.start_date <= ? AND t.end_date >= ?)
        ORDER BY t.start_date
      `, [startDate, endDate, startDate, endDate, startDate, endDate]);
      return rows;
    } catch (error) {
      console.error(`Error fetching tasks between ${startDate} and ${endDate}:`, error);
      throw error;
    }
  }
}

module.exports = Task;
