import mongoose from 'mongoose';

const debateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['active', 'ended', 'scheduled', 'cancelled'],
    default: 'active' 
  },
  startTime: Date,
  endTime: Date,
  duration: { type: Number, default: 60 }, // Duration in minutes
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  languages: [String],
  topics: [String],
  participants: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date,
    isActive: { type: Boolean, default: true }
  }],
  capacity: { type: Number, default: 10 },
  messages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    translatedText: String,
    timestamp: { type: Date, default: Date.now },
    isTranslated: { type: Boolean, default: false }
  }],
  settings: {
    allowAnonymous: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: false },
    autoTranslate: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('Debate', debateSchema);
