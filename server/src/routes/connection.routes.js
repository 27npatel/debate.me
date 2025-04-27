import express from 'express';
import {
  getRecentConnections,
  getUserConnections,
  createConnection,
  updateConnection
} from '../controllers/connection.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get recent connections
router.get('/', protect, getRecentConnections);

// Get user's connections
router.get('/user/:userId', protect, getUserConnections);

// Create new connection
router.post('/', protect, createConnection);

// Update connection (disconnect, update stats)
router.put('/:connectionId', protect, updateConnection);

export default router; 