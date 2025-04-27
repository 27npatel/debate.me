import express from 'express';
import {
  createDebate,
  getDebates,
  getDebateById,
  joinDebate,
  leaveDebate,
  endDebateController,
  sendMessage,
  getRecentConnections
} from '../controllers/debate.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getDebates);
router.get('/:id', getDebateById);

// Protected routes
router.post('/', protect, createDebate);
router.post('/:id/join', protect, joinDebate);
router.post('/:id/leave', protect, leaveDebate);
router.post('/:id/end', protect, endDebateController);
router.post('/:id/messages', protect, sendMessage);
router.get('/connections/recent', protect, getRecentConnections);

export default router;
