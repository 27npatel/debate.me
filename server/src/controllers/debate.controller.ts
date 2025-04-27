import { Request, Response } from 'express';
import { Debate, IDebate } from '../models/debate.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

// Helper function to end a debate
const endDebate = async (debate: IDebate) => {
  debate.status = 'ended';
  debate.endTime = new Date();
  debate.participants.forEach(participant => {
    participant.isActive = false;
    participant.leftAt = new Date();
  });
  await debate.save();
};

// Helper function to check and end expired debates
const checkAndEndExpiredDebates = async () => {
  const activeDebates = await Debate.find({ status: 'active' });
  for (const debate of activeDebates) {
    if (debate.hasEnded()) {
      await endDebate(debate);
    }
  }
};

// Run the check periodically (every minute)
setInterval(checkAndEndExpiredDebates, 60000);

export const createDebate = async (req: Request, res: Response) => {
  try {
    const { title, description, languages, topics, capacity, startTime, timeLimit } = req.body;
    const host = req.user?._id;

    if (!host) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const debate = new Debate({
      title,
      description,
      languages,
      topics,
      capacity,
      host,
      startTime: startTime ? new Date(startTime) : undefined,
      timeLimit,
      status: startTime ? 'scheduled' : 'active'
    });

    await debate.save();
    res.status(201).json({ success: true, debate });
  } catch (error) {
    console.error('Create debate error:', error);
    res.status(500).json({ success: false, message: 'Failed to create debate' });
  }
};

export const getDebates = async (req: Request, res: Response) => {
  try {
    await checkAndEndExpiredDebates(); // Check for expired debates before returning
    const debates = await Debate.find()
      .populate('host', 'name username avatar')
      .populate('participants.user', 'name username avatar')
      .populate('messages.user', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, debates });
  } catch (error) {
    console.error('Get debates error:', error);
    res.status(500).json({ success: false, message: 'Failed to get debates' });
  }
};

export const getDebateById = async (req: Request, res: Response) => {
  try {
    const debate = await Debate.findById(req.params.id)
      .populate('host', 'name username avatar')
      .populate('participants.user', 'name username avatar')
      .populate('messages.user', 'name username avatar');

    if (!debate) {
      return res.status(404).json({ success: false, message: 'Debate not found' });
    }

    res.json({ success: true, debate });
  } catch (error) {
    console.error('Get debate by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to get debate' });
  }
};

export const joinDebate = async (req: Request, res: Response) => {
  try {
    const debate = await Debate.findById(req.params.id);
    const userId = req.user?._id;

    if (!debate || !userId) {
      return res.status(404).json({ success: false, message: 'Debate not found' });
    }

    if (debate.status === 'ended') {
      return res.status(400).json({ success: false, message: 'Debate has ended' });
    }

    if (debate.participants.length >= debate.capacity) {
      return res.status(400).json({ success: false, message: 'Debate is full' });
    }

    const isAlreadyParticipant = debate.participants.some(p => p.user.toString() === userId.toString());
    if (isAlreadyParticipant) {
      return res.status(400).json({ success: false, message: 'Already a participant' });
    }

    debate.participants.push({
      user: userId,
      joinedAt: new Date(),
      isActive: true
    });

    await debate.save();
    res.json({ success: true, debate });
  } catch (error) {
    console.error('Join debate error:', error);
    res.status(500).json({ success: false, message: 'Failed to join debate' });
  }
};

export const leaveDebate = async (req: Request, res: Response) => {
  try {
    const debate = await Debate.findById(req.params.id);
    const userId = req.user?._id;

    if (!debate || !userId) {
      return res.status(404).json({ success: false, message: 'Debate not found' });
    }

    const participant = debate.participants.find(p => p.user.toString() === userId.toString());
    if (!participant) {
      return res.status(400).json({ success: false, message: 'Not a participant' });
    }

    participant.isActive = false;
    participant.leftAt = new Date();

    // If host leaves, end the debate
    if (debate.host.toString() === userId.toString()) {
      await endDebate(debate);
    } else {
      await debate.save();
    }

    res.json({ success: true, debate });
  } catch (error) {
    console.error('Leave debate error:', error);
    res.status(500).json({ success: false, message: 'Failed to leave debate' });
  }
};

export const endDebateController = async (req: Request, res: Response) => {
  try {
    const debate = await Debate.findById(req.params.id)
      .populate('host', 'name username avatar')
      .populate('participants.user', 'name username avatar')
      .populate('messages.user', 'name username avatar');
    const userId = req.user?._id;

    if (!debate || !userId) {
      return res.status(404).json({ success: false, message: 'Debate not found' });
    }

    if (debate.host.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the host can end the debate' });
    }

    if (debate.status === 'ended') {
      return res.status(400).json({ success: false, message: 'Debate is already ended' });
    }

    await endDebate(debate);
    const updatedDebate = await Debate.findById(debate._id)
      .populate('host', 'name username avatar')
      .populate('participants.user', 'name username avatar')
      .populate('messages.user', 'name username avatar');
    res.json({ success: true, debate: updatedDebate });
  } catch (error) {
    console.error('End debate error:', error);
    res.status(500).json({ success: false, message: 'Failed to end debate' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const debate = await Debate.findById(req.params.id);
    const userId = req.user?._id;
    const { text, translatedText } = req.body;

    if (!debate || !userId) {
      return res.status(404).json({ success: false, message: 'Debate not found' });
    }

    if (!debate.canAcceptMessages()) {
      return res.status(400).json({ success: false, message: 'Debate is not accepting messages' });
    }

    const isParticipant = debate.participants.some(p => p.user.toString() === userId.toString() && p.isActive);
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    debate.messages.push({
      user: userId,
      text,
      translatedText,
      timestamp: new Date()
    });

    await debate.save();
    res.json({ success: true, message: debate.messages[debate.messages.length - 1] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// New endpoint to get recent connections
export const getRecentConnections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get debates where user participated in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const debates = await Debate.find({
      'participants.user': userId,
      'participants.joinedAt': { $gte: thirtyDaysAgo },
      status: 'ended'
    })
      .populate('participants.user', 'name username avatar')
      .sort({ 'participants.joinedAt': -1 });

    // Extract unique users from these debates
    const connections = new Map();
    debates.forEach(debate => {
      debate.participants.forEach(participant => {
        const user = participant.user;
        if (user._id.toString() !== userId.toString()) {
          if (!connections.has(user._id.toString())) {
            connections.set(user._id.toString(), {
              user,
              lastInteraction: participant.joinedAt,
              debateCount: 1
            });
          } else {
            const connection = connections.get(user._id.toString());
            connection.debateCount++;
            if (participant.joinedAt > connection.lastInteraction) {
              connection.lastInteraction = participant.joinedAt;
            }
          }
        }
      });
    });

    const recentConnections = Array.from(connections.values())
      .sort((a, b) => b.lastInteraction.getTime() - a.lastInteraction.getTime())
      .slice(0, 10);

    res.json({ success: true, connections: recentConnections });
  } catch (error) {
    console.error('Get recent connections error:', error);
    res.status(500).json({ success: false, message: 'Failed to get recent connections' });
  }
}; 