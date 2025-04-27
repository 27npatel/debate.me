import Debate from '../models/debate.model.js';
import { io } from '../index.js';
import { debateTimerService } from '../services/debateTimer.service.js';

// Helper function to emit debate updates
const emitDebateUpdate = (debateId, event, data) => {
  io.to(`debate:${debateId}`).emit(event, data);
};

export const getDebates = async (req, res) => {
  try {
    const debates = await Debate.find()
      .populate('host')
      .populate('participants.user')
      .populate('messages.user');
    res.json({ success: true, debates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDebateById = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id)
      .populate('host')
      .populate('participants.user')
      .populate('messages.user');
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });
    res.json({ success: true, debate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createDebate = async (req, res) => {
  try {
    const { title, description, languages, topics, capacity, startTime, duration, settings } = req.body;
    const now = new Date();
    const debateStartTime = startTime ? new Date(startTime) : now;
    
    // Determine initial status based on start time
    const status = debateStartTime > now ? 'scheduled' : 'active';
    
    const debate = await Debate.create({
      title,
      description,
      languages,
      topics,
      capacity,
      startTime: debateStartTime,
      duration: duration || 60, // Default to 60 minutes if not specified
      host: req.user.id,
      status,
      participants: [{
        user: req.user.id,
        joinedAt: now,
        isActive: true
      }],
      settings: settings || {}
    });

    // Start the timer for the debate if it's active
    if (status === 'active') {
      await debateTimerService.startTimer(debate._id);
    }

    res.status(201).json({ success: true, debate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const joinDebate = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });
    
    if (debate.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Debate is not active' });
    }

    const existingParticipant = debate.participants.find(
      p => p.user.toString() === req.user.id && p.isActive
    );
    
    if (existingParticipant) {
      return res.status(400).json({ success: false, error: 'Already joined this debate' });
    }

    if (debate.participants.filter(p => p.isActive).length >= debate.capacity) {
      return res.status(400).json({ success: false, error: 'Debate is full' });
    }

    debate.participants.push({
      user: req.user.id,
      joinedAt: new Date(),
      isActive: true
    });

    await debate.save();
    const populatedDebate = await Debate.findById(debate._id)
      .populate('host')
      .populate('participants.user')
      .populate('messages.user');

    emitDebateUpdate(debate._id, 'participant-joined', {
      participant: populatedDebate.participants[populatedDebate.participants.length - 1]
    });

    res.json({ success: true, debate: populatedDebate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const leaveDebate = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });

    // Check if user is the host
    if (debate.host.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Host cannot leave the debate. Please end the debate instead.' 
      });
    }

    const participant = debate.participants.find(
      p => p.user.toString() === req.user.id && p.isActive
    );

    if (!participant) {
      return res.status(400).json({ success: false, error: 'Not a participant in this debate' });
    }

    participant.isActive = false;
    participant.leftAt = new Date();

    await debate.save();
    const populatedDebate = await Debate.findById(debate._id)
      .populate('host')
      .populate('participants.user')
      .populate('messages.user');

    emitDebateUpdate(debate._id, 'participant-left', {
      participantId: req.user.id
    });

    res.json({ success: true, debate: populatedDebate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, translatedText } = req.body;
    const debate = await Debate.findById(req.params.id);
    
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });
    
    const participant = debate.participants.find(
      p => p.user.toString() === req.user.id && p.isActive
    );

    if (!participant) {
      return res.status(400).json({ success: false, error: 'Not a participant in this debate' });
    }

    const newMessage = {
      user: req.user.id,
      text,
      translatedText,
      isTranslated: !!translatedText,
      timestamp: new Date()
    };

    debate.messages.push(newMessage);
    await debate.save();

    const populatedMessage = await Debate.populate(newMessage, {
      path: 'user',
      model: 'User'
    });

    emitDebateUpdate(debate._id, 'new-message', populatedMessage);

    res.json({ success: true, message: populatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateDebateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const debate = await Debate.findById(req.params.id);
    
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });
    
    if (debate.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can update debate status' });
    }

    debate.status = status;
    await debate.save();

    const populatedDebate = await Debate.findById(debate._id)
      .populate('host')
      .populate('participants.user')
      .populate('messages.user');

    emitDebateUpdate(debate._id, 'status-updated', populatedDebate.status);

    res.json({ success: true, debate: populatedDebate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateDebateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const debate = await Debate.findById(req.params.id);
    
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });
    
    if (debate.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can update debate settings' });
    }

    debate.settings = { ...debate.settings, ...settings };
    await debate.save();

    const populatedDebate = await Debate.findById(debate._id)
      .populate('host')
      .populate('participants.user')
      .populate('messages.user');

    emitDebateUpdate(debate._id, 'settings-updated', populatedDebate.settings);

    res.json({ success: true, debate: populatedDebate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const endDebateController = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ success: false, error: 'Debate not found' });

    if (debate.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can end the debate' });
    }

    if (debate.status === 'ended') {
      return res.status(400).json({ success: false, error: 'Debate is already ended' });
    }

    debate.status = 'ended';
    debate.endTime = new Date();
    debate.participants.forEach(participant => {
      participant.isActive = false;
      participant.leftAt = new Date();
    });

    await debate.save();
    const populatedDebate = await Debate.findById(debate._id)
      .populate('host')
      .populate('participants.user')
      .populate('messages.user');

    emitDebateUpdate(debate._id, 'debate-ended', populatedDebate);

    res.json({ success: true, debate: populatedDebate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRecentConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find debates where the user is a participant
    const debates = await Debate.find({
      'participants.user': userId,
      'participants.isActive': true
    })
    .sort({ 'participants.joinedAt': -1 })
    .limit(10)
    .populate('host')
    .populate('participants.user')
    .populate('messages.user');

    // Format the response
    const recentConnections = debates.map(debate => ({
      debateId: debate._id,
      title: debate.title,
      status: debate.status,
      host: debate.host,
      participants: debate.participants.filter(p => p.isActive),
      lastMessage: debate.messages[debate.messages.length - 1],
      joinedAt: debate.participants.find(p => p.user._id.toString() === userId)?.joinedAt
    }));

    res.json({ success: true, connections: recentConnections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
