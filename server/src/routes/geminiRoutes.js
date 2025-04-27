import express from 'express';
import geminiController from '../controllers/geminiController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Initialize AI chat for a debate channel
router.post('/chat/initialize', geminiController.initializeChat);

// Generate debate questions
router.post('/questions/generate', geminiController.generateQuestions);

// Process a message with AI assistance
router.post('/message/process', geminiController.processMessage);

// Moderate content
router.post('/content/moderate', geminiController.moderateContent);

// Generate counter-arguments
router.post('/arguments/counter', geminiController.generateCounterArguments);

// Clear chat history
router.delete('/chat/:channelId', geminiController.clearChatHistory);

export default router; 