import express from 'express';
import { getDebates, getDebateById, createDebate } from '../controllers/debate.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getDebates);
router.get('/:id', getDebateById);
router.post('/', protect, createDebate);

export default router;
