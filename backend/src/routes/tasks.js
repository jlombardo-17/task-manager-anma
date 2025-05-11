const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error(`Error fetching task with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/tasks/project/:projectId
 * @desc    Get tasks by project ID
 * @access  Private
 */
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.findByProjectId(req.params.projectId);
    res.json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for project ID ${req.params.projectId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/tasks/resource/:resourceId
 * @desc    Get tasks by resource ID
 * @access  Private
 */
router.get('/resource/:resourceId', auth, async (req, res) => {
  try {
    const tasks = await Task.findByResourceId(req.params.resourceId);
    res.json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for resource ID ${req.params.resourceId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/tasks/dates/:startDate/:endDate
 * @desc    Get tasks by date range
 * @access  Private
 */
router.get('/dates/:startDate/:endDate', auth, async (req, res) => {
  try {
    const tasks = await Task.findByDateRange(
      req.params.startDate,
      req.params.endDate
    );
    res.json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks between ${req.params.startDate} and ${req.params.endDate}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('project_id').isInt().withMessage('Valid project ID is required'),
    body('title').not().isEmpty().withMessage('Title is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('estimated_hours').isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
    body('resources').optional().isArray().withMessage('Resources must be an array')
  ],  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed. Please check your inputs.',
        errors: errors.array() 
      });
    }

    try {
      // Process the task data
      const taskData = { ...req.body };
      
      // Format dates properly
      if (taskData.start_date) {
        try {
          taskData.start_date = new Date(taskData.start_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ 
            message: 'Invalid start date format',
            errors: [{ param: 'start_date', msg: 'Invalid date format' }] 
          });
        }
      }
      
      if (taskData.end_date) {
        try {
          taskData.end_date = new Date(taskData.end_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ 
            message: 'Invalid end date format',
            errors: [{ param: 'end_date', msg: 'Invalid date format' }] 
          });
        }
      }
      
      // Validate that end date is after start date
      if (new Date(taskData.end_date) <= new Date(taskData.start_date)) {
        return res.status(400).json({
          message: 'End date must be after start date',
          errors: [{ param: 'end_date', msg: 'End date must be after start date' }]
        });
      }

      const newTask = await Task.create(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      
      // More specific error messages based on error types
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        return res.status(400).json({ 
          message: 'Missing required field in task data',
          details: error.sqlMessage
        });
      } else if (error.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ 
          message: 'Field cannot be null',
          details: error.sqlMessage
        });
      } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          message: 'The referenced project or resource does not exist',
          details: error.sqlMessage
        });
      } else if (error.code && error.code.startsWith('ER_')) {
        return res.status(400).json({ 
          message: 'Database error',
          details: error.sqlMessage
        });
      }
      
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  }
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [
    body('project_id').isInt().withMessage('Valid project ID is required'),
    body('title').not().isEmpty().withMessage('Title is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('estimated_hours').isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
    body('hours_spent').isFloat({ min: 0 }).withMessage('Hours spent must be a positive number'),
    body('resources').optional().isArray().withMessage('Resources must be an array')
  ],  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors during update:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed. Please check your inputs.',
        errors: errors.array() 
      });
    }

    try {
      const task = await Task.findById(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Process the task data
      const taskData = { ...req.body };
      
      // Format dates properly
      if (taskData.start_date) {
        try {
          taskData.start_date = new Date(taskData.start_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ 
            message: 'Invalid start date format',
            errors: [{ param: 'start_date', msg: 'Invalid date format' }] 
          });
        }
      }
      
      if (taskData.end_date) {
        try {
          taskData.end_date = new Date(taskData.end_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ 
            message: 'Invalid end date format',
            errors: [{ param: 'end_date', msg: 'Invalid date format' }] 
          });
        }
      }
      
      // Validate that end date is after start date
      if (new Date(taskData.end_date) <= new Date(taskData.start_date)) {
        return res.status(400).json({
          message: 'End date must be after start date',
          errors: [{ param: 'end_date', msg: 'End date must be after start date' }]
        });
      }
      
      const updatedTask = await Task.update(req.params.id, taskData);
      res.json(updatedTask);
    } catch (error) {
      console.error(`Error updating task with ID ${req.params.id}:`, error);
      
      // More specific error messages based on error types
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        return res.status(400).json({ 
          message: 'Missing required field in task data',
          details: error.sqlMessage
        });
      } else if (error.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ 
          message: 'Field cannot be null',
          details: error.sqlMessage
        });
      } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          message: 'The referenced project or resource does not exist',
          details: error.sqlMessage
        });
      } else if (error.code && error.code.startsWith('ER_')) {
        return res.status(400).json({ 
          message: 'Database error',
          details: error.sqlMessage
        });
      }
      
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  }
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const deleted = await Task.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete task' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`Error deleting task with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
