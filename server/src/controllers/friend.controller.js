import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = req.user.id;

    // Validate user IDs
    if (!mongoose.Types.ObjectId.isValid(toUserId) || !mongoose.Types.ObjectId.isValid(fromUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ success: false, error: 'Cannot send request to yourself' });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Convert to ObjectId for comparison
    const toUserIdObj = new mongoose.Types.ObjectId(toUserId);
    const fromUserIdObj = new mongoose.Types.ObjectId(fromUserId);

    // Check if already friends
    if (fromUser.friends.some(id => id.equals(toUserIdObj))) {
      return res.status(400).json({ success: false, error: 'Already friends' });
    }

    // Check if request already exists
    if (toUser.friendRequests.some(id => id.equals(fromUserIdObj)) || 
        fromUser.sentRequests.some(id => id.equals(toUserIdObj))) {
      return res.status(400).json({ success: false, error: 'Request already sent' });
    }

    // Add the request
    toUser.friendRequests.push(fromUserIdObj);
    fromUser.sentRequests.push(toUserIdObj);

    await Promise.all([toUser.save(), fromUser.save()]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Send friend request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get incoming and outgoing friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequests sentRequests');
    res.json({ success: true, incoming: user.friendRequests, outgoing: user.sentRequests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { fromUserId } = req.body;
    const toUserId = req.user.id;

    // Validate user IDs
    if (!mongoose.Types.ObjectId.isValid(fromUserId) || !mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const toUser = await User.findById(toUserId);
    const fromUser = await User.findById(fromUserId);

    if (!toUser || !fromUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Convert to ObjectId for comparison
    const fromUserIdObj = new mongoose.Types.ObjectId(fromUserId);
    const toUserIdObj = new mongoose.Types.ObjectId(toUserId);

    // Check if request exists
    if (!toUser.friendRequests.some(id => id.equals(fromUserIdObj))) {
      return res.status(400).json({ success: false, error: 'No such request' });
    }

    // Remove from requests and add to friends
    toUser.friendRequests = toUser.friendRequests.filter(id => !id.equals(fromUserIdObj));
    fromUser.sentRequests = fromUser.sentRequests.filter(id => !id.equals(toUserIdObj));
    
    toUser.friends.push(fromUserIdObj);
    fromUser.friends.push(toUserIdObj);

    await Promise.all([toUser.save(), fromUser.save()]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Accept friend request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Decline a friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const { fromUserId } = req.body;
    const toUserId = req.user.id;

    // Validate user IDs
    if (!mongoose.Types.ObjectId.isValid(fromUserId) || !mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const toUser = await User.findById(toUserId);
    const fromUser = await User.findById(fromUserId);

    if (!toUser || !fromUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Convert to ObjectId for comparison
    const fromUserIdObj = new mongoose.Types.ObjectId(fromUserId);
    const toUserIdObj = new mongoose.Types.ObjectId(toUserId);

    // Remove from requests
    toUser.friendRequests = toUser.friendRequests.filter(id => !id.equals(fromUserIdObj));
    fromUser.sentRequests = fromUser.sentRequests.filter(id => !id.equals(toUserIdObj));

    await Promise.all([toUser.save(), fromUser.save()]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Decline friend request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user's friends
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username name email preferredLanguage avatar bio location interests socialLinks rating debateStats');
    res.json({ success: true, friends: user.friends });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all users (for suggestions)
export const getAllUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find(
      { _id: { $ne: currentUser._id } },
      'username name email preferredLanguage avatar bio location interests socialLinks rating debateStats'
    );
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Remove a friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;
    
    // Validate user IDs
    if (!mongoose.Types.ObjectId.isValid(friendId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    
    if (!user || !friend) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Convert to ObjectId for comparison
    const friendIdObj = new mongoose.Types.ObjectId(friendId);
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    if (!user.friends.some(id => id.equals(friendIdObj))) {
      return res.status(400).json({ success: false, error: 'Not friends' });
    }
    
    user.friends = user.friends.filter(id => !id.equals(friendIdObj));
    friend.friends = friend.friends.filter(id => !id.equals(userIdObj));
    
    await Promise.all([user.save(), friend.save()]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Remove friend error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}; 