const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/client');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/clients
 * @desc    Get all clients
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/clients/:id
 * @desc    Get client by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error(`Error fetching client with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/clients
 * @desc    Create a new client
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email').optional({ nullable: true }),
    body('phone').optional({ nullable: true }),
    body('address').optional({ nullable: true }),
    body('notes').optional({ nullable: true })
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newClient = await Client.create(req.body);
      res.status(201).json(newClient);
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email').optional({ nullable: true }),
    body('phone').optional({ nullable: true }),
    body('address').optional({ nullable: true }),
    body('notes').optional({ nullable: true })
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const client = await Client.findById(req.params.id);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      const updatedClient = await Client.update(req.params.id, req.body);
      res.json(updatedClient);
    } catch (error) {
      console.error(`Error updating client with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const deleted = await Client.delete(req.params.id);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete client' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(`Error deleting client with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
