import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  connectedAt: { type: Date, default: Date.now },
  disconnectedAt: Date,
  duration: Number, // Duration in seconds
  debate: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate' },
  language: String,
  wordsTranslated: { type: Number, default: 0 },
  fluencyScore: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Connection', connectionSchema); 