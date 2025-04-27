import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { validationResult } from 'express-validator';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Sign Up
export const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, name, email, password, preferredLanguage } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });
    
    if (userExists) {
      return res.status(400).json({
        error: userExists.email === email ? 'Email already in use' : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      name,
      email,
      password,
      preferredLanguage
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Server error during signup'
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Server error while fetching user data'
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    console.log('Update profile request body:', req.body); // Debug log

    const allowedUpdates = [
      'name',
      'username',
      'preferredLanguage',
      'bio',
      'location',
      'avatar',
      'interests',
      'socialLinks'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Find user and include password
    let user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Handle password update if provided
    const passwordChanged = req.body.password ? true : false;
    
    if (passwordChanged) {
      console.log('Password change detected'); // Debug log
      user.password = req.body.password;
      // Save to trigger the password hashing middleware
      await user.save();
      console.log('Password updated successfully'); // Debug log
    }

    // Update other fields if there are any
    if (Object.keys(updates).length > 0) {
      console.log('Updating other profile fields:', updates); // Debug log
      
      // Use findByIdAndUpdate for other fields
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      );
    }

    // If password changed, generate new token
    let token;
    if (passwordChanged) {
      token = generateToken(user._id);
      console.log('New token generated after password change'); // Debug log
    }

    res.json({
      success: true,
      user: user.toPublicProfile(),
      ...(passwordChanged && { token })
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Server error during logout'
    });
  }
}; 