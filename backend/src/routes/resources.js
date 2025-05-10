const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/resource');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/resources
 * @desc    Get all resources
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const resources = await Resource.findAll();
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/resources/:id
 * @desc    Get resource by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error(`Error fetching resource with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/resources/role/:role
 * @desc    Get resources by role
 * @access  Private
 */
router.get('/role/:role', auth, async (req, res) => {
  try {
    const resources = await Resource.findByRole(req.params.role);
    res.json(resources);
  } catch (error) {
    console.error(`Error fetching resources with role ${req.params.role}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/resources
 * @desc    Create a new resource
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('role').not().isEmpty().withMessage('Role is required'),
    body('hourly_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
    body('email').isEmail().withMessage('Please include a valid email').optional({ nullable: true }),
    body('phone').optional({ nullable: true }),
    body('availability').isInt({ min: 0, max: 100 }).withMessage('Availability must be between 0 and 100').optional()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newResource = await Resource.create(req.body);
      res.status(201).json(newResource);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/resources/:id
 * @desc    Update resource
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('role').not().isEmpty().withMessage('Role is required'),
    body('hourly_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
    body('email').isEmail().withMessage('Please include a valid email').optional({ nullable: true }),
    body('phone').optional({ nullable: true }),
    body('availability').isInt({ min: 0, max: 100 }).withMessage('Availability must be between 0 and 100').optional()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const resource = await Resource.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      const updatedResource = await Resource.update(req.params.id, req.body);
      res.json(updatedResource);
    } catch (error) {
      console.error(`Error updating resource with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete resource
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    const deleted = await Resource.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete resource' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error(`Error deleting resource with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
