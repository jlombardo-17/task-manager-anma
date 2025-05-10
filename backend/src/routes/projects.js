const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/project');
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
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('estimated_hours').isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
    body('total_cost').isFloat({ min: 0 }).withMessage('Total cost must be a positive number')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newProject = await Project.create(req.body);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Server error' });
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
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('estimated_hours').isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
    body('total_cost').isFloat({ min: 0 }).withMessage('Total cost must be a positive number')
  ],
  async (req, res) => {
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
      
      const updatedProject = await Project.update(req.params.id, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error(`Error updating project with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
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

module.exports = router;
