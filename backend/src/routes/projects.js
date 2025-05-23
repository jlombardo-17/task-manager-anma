const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/project');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Get actual hours spent
    const actualHours = await Project.calculateActualHours(req.params.id);
    project.actual_hours = actualHours;
    
    // Get resources assigned to the project
    project.resources = await Project.getProjectResources(req.params.id);
    
    res.json(project);
  } catch (error) {
    console.error(`Error fetching project with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/projects/client/:clientId
 * @desc    Get projects by client ID
 * @access  Private
 */
router.get('/client/:clientId', auth, async (req, res) => {
  try {
    const projects = await Project.findByClientId(req.params.clientId);
    res.json(projects);
  } catch (error) {
    console.error(`Error fetching projects for client ID ${req.params.clientId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('client_id').isInt().withMessage('Valid client ID is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required')
      .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.start_date)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('estimated_hours').isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
    body('estimated_cost').isFloat({ min: 0 }).withMessage('Estimated cost must be a positive number'),
    body('budgeted_cost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Budgeted cost must be a positive number if provided')
  ],  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed. Please check your input.', 
        errors: errors.array() 
      });
    }
    
    try {
      // Process the project data
      const projectData = { ...req.body };
      
      // Ensure budgeted_cost is properly handled as optional
      if (projectData.budgeted_cost === '' || projectData.budgeted_cost === undefined) {
        projectData.budgeted_cost = null;
      }
      
      // Check date formats
      if (projectData.start_date) {
        try {
          projectData.start_date = new Date(projectData.start_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ message: 'Invalid start date format' });
        }
      }
      
      if (projectData.end_date) {
        try {
          projectData.end_date = new Date(projectData.end_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
      }
      
      const newProject = await Project.create(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      
      // Manejar diferentes tipos de errores
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        return res.status(400).json({ 
          message: 'Missing required field in project data',
          details: error.sqlMessage
        });
      } else if (error.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ 
          message: 'Field cannot be null',
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
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('client_id').isInt().withMessage('Valid client ID is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required')
      .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.start_date)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('estimated_hours').isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
    body('estimated_cost').isFloat({ min: 0 }).withMessage('Estimated cost must be a positive number'),
    body('budgeted_cost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Budgeted cost must be a positive number if provided'),
    body('actual_cost').isFloat({ min: 0 }).optional().withMessage('Actual cost must be a positive number')
  ],  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors during update:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed. Please check your input.', 
        errors: errors.array() 
      });
    }
    
    try {
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Process the project data
      const projectData = { ...req.body };
      
      // Ensure budgeted_cost is properly handled as optional
      if (projectData.budgeted_cost === '' || projectData.budgeted_cost === undefined) {
        projectData.budgeted_cost = null;
      }
      
      // Check date formats
      if (projectData.start_date) {
        try {
          projectData.start_date = new Date(projectData.start_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ message: 'Invalid start date format' });
        }
      }
      
      if (projectData.end_date) {
        try {
          projectData.end_date = new Date(projectData.end_date).toISOString().split('T')[0];
        } catch (err) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
      }
      
      const updatedProject = await Project.update(req.params.id, projectData);
      res.json(updatedProject);
    } catch (error) {
      console.error(`Error updating project with ID ${req.params.id}:`, error);
      
      // Manejar diferentes tipos de errores
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        return res.status(400).json({ 
          message: 'Missing required field in project data',
          details: error.sqlMessage
        });
      } else if (error.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ 
          message: 'Field cannot be null',
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
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const deleted = await Project.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete project' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(`Error deleting project with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/projects/:id/resources
 * @desc    Get resources assigned to a project
 * @access  Private
 */
router.get('/:id/resources', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const resources = await Project.getProjectResources(req.params.id);
    res.json(resources);
  } catch (error) {
    console.error(`Error fetching resources for project ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/projects/:id/resources
 * @desc    Update resources assigned to a project
 * @access  Private
 */
router.put('/:id/resources', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Remove existing resource assignments
      await connection.query('DELETE FROM project_resources WHERE project_id = ?', [req.params.id]);
      
      // Add new resource assignments
      if (req.body.resources && Array.isArray(req.body.resources)) {
        for (const resource of req.body.resources) {
          await connection.query(
            'INSERT INTO project_resources (project_id, resource_id, assigned_hours) VALUES (?, ?, ?)',
            [req.params.id, resource.id, resource.assigned_hours || 0]
          );
        }
      }
      
      await connection.commit();
      connection.release();
      
      const updatedResources = await Project.getProjectResources(req.params.id);
      res.json(updatedResources);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error(`Error updating resources for project ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/projects/:id/actual-cost
 * @desc    Update actual cost of a project
 * @access  Private
 */
router.put('/:id/actual-cost', auth, [
  body('actual_cost').isFloat({ min: 0 }).withMessage('Actual cost must be a positive number')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const updatedProject = await Project.updateActualCost(req.params.id, req.body.actual_cost);
    res.json(updatedProject);
  } catch (error) {
    console.error(`Error updating actual cost for project ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
