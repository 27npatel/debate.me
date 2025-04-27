import User from '../models/user.model.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 