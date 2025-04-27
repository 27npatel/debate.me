import express from 'express';
import { body } from 'express-validator';
import { signup, login, getCurrentUser, updateProfile, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('preferredLanguage')
    .isIn(['en', 'es', 'fr', 'de', 'zh', 'ar', 'hi', 'ru', 'pt', 'ja'])
    .withMessage('Please select a valid language')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('preferredLanguage')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'zh', 'ar', 'hi', 'ru', 'pt', 'ja'])
    .withMessage('Please select a valid language'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('location')
    .optional()
    .trim(),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('socialLinks.twitter')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid Twitter URL'),
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid LinkedIn URL'),
  body('socialLinks.website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid website URL')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, profileUpdateValidation, updateProfile);
router.post('/logout', protect, logout);

export default router; 