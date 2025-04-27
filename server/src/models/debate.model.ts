import mongoose, { Schema, Document } from 'mongoose';

export interface IDebateParticipant {
  user: mongoose.Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
}

export interface IDebate extends Document {
  title: string;
  description: string;
  status: 'scheduled' | 'active' | 'ended';
  startTime?: Date;
  endTime?: Date;
  timeLimit?: number; // Time limit in minutes
  host: mongoose.Types.ObjectId;
  languages: string[];
  topics: string[];
  participants: IDebateParticipant[];
  capacity: number;
  messages: {
    user: mongoose.Types.ObjectId;
    text: string;
    translatedText?: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const debateSchema = new Schema<IDebate>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'active', 'ended'],
    default: 'scheduled'
  },
  startTime: { type: Date },
  endTime: { type: Date },
  timeLimit: { type: Number }, // Time limit in minutes
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  languages: [{ type: String }],
  topics: [{ type: String }],
  participants: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    isActive: { type: Boolean, default: true }
  }],
  capacity: { type: Number, required: true },
  messages: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    translatedText: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Add method to check if debate has started
debateSchema.methods.hasStarted = function(): boolean {
  return this.startTime && this.startTime <= new Date();
};

// Add method to check if debate has ended
debateSchema.methods.hasEnded = function(): boolean {
  if (this.status === 'ended') return true;
  if (this.endTime && this.endTime <= new Date()) return true;
  if (this.timeLimit && this.startTime) {
    const endTime = new Date(this.startTime.getTime() + this.timeLimit * 60000);
    return endTime <= new Date();
  }
  return false;
};

// Add method to get remaining time in seconds
debateSchema.methods.getRemainingTime = function(): number | null {
  if (this.status !== 'active' || !this.startTime) return null;
  if (this.timeLimit) {
    const endTime = new Date(this.startTime.getTime() + this.timeLimit * 60000);
    return Math.max(0, Math.floor((endTime.getTime() - new Date().getTime()) / 1000));
  }
  return null;
};

// Add method to check if debate can accept messages
debateSchema.methods.canAcceptMessages = function(): boolean {
  if (this.status === 'ended') return false;
  if (this.status === 'scheduled') return this.hasStarted();
  return true;
};

// Add pre-save middleware to automatically update status
debateSchema.pre('save', function(next) {
  if (this.hasEnded() && this.status !== 'ended') {
    this.status = 'ended';
    this.endTime = new Date();
    this.participants.forEach(participant => {
      participant.isActive = false;
      participant.leftAt = new Date();
    });
  }
  next();
});

export const Debate = mongoose.model<IDebate>('Debate', debateSchema); 