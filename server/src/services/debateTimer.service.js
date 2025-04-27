import Debate from '../models/debate.model.js';
import { io } from '../index.js';

class DebateTimerService {
  constructor() {
    this.timers = new Map();
  }

  async startTimer(debateId) {
    const debate = await Debate.findById(debateId);
    if (!debate || debate.status !== 'active') return;

    const endTime = new Date(debate.startTime.getTime() + debate.duration * 60000);
    const timeLeft = endTime - Date.now();

    if (timeLeft <= 0) {
      await this.endDebate(debateId);
      return;
    }

    const timer = setTimeout(async () => {
      await this.endDebate(debateId);
    }, timeLeft);

    this.timers.set(debateId, timer);
  }

  async endDebate(debateId) {
    const debate = await Debate.findById(debateId);
    if (!debate || debate.status === 'ended') return;

    debate.status = 'ended';
    debate.endTime = new Date();
    await debate.save();

    io.to(`debate:${debateId}`).emit('debate-ended', {
      debateId,
      endTime: debate.endTime
    });

    this.timers.delete(debateId);
  }

  cancelTimer(debateId) {
    const timer = this.timers.get(debateId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(debateId);
    }
  }
}

export const debateTimerService = new DebateTimerService(); 