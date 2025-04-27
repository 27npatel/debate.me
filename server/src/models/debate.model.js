import mongoose from 'mongoose';

const debateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'active' },
  startTime: Date,
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  languages: [String],
  topics: [String],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  capacity: { type: Number, default: 10 },
  messages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    translatedText: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Debate', debateSchema);
