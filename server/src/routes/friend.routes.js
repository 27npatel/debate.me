import express from 'express';
import { 
  sendFriendRequest, 
  getFriendRequests, 
  acceptFriendRequest, 
  declineFriendRequest,
  getFriends,
  getAllUsers,
  removeFriend
} from '../controllers/friend.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Friend list and suggestions
router.get('/', protect, getFriends);
router.get('/users', protect, getAllUsers);

// Friend requests
router.post('/request', protect, sendFriendRequest);
router.get('/requests', protect, getFriendRequests);
router.post('/accept', protect, acceptFriendRequest);
router.post('/decline', protect, declineFriendRequest);

// Friend management
router.post('/remove', protect, removeFriend);

export default router; 