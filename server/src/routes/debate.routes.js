import express from 'express';
import { 
  getDebates, 
  getDebateById, 
  createDebate,
  joinDebate,
  leaveDebate,
  sendMessage,
  updateDebateStatus,
  updateDebateSettings
} from '../controllers/debate.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getDebates);
router.get('/:id', getDebateById);
router.post('/', protect, createDebate);
router.post('/:id/join', protect, joinDebate);
router.post('/:id/leave', protect, leaveDebate);
router.post('/:id/messages', protect, sendMessage);
router.patch('/:id/status', protect, updateDebateStatus);
router.patch('/:id/settings', protect, updateDebateSettings);

export default router;
