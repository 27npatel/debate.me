import Connection from '../models/connection.model.js';
import User from '../models/user.model.js';

export const getRecentConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'friends',
      select: 'name username avatar lastActive',
      options: { sort: { lastActive: -1 }, limit: 3 }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, connections: user.friends });
  } catch (err) {
    console.error('Get recent connections error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    const connections = await Connection.find({ user: userId })
      .sort({ connectedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('debate');

    res.json({ success: true, connections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createConnection = async (req, res) => {
  try {
    const { debateId, language } = req.body;
    const connection = await Connection.create({
      user: req.user.id,
      debate: debateId,
      language,
      connectedAt: new Date()
    });

    res.status(201).json({ success: true, connection });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { wordsTranslated, fluencyScore } = req.body;
    
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ success: false, error: 'Connection not found' });
    }

    if (connection.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this connection' });
    }

    connection.disconnectedAt = new Date();
    connection.duration = Math.floor((connection.disconnectedAt - connection.connectedAt) / 1000);
    
    if (wordsTranslated !== undefined) {
      connection.wordsTranslated = wordsTranslated;
    }
    
    if (fluencyScore !== undefined) {
      connection.fluencyScore = fluencyScore;
    }

    await connection.save();
    res.json({ success: true, connection });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 